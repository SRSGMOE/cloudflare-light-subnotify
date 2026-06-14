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
        apiPaths = JSON.parse(results[0].value);
      }
    }
  } catch (e) {}
  
  // 检查是否是随机路径的 API 请求
  const checkPath = apiPaths.check_notifications;
  const exchangePath = apiPaths.exchange_rate;
  
  if (checkPath && path.startsWith('/' + checkPath + '/api/')) {
    const newPath = path.slice(('/' + checkPath).length);
    const newUrl = new URL(request.url);
    newUrl.pathname = newPath;
    const newRequest = new Request(newUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    return next(newRequest);
  }
  
  if (exchangePath && path.startsWith('/' + exchangePath + '/api/')) {
    const newPath = path.slice(('/' + exchangePath).length);
    const newUrl = new URL(request.url);
    newUrl.pathname = newPath;
    const newRequest = new Request(newUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    return next(newRequest);
  }
  
  // 正常处理其他请求
  return next();
}