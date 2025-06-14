const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Proxy everything except root '/'
app.use('/*', createProxyMiddleware({
  target: 'https://shellshock.io',
  changeOrigin: true,
  ws: true, // Enable websocket proxying for games
  pathRewrite: {
    '^/': '/', // Keep the path as-is
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add any headers if needed here
  }
}));

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
