// Cloudflare Pages Functions - 中间件
// 用于处理随机路径前缀

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  
  // 获取随机路径前缀
  const apiPrefix = env.API_PREFIX || '';
  
  // 如果配置了随机前缀，检查请求路径
  if (apiPrefix) {
    const prefixPath = `/${apiPrefix}`;
    
    // 检查是否是带随机前缀的 API 请求
    if (path.startsWith(prefixPath + '/api/')) {
      // 移除随机前缀，重写路径
      const newPath = path.slice(prefixPath.length);
      const newUrl = new URL(request.url);
      newUrl.pathname = newPath;
      
      // 创建新的请求，移除随机前缀
      const newRequest = new Request(newUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });
      
      // 继续处理请求
      return next(newRequest);
    }
  }
  
  // 正常处理其他请求
  return next();
}