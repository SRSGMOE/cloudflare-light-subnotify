// Cloudflare Pages Functions - 中间件
// 用于处理随机路径前缀

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 从数据库获取 API 路径配置
  let apiPaths = { check_notifications: '', exchange_rate: '' };
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='api_paths'"
      ).all();
      if (results.length > 0) {
        const parsed = JSON.parse(results[0].value);
        apiPaths.check_notifications = parsed.check_notifications || '';
        apiPaths.exchange_rate = parsed.exchange_rate || '';
      }
    }
  } catch (e) {
    // 静默处理错误
  }
  
  const checkPath = apiPaths.check_notifications;
  const exchangePath = apiPaths.exchange_rate;
  
  // 检查通知 API (POST)
  if (checkPath && path === `/${checkPath}/api/check-notifications` && request.method === 'POST') {
    // 重写 URL 到正确的 API 路径
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/check-notifications';
    // 创建新的请求
    const newRequest = new Request(newUrl.toString(), {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    // 使用 env.ASSETS.fetch 或直接处理
    return handleApiRequest(newRequest, env);
  }
  
  // 汇率 API - GET (获取汇率)
  if (exchangePath && path === `/${exchangePath}/api/exchange-rate` && request.method === 'GET') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/exchange-rate';
    const newRequest = new Request(newUrl.toString(), {
      method: 'GET',
      headers: request.headers,
    });
    return handleApiRequest(newRequest, env);
  }
  
  // 汇率 API - POST (刷新汇率)
  if (exchangePath && path === `/${exchangePath}/api/exchange-rate` && request.method === 'POST') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/exchange-rate';
    const newRequest = new Request(newUrl.toString(), {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    return handleApiRequest(newRequest, env);
  }
  
  // 正常处理其他请求
  return next();
}

// 处理 API 请求
async function handleApiRequest(request, env) {
  try {
    // 动态导入 API 处理函数
    const { onRequest } = await import('./api/[[path]].js');
    return onRequest({ request, env });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}