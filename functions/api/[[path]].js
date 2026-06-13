// Cloudflare Pages Functions - API 路由处理

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '') || '/';
  const method = request.method;
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const json = (data, status) => new Response(JSON.stringify(data), { 
    status: status || 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
  
  try {
    // 检查数据库绑定
    if (!env.DB) {
      return json({ error: '数据库未绑定' }, 500);
    }
    
    // 初始化数据库
    await initDB(env.DB);
    
    // 认证相关
    if (path === '/auth/status') {
      return json({ requireAuth: !!env.ADMIN_PASSWORD });
    }
    
    if (path === '/login' && method === 'POST') {
      const body = await request.json();
      if (!env.ADMIN_PASSWORD) {
        return json({ success: true, token: 'no-auth' });
      }
      if (body.username === env.ADMIN_USERNAME && body.password === env.ADMIN_PASSWORD) {
        return json({ success: true, token: generateToken(env.ADMIN_PASSWORD) });
      }
      return json({ success: false, error: '用户名或密码错误' }, 401);
    }
    
    if (path === '/auth/verify' && method === 'POST') {
      const body = await request.json();
      if (!env.ADMIN_PASSWORD) {
        return json({ valid: true });
      }
      return json({ valid: body.token === generateToken(env.ADMIN_PASSWORD) });
    }
    
    if (path === '/server-time') {
      const now = new Date();
      return json({
        utc: now.toISOString(),
        timestamp: now.getTime()
      });
    }
    
    // 需要认证的接口
    if (env.ADMIN_PASSWORD) {
      const authHeader = request.headers.get('Authorization');
      const token = authHeader ? authHeader.replace('Bearer ', '') : '';
      if (token !== generateToken(env.ADMIN_PASSWORD)) {
        return json({ error: '未授权' }, 401);
      }
    }
    
    // Telegram设置
    if (path === '/telegram-settings' && method === 'GET') {
      const { results } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='telegram_config'"
      ).all();
      if (results.length > 0) {
        try {
          return json(JSON.parse(results[0].value));
        } catch (e) {
          return json({ enabled: false, chats: [] });
        }
      }
      return json({ enabled: false, chats: [] });
    }
    
    if (path === '/telegram-settings' && method === 'POST') {
      const body = await request.json();
      await env.DB.prepare(
        "INSERT OR REPLACE INTO notify_settings (key, value) VALUES ('telegram_config', ?)"
      ).bind(JSON.stringify(body)).run();
      
      // 注册命令和设置Webhook
      if (body.enabled && body.bot_token && body.chats && body.chats.length > 0) {
        try {
          await fetch('https://api.telegram.org/bot' + body.bot_token + '/setMyCommands', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              commands: [
                { command: 'start', description: '开始使用' },
                { command: 'help', description: '查看帮助' },
                { command: 'list', description: '查看订阅列表' },
                { command: 'today', description: '查看今日待通知' },
                { command: 'status', description: '查看系统状态' }
              ]
            })
          });
          // 设置Webhook
          const host = request.headers.get('host') || '';
          const protocol = request.headers.get('x-forwarded-proto') || 'https';
          const webhookUrl = protocol + '://' + host + '/webhook/telegram';
          await fetch('https://api.telegram.org/bot' + body.bot_token + '/setWebhook', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: webhookUrl })
          });
        } catch (e) {}
      }
      return json({ success: true });
    }
    
    // 测试Telegram
    if (path === '/test-telegram' && method === 'POST') {
      const body = await request.json();
      const botToken = body.bot_token || '';
      const chatId = body.chat_id || '';
      const message = body.message || '测试通知';
      if (!botToken || !chatId) {
        return json({ success: false, error: '请提供Bot Token和Chat ID' });
      }
      // 注册命令
      await fetch('https://api.telegram.org/bot' + botToken + '/setMyCommands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'start', description: '开始使用' },
            { command: 'help', description: '查看帮助' },
            { command: 'list', description: '查看订阅列表' },
            { command: 'today', description: '查看今日待通知' },
            { command: 'status', description: '查看系统状态' }
          ]
        })
      });
      // 设置Webhook
      const host = request.headers.get('host') || '';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const webhookUrl = protocol + '://' + host + '/webhook/telegram';
      await fetch('https://api.telegram.org/bot' + botToken + '/setWebhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl })
      });
      // 发送测试消息
      const res = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });
      const data = await res.json();
      return json({ success: data.ok, error: data.description });
    }
    
    // 订阅CRUD
    if (path === '/subscriptions' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM subscriptions ORDER BY next_notify_date').all();
      return json(results);
    }
    
    if (path === '/subscriptions' && method === 'POST') {
      const body = await request.json();
      if (!body.name || !body.content || !body.cycle_type || !body.timezone) {
        return json({ error: '所有必填字段都需要填写' }, 400);
      }
      const nextDate = calculateNextDate(body.cycle_type, body.cycle_value, body.cycle_hour + ':' + (body.cycle_minute || '00'), body.timezone, null, true);
      const notifyChannels = body.notify_channels || '[]';
      await env.DB.prepare(
        'INSERT INTO subscriptions (name,content,cycle_type,cycle_value,cycle_hour,cycle_minute,timezone,next_notify_date,notify_channels) VALUES (?,?,?,?,?,?,?,?,?)'
      ).bind(body.name, body.content, body.cycle_type, body.cycle_value || '', body.cycle_hour || '09', body.cycle_minute || '00', body.timezone || 'UTC', nextDate, notifyChannels).run();
      return json({ success: true }, 201);
    }
    
    const subMatch = path.match(/^\/subscriptions\/(\d+)$/);
    if (subMatch) {
      const id = subMatch[1];
      if (method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM subscriptions WHERE id=?').bind(id).all();
        return results.length ? json(results[0]) : json({ error: '订阅不存在' }, 404);
      }
      if (method === 'PUT') {
        const body = await request.json();
        let sql = "UPDATE subscriptions SET updated_at=datetime('now')";
        const params = [];
        if (body.name !== undefined) { sql += ',name=?'; params.push(body.name); }
        if (body.content !== undefined) { sql += ',content=?'; params.push(body.content); }
        if (body.cycle_type !== undefined) { sql += ',cycle_type=?'; params.push(body.cycle_type); }
        if (body.cycle_value !== undefined) { sql += ',cycle_value=?'; params.push(body.cycle_value); }
        if (body.cycle_hour !== undefined) { sql += ',cycle_hour=?'; params.push(body.cycle_hour); }
        if (body.cycle_minute !== undefined) { sql += ',cycle_minute=?'; params.push(body.cycle_minute); }
        if (body.timezone !== undefined) { sql += ',timezone=?'; params.push(body.timezone); }
        if (body.is_active !== undefined) { sql += ',is_active=?'; params.push(body.is_active ? 1 : 0); }
        if (body.notify_channels !== undefined) { sql += ',notify_channels=?'; params.push(body.notify_channels); }
        if (body.cycle_type) {
          sql += ',next_notify_date=?';
          params.push(calculateNextDate(body.cycle_type, body.cycle_value, body.cycle_hour + ':' + (body.cycle_minute || '00'), body.timezone, null, true));
        }
        sql += ' WHERE id=?';
        params.push(id);
        await env.DB.prepare(sql).bind(...params).run();
        return json({ success: true });
      }
      if (method === 'DELETE') {
        await env.DB.prepare('DELETE FROM subscriptions WHERE id=?').bind(id).run();
        return json({ success: true });
      }
    }
    
    // 通知设置
    if (path === '/notify-settings' && method === 'GET') {
      const { results } = await env.DB.prepare("SELECT * FROM notify_settings WHERE key='title'").all();
      return json({ title: results.length > 0 ? results[0].value : '订阅到期提醒' });
    }
    
    if (path === '/notify-settings' && method === 'POST') {
      const body = await request.json();
      await env.DB.prepare(
        "INSERT OR REPLACE INTO notify_settings (key, value) VALUES ('title', ?)"
      ).bind(body.title || '订阅到期提醒').run();
      return json({ success: true });
    }
    
    // 测试通知
    if (path === '/test-notify' && method === 'POST') {
      const body = await request.json();
      const title = body.title || '订阅到期提醒';
      const { results: tokenResults } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='telegram_bot_token'"
      ).all();
      const { results: chatResults } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='telegram_chat_id'"
      ).all();
      const botToken = tokenResults.length > 0 ? tokenResults[0].value : '';
      const chatId = chatResults.length > 0 ? chatResults[0].value : '';
      if (!botToken || !chatId) {
        return json({ success: false, error: '请先配置Telegram Bot' });
      }
      const message = '📢 ' + title + String.fromCharCode(10) + String.fromCharCode(10) + 
        '📦 订阅名称：示例订阅' + String.fromCharCode(10) +
        '🔖 订阅内容：这是订阅内容示例' + String.fromCharCode(10) +
        '🌏 当前时区：北京时间 UTC+8' + String.fromCharCode(10) +
        '📮 通知周期：每周五 14:30' + String.fromCharCode(10) +
        '📆 下次通知：2024-01-12 14:30';
      const res = await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message })
      });
      const data = await res.json();
      return json({ success: data.ok, error: data.description });
    }
    
    // 邮件设置
    if (path === '/email-settings' && method === 'GET') {
      const { results } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='email_config'"
      ).all();
      if (results.length > 0) {
        try {
          return json(JSON.parse(results[0].value));
        } catch (e) {
          return json({ enabled: false, smtp: {}, receivers: [] });
        }
      }
      return json({ enabled: false, smtp: {}, receivers: [] });
    }
    
    if (path === '/email-settings' && method === 'POST') {
      const body = await request.json();
      await env.DB.prepare(
        "INSERT OR REPLACE INTO notify_settings (key, value) VALUES ('email_config', ?)"
      ).bind(JSON.stringify(body)).run();
      return json({ success: true });
    }
    
    // 测试邮件
    if (path === '/test-email' && method === 'POST') {
      // 获取邮件设置
      const { results } = await env.DB.prepare("SELECT * FROM notify_settings WHERE key LIKE 'email_%'").all();
      const settings = {};
      results.forEach(r => {
        settings[r.key.replace('email_', '')] = r.value;
      });
      
      if (!settings.smtp_host || !settings.smtp_user || !settings.email_to) {
        return json({ success: false, error: '请先配置邮件设置' });
      }
      
      // 注意：Cloudflare Workers 不支持直接发送邮件
      // 这里只是返回成功，实际发送需要使用外部邮件服务
      // 可以集成 SendGrid、Mailgun 等服务
      return json({ 
        success: true, 
        message: '测试邮件功能需要配置外部邮件服务（如 SendGrid、Mailgun）' 
      });
    }
    
    // 喵提醒设置
    if (path === '/miao-settings' && method === 'GET') {
      const { results } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='miao_config'"
      ).all();
      if (results.length > 0) {
        try {
          return json(JSON.parse(results[0].value));
        } catch (e) {
          return json({ enabled: false, codes: [] });
        }
      }
      return json({ enabled: false, codes: [] });
    }
    
    if (path === '/miao-settings' && method === 'POST') {
      const body = await request.json();
      await env.DB.prepare(
        "INSERT OR REPLACE INTO notify_settings (key, value) VALUES ('miao_config', ?)"
      ).bind(JSON.stringify(body)).run();
      return json({ success: true });
    }
    
    // 测试喵提醒
    if (path === '/test-miao' && method === 'POST') {
      const body = await request.json();
      const code = body.code || '';
      const message = body.message || '测试通知';
      
      if (!code) {
        return json({ success: false, error: '请提供喵码' });
      }
      
      try {
        const res = await fetch('https://miaotixing.com/trigger?id=' + code + '&text=' + encodeURIComponent(message) + '&type=json');
        const data = await res.json();
        return json({ success: data.code === 0 || data.code === 200, error: data.msg || '' });
      } catch (error) {
        return json({ success: false, error: error.message });
      }
    }
    
    // 手动触发通知检查
    // 安全机制：通过随机路径前缀访问
    // 完整路径：/{API_PREFIX}/api/check-notifications
    // API_PREFIX 在 Pages 环境变量中配置（Secret 类型）
    //
    // 中间件会自动移除随机前缀，此代码只需处理实际的 check-notifications 请求
    if (path === '/check-notifications' && method === 'POST') {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // 获取所有到期的订阅
      const { results } = await env.DB.prepare(
        'SELECT * FROM subscriptions WHERE next_notify_date<=? AND is_active=1'
      ).bind(today).all();
      
      let sent = 0;
      for (const sub of results) {
        try {
          const { results: tokenResults } = await env.DB.prepare(
            "SELECT value FROM notify_settings WHERE key='telegram_bot_token'"
          ).all();
          const { results: chatResults } = await env.DB.prepare(
            "SELECT value FROM notify_settings WHERE key='telegram_chat_id'"
          ).all();
          
          const botToken = tokenResults.length > 0 ? tokenResults[0].value : '';
          const chatId = chatResults.length > 0 ? chatResults[0].value : '';
          
          if (!botToken || !chatId) continue;
          
          // 获取通知标题
          const { results: titleResults } = await env.DB.prepare(
            "SELECT value FROM notify_settings WHERE key='title'"
          ).all();
          const notifyTitle = titleResults.length > 0 ? titleResults[0].value : '订阅到期提醒';
          
          // 计算下一个通知日期
          const nextDate = calculateNextDate(
            sub.cycle_type, 
            sub.cycle_value, 
            sub.cycle_hour + ':' + (sub.cycle_minute || '00'), 
            sub.timezone, 
            sub.next_notify_date
          );
          
          // 构建通知消息
          const tzLabels = { 'UTC': '世界协调时 UTC', 'CST': '北京时间 UTC+8', 'ET': '美国东部 UTC-4' };
          const cycleLabels = {
            daily: '每日',
            weekly: '每周',
            monthly: '每月',
            yearly: '每年',
            specific: sub.cycle_value,
          };
          const days = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
          let cycleText = cycleLabels[sub.cycle_type] || sub.cycle_type;
          if (sub.cycle_type === 'weekly') cycleText += days[parseInt(sub.cycle_value)] || '';
          if (sub.cycle_type === 'monthly') cycleText += sub.cycle_value + '日';
          if (sub.cycle_type === 'yearly') {
            const parts = (sub.cycle_value || '1-1').split('-');
            cycleText = '每年' + parts[0] + '月' + parts[1] + '日';
          }
          
          const message = '📢 ' + notifyTitle + String.fromCharCode(10) + String.fromCharCode(10) +
            '📦 订阅名称：' + sub.name + String.fromCharCode(10) +
            '🔖 订阅内容：' + sub.content + String.fromCharCode(10) +
            '🌏 当前时区：' + (tzLabels[sub.timezone] || sub.timezone) + String.fromCharCode(10) +
            '📮 通知周期：' + cycleText + ' ' + (sub.cycle_hour || '09') + ':' + (sub.cycle_minute || '00') + String.fromCharCode(10) +
            '📆 下次通知：' + nextDate + ' ' + (sub.cycle_hour || '09') + ':' + (sub.cycle_minute || '00');
          
          // 发送通知
          await fetch('https://api.telegram.org/bot' + botToken + '/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message })
          });
          
          // 更新下次通知日期
          if (sub.cycle_type !== 'specific') {
            await env.DB.prepare('UPDATE subscriptions SET next_notify_date=? WHERE id=?')
              .bind(nextDate, sub.id).run();
          } else {
            // 指定日期通知完成后自动暂停
            await env.DB.prepare('UPDATE subscriptions SET is_active=0 WHERE id=?')
              .bind(sub.id).run();
          }
          
          sent++;
        } catch (e) {
          console.error('发送通知失败:', e);
        }
      }
      
      return json({ success: true, checked: results.length, sent });
    }
    
    return json({ error: 'API路由未找到' }, 404);
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}

// 数据库初始化
async function initDB(db) {
  try {
    const { results } = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='subscriptions'"
    ).all();
    if (results.length === 0) {
      await db.prepare(`CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        cycle_type TEXT NOT NULL,
        cycle_value TEXT,
        cycle_hour TEXT DEFAULT '09',
        cycle_minute TEXT DEFAULT '00',
        timezone TEXT DEFAULT 'UTC',
        next_notify_date TEXT NOT NULL,
        notify_channels TEXT DEFAULT '[]',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        is_active INTEGER DEFAULT 1
      )`).run();
    }
    // 确保 notify_channels 字段存在（兼容旧数据库）
    try {
      const { results: columns } = await db.prepare("PRAGMA table_info(subscriptions)").all();
      const columnNames = columns.map(c => c.name);
      if (!columnNames.includes('notify_channels')) {
        await db.prepare("ALTER TABLE subscriptions ADD COLUMN notify_channels TEXT DEFAULT '[]'").run();
      }
    } catch (e) {}
    
    await db.prepare(`CREATE TABLE IF NOT EXISTS notify_settings (
      id INTEGER PRIMARY KEY,
      key TEXT UNIQUE,
      value TEXT
    )`).run();
  } catch (e) {}
}

// 生成Token
function generateToken(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) - hash) + password.charCodeAt(i);
    hash = hash & hash;
  }
  return 'auth_' + Math.abs(hash).toString(36);
}

