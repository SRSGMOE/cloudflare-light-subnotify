// Cloudflare Pages Functions - 中间件
// 用于处理随机路径前缀和CORS

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 获取CORS配置
  let allowedOrigins = '*';
  try {
    if (env.DB) {
      const { results } = await env.DB.prepare(
        "SELECT value FROM notify_settings WHERE key='cors_settings'"
      ).all();
      if (results.length > 0) {
        const corsConfig = JSON.parse(results[0].value);
        allowedOrigins = corsConfig.allowed_origins || '*';
      }
    }
  } catch (e) {}
  
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
  } catch (e) {}
  
  const checkPath = apiPaths.check_notifications;
  const exchangePath = apiPaths.exchange_rate;
  
  // 检查通知 API (POST)
  if (checkPath && path === `/${checkPath}/api/check-notifications` && request.method === 'POST') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/check-notifications';
    const newRequest = new Request(newUrl.toString(), {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    return handleApiRequest(newRequest, env, allowedOrigins);
  }
  
  // 汇率 API - POST (触发更新)
  if (exchangePath && path === `/${exchangePath}/api/exchange-rate` && request.method === 'POST') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/exchange-rate';
    const newRequest = new Request(newUrl.toString(), {
      method: 'POST',
      headers: request.headers,
      body: request.body,
    });
    return handleApiRequest(newRequest, env, allowedOrigins);
  }
  
  // 汇率 API - GET (读取数据)
  if (exchangePath && path === `/${exchangePath}/api/exchange-rate` && request.method === 'GET') {
    const newUrl = new URL(request.url);
    newUrl.pathname = '/api/exchange-rate';
    const newRequest = new Request(newUrl.toString(), {
      method: 'GET',
      headers: request.headers,
    });
    return handleApiRequest(newRequest, env, allowedOrigins);
  }
  
  // 处理 OPTIONS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': allowedOrigins,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    });
  }
  
  // 正常处理其他请求，添加CORS头
  const response = await next();
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Access-Control-Allow-Origin', allowedOrigins);
  newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return newResponse;
}

// 处理 API 请求
async function handleApiRequest(request, env, allowedOrigins) {
  try {
    const { onRequest } = await import('./api/[[path]].js');
    const response = await onRequest({ request, env });
    
    // 添加CORS头
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Access-Control-Allow-Origin', allowedOrigins);
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return newResponse;
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigins,
      }
    });
  }
}