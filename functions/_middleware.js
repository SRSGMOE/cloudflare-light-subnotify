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
    console.error('Failed to load API paths:', e);
  }
  
  const checkPath = apiPaths.check_notifications;
  const exchangePath = apiPaths.exchange_rate;
  
  // 检查通知 API (POST)
  if (checkPath && path === `/${checkPath}/api/check-notifications` && request.method === 'POST') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/check-notifications';
    const newRequest = new Request(newUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    return next(newRequest);
  }
  
  // 汇率 API - GET (获取汇率)
  if (exchangePath && path === `/${exchangePath}/api/exchange-rate` && request.method === 'GET') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/exchange-rate';
    const newRequest = new Request(newUrl.toString(), {
      method: 'GET',
      headers: request.headers,
    });
    return next(newRequest);
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
    return next(newRequest);
  }
  
  // 正常处理其他请求
  return next();
}