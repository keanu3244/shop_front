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
};