// 计算下次通知日期
function calculateNextDate(type, value, hour, timezone, currentDate, isNew) {
  hour = hour || '09';
  let minute = '00';
  if (hour && hour.includes(':')) {
    const parts = hour.split(':');
    hour = parts[0];
    minute = parts[1] || '00';
  }
  timezone = timezone || 'UTC';
  const offsets = { 'UTC': 0, 'CST': 8, 'ET': -4 };
  const offset = offsets[timezone] || 0;
  const now = new Date();
  const localNow = new Date(now.getTime() + offset * 3600000);
  const localYear = localNow.getUTCFullYear();
  const localMonth = localNow.getUTCMonth();
  const localDay = localNow.getUTCDate();
  const currentHour = localNow.getUTCHours();
  const currentMinute = localNow.getUTCMinutes();
  let year, month, day;
  if (currentDate) {
    const dateParts = currentDate.split('-');
    year = parseInt(dateParts[0]);
    month = parseInt(dateParts[1]) - 1;
    day = parseInt(dateParts[2]);
  } else {
    year = localYear;
    month = localMonth;
    day = localDay;
  }
  let next = new Date(Date.UTC(year, month, day, parseInt(hour), parseInt(minute), 0));
  const currentTotalMinutes = currentHour * 60 + currentMinute;
  const targetTotalMinutes = parseInt(hour) * 60 + parseInt(minute);
  if (isNew) {
    const isToday = (year === localYear && month === localMonth && day === localDay);
    if (isToday && targetTotalMinutes > currentTotalMinutes) {
      return year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    }
  }
  switch (type) {
    case 'daily':
      next.setUTCDate(next.getUTCDate() + 1);
      break;
    case 'weekly':
      const targetDay = parseInt(value) || 1;
      const currentDay = next.getUTCDay() === 0 ? 7 : next.getUTCDay();
      let daysToAdd = (targetDay - currentDay + 7) % 7;
      if (daysToAdd === 0) daysToAdd = 7;
      next.setUTCDate(next.getUTCDate() + daysToAdd);
      break;
    case 'monthly':
      const targetDate = Math.min(parseInt(value) || day, 28);
      next.setUTCDate(targetDate);
      if (next <= now) next.setUTCMonth(next.getUTCMonth() + 1);
      break;
    case 'yearly':
      const parts = (value || '1-1').split('-');
      const targetMonth = parseInt(parts[0]) || 1;
      const targetDayY = Math.min(parseInt(parts[1]) || 1, 28);
      next.setUTCMonth(targetMonth - 1, targetDayY);
      if (next <= now) next.setUTCFullYear(next.getUTCFullYear() + 1);
      break;
    case 'specific':
      return currentDate || value;
  }
  return next.getUTCFullYear() + '-' + String(next.getUTCMonth() + 1).padStart(2, '0') + '-' + String(next.getUTCDate()).padStart(2, '0');
}