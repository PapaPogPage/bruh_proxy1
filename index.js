const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');
const path = require('path');

// Change these to your target site and port
const TARGET = 'https://shellshockers.io';

// Optional HTTPS setup (for local testing with HTTPS)
const useHttps = false; // Change to true to enable HTTPS server
const httpsOptions = {
  key: fs.readFileSync(path.resolve(__dirname, 'certs/key.pem')),
  cert: fs.readFileSync(path.resolve(__dirname, 'certs/cert.pem')),
};

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  changeOrigin: true,
  ws: true,
});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
  // Rewrite Origin header for WebSocket & HTTP requests
  proxyReq.setHeader('Origin', TARGET);
});

proxy.on('error', function (err, req, res) {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
  }
  res.end('Something went wrong with the proxy.');
});

// Create HTTP or HTTPS server
const server = useHttps
  ? https.createServer(httpsOptions, (req, res) => proxy.web(req, res))
  : http.createServer((req, res) => proxy.web(req, res));

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server running on http${useHttps ? 's' : ''}://localhost:${PORT}`);
});
