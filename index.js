const http = require('http');
const httpProxy = require('http-proxy');

// Create proxy server with target to Shell Shockers (or any target)
const proxy = httpProxy.createProxyServer({
  target: 'http://shellshockers.io',
  ws: true // Enable WebSocket proxying
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

// Handle WebSocket upgrade requests
server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
