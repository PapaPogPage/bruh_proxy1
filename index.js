const http = require('http');
const httpProxy = require('http-proxy');

const TARGET = 'https://shellshockers.io';

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  changeOrigin: true,
  ws: true,
  xfwd: true, // add x-forwarded-* headers
});

proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (res.writeHead && !res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
  }
  res.end('Proxy error.');
});

proxy.on('proxyReq', (proxyReq, req, res, options) => {
  // Overwrite Origin for CORS
  proxyReq.setHeader('Origin', TARGET);
  // Log outgoing proxy requests
  console.log(`Proxying request to: ${proxyReq.path}`);
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

server.on('upgrade', (req, socket, head) => {
  console.log('Upgrading to websocket:', req.url);
  proxy.ws(req, socket, head);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
