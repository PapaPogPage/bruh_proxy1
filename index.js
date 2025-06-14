const http = require('http');
const url = require('url');
const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  ws: true,
  xfwd: true,
});

// Serve HTML form and handle proxying
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/') {
    // Serve the simple form
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family:sans-serif; padding:2rem;">
          <h2>Enter URL to Proxy</h2>
          <form method="GET" action="/proxy">
            <input type="text" name="url" placeholder="https://example.com" style="width:300px" required />
            <button type="submit">Go</button>
          </form>
        </body>
      </html>
    `);
  } else if (parsedUrl.pathname === '/proxy') {
    const targetUrl = parsedUrl.query.url;

    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Missing URL parameter.');
      return;
    }

    try {
      const targetOrigin = new URL(targetUrl).origin;

      // Proxy the request to the target URL
      proxy.web(req, res, { target: targetOrigin }, err => {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
        res.end('Proxy error.');
      });
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid URL.');
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Handle WebSocket upgrade requests (for sites using WebSockets)
server.on('upgrade', (req, socket, head) => {
  const parsedUrl = url.parse(req.url, true);
  if (parsedUrl.pathname === '/proxy' && parsedUrl.query.url) {
    try {
      const targetOrigin = new URL(parsedUrl.query.url).origin;
      proxy.ws(req, socket, head, { target: targetOrigin });
    } catch {
      socket.destroy();
    }
  } else {
    socket.destroy();
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Proxy server with URL input running at http://localhost:${PORT}`);
});
