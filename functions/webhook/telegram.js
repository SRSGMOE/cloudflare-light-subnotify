// Cloudflare Pages Functions - Telegram Webhook 处理

// 命令冷却时间记录（内存缓存，重启后重置）
const commandCooldowns = {};
const COOLDOWN_MS = 5 * 60 * 1000; // 5分钟

function isOnCooldown(chatId, command) {
  const key = `${chatId}_${command}`;
  const now = Date.now();
  const lastTime = commandCooldowns[key] || 0;
  if (now - lastTime < COOLDOWN_MS) {
    return true;
  }
  commandCooldowns[key] = now;
  return false;
}

function getCooldownRemaining(chatId, command) {
  const key = `${chatId}_${command}`;
  const now = Date.now();
  const lastTime = commandCooldowns[key] || 0;
  const remaining = COOLDOWN_MS - (now - lastTime);
  return Math.ceil(remaining / 1000);
}

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
    const text = update.message.text.trim();
    
    // 获取Telegram设置
    let botToken = '';
    try {
      const { results: tokenResults } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='telegram_config'"
      ).all();
      if (tokenResults.length > 0 && tokenResults[0].value) {
        const config = JSON.parse(tokenResults[0].value);
        botToken = config.bot_token || '';
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
    
    // 只处理 /start 和 /status 命令
    if (text === '/start') {
      if (isOnCooldown(chatId, 'start')) {
        const remaining = getCooldownRemaining(chatId, 'start');
        await sendMessage('⏳ 命令冷却中，请等待 ' + remaining + ' 秒后再试');
      } else {
        await sendMessage(
          '🤖 Cloudflare Light Subnotify\n\n' +
          '欢迎使用订阅通知系统！\n\n' +
          '可用命令：\n' +
          '/start - 开始使用\n' +
          '/status - 查看系统状态\n\n' +
          '项目地址: https://github.com/SRSGMOE/cloudflare-light-subnotify'
        );
      }
    } else if (text === '/status') {
      if (isOnCooldown(chatId, 'status')) {
        const remaining = getCooldownRemaining(chatId, 'status');
        await sendMessage('⏳ 命令冷却中，请等待 ' + remaining + ' 秒后再试');
      } else {
        try {
          const { results: totalResults } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM subscriptions'
          ).all();
          const { results: activeResults } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM subscriptions WHERE is_active=1'
          ).all();
          const { results: pausedResults } = await env.DB.prepare(
            'SELECT COUNT(*) as count FROM subscriptions WHERE is_active=0'
          ).all();
          
          const now = new Date();
          await sendMessage(
            '⚙️ 系统状态\n\n' +
            '📂 订阅总数: ' + (totalResults[0]?.count || 0) + ' 个\n' +
            '🔥 活跃订阅: ' + (activeResults[0]?.count || 0) + ' 个\n' +
            '🚫 停止订阅: ' + (pausedResults[0]?.count || 0) + ' 个\n\n' +
            '🌏 世界时钟: ' + formatDateTime(now, 0) + '\n' +
            '🇨🇳 北京时间: ' + formatDateTime(now, 8) + '\n' +
            '🇺🇸 美国东部: ' + formatDateTime(now, -4)
          );
        } catch (e) {
          await sendMessage('❌ 获取状态失败，请检查数据库配置');
        }
      }
    }
    // 忽略其他命令
    
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