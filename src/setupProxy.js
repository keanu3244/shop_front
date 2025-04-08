const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api", // 代理路径前缀（按需修改）
    createProxyMiddleware({
      target: process.env.REACT_APP_BASE_API, // 后端地址
      changeOrigin: true, // 修改请求头中的Host为目标URL
      pathRewrite: {
        "^/api": "", // 移除路径中的/api前缀
      },
      // 其他可选配置
      secure: false, // 禁用SSL证书验证（针对HTTPS）
      onProxyReq(proxyReq, req, res) {
        console.log(
          `Proxying request: ${req.method} ${req.url} -> ${process.env.REACT_APP_BASE_API}${req.url}`
        );
        proxyReq.setHeader("X-Added-Header", "Value");
      },
      onError(err, req, res) {
        console.error("Proxy error:", err);
      },
    })
  );
  // 新增 Socket.IO 代理配置
  app.use(
    "/socket.io",
    createProxyMiddleware({
      target: process.env.REACT_APP_BASE_API, // 或单独设置 Socket.IO 服务器地址
      changeOrigin: true,
      ws: true, // 启用 WebSocket 代理
      pathRewrite: {
        "^/socket.io": "", // 移除路径中的/socket.io前缀
      },
      // Socket.IO 特殊配置
      onProxyReqWs: (proxyReq, req, socket, options, head) => {
        console.log(
          `Proxying WebSocket request: ${req.url} -> ${process.env.REACT_APP_BASE_API}`
        );
      },
      onError(err, req, res) {
        console.error("WebSocket proxy error:", err);
        res.writeHead(500, {
          "Content-Type": "text/plain",
        });
        res.end("WebSocket proxy error");
      },
    })
  );
};
