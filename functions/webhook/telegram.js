// Cloudflare Pages Functions - Telegram Webhook 处理

export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response('OK');
  }
  
  try {
    const update = await request.json();
    if (!update.message || !update.message.text) {
      return new Response('OK');
    }
    
    const chatId = update.message.chat.id;
    const text = update.message.text;
    
    // 获取Telegram设置
    let botToken = '';
    try {
      const { results: tokenResults } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='telegram_bot_token'"
      ).all();
      if (tokenResults.length > 0 && tokenResults[0].value) {
        botToken = tokenResults[0].value;
      }
    } catch (e) {}
    
    if (!botToken) {
      return new Response('OK');
    }
    
    const sendMessage = async (msg) => {
      await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: msg })
      });
    };
    
    if (text === '/start' || text === '/help') {
      await sendMessage('Cloudflare Light Subnotify\n\n可用命令:\n/start - 开始使用\n/help - 查看帮助\n/list - 查看订阅列表\n/today - 查看今日待通知\n/status - 查看系统状态');
    } else if (text === '/list') {
      const { results } = await env.DB.prepare('SELECT * FROM subscriptions WHERE is_active=1 ORDER BY next_notify_date ASC').all();
      if (results.length === 0) {
        await sendMessage('暂无订阅');
      } else {
        const tzMap = { 'UTC': 'UTC+0', 'CST': 'UTC+8', 'ET': 'UTC-4' };
        let msg = '订阅列表:\n\n';
        results.forEach((s, i) => {
          msg += (i + 1) + '. ' + s.name + '\n   ' + s.next_notify_date + ' ' + (s.cycle_hour || '09') + ':' + (s.cycle_minute || '00') + ' (' + (tzMap[s.timezone] || 'UTC+0') + ')\n\n';
        });
        await sendMessage(msg);
      }
    } else if (text === '/today') {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const { results } = await env.DB.prepare(
        'SELECT * FROM subscriptions WHERE next_notify_date<=? AND is_active=1 ORDER BY next_notify_date ASC'
      ).bind(today).all();
      if (results.length === 0) {
        await sendMessage('今日无待通知');
      } else {
        const tzMap = { 'UTC': 'UTC+0', 'CST': 'UTC+8', 'ET': 'UTC-4' };
        let msg = '今日待通知:\n\n';
        results.forEach((s, i) => {
          msg += (i + 1) + '. ' + s.name + ' ' + (s.cycle_hour || '09') + ':' + (s.cycle_minute || '00') + ' (' + (tzMap[s.timezone] || 'UTC+0') + ')\n';
        });
        await sendMessage(msg);
      }
    } else if (text === '/status') {
      const { results: subs } = await env.DB.prepare('SELECT COUNT(*) as count FROM subscriptions WHERE is_active=1').all();
      const now = new Date();
      await sendMessage(
        '系统状态\n\n' +
        '世界时钟: ' + formatDateTime(now, 0) + '\n' +
        '北京时间: ' + formatDateTime(now, 8) + '\n' +
        '美国东部: ' + formatDateTime(now, -4) + '\n' +
        '活跃订阅: ' + subs[0].count + ' 个'
      );
    }
    
    return new Response('OK');
  } catch (error) {
    return new Response('OK');
  }
}

function formatDateTime(date, offsetHours) {
  const local = new Date(date.getTime() + offsetHours * 3600000);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, '0');
  const day = String(local.getUTCDate()).padStart(2, '0');
  const hours = String(local.getUTCHours()).padStart(2, '0');
  const minutes = String(local.getUTCMinutes()).padStart(2, '0');
  const seconds = String(local.getUTCSeconds()).padStart(2, '0');
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}