const http = require('http');
const https = require('https');

const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 8787);
const apiKey = process.env.DEEPSEEK_API_KEY;

if (!apiKey) {
  console.error('Missing DEEPSEEK_API_KEY environment variable.');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.method !== 'POST' || req.url !== '/chat/completions') {
    res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const upstream = https.request({
    hostname: 'api.deepseek.com',
    path: '/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
  }, (upstreamRes) => {
    res.writeHead(upstreamRes.statusCode || 502, {
      'Content-Type': upstreamRes.headers['content-type'] || 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    upstreamRes.pipe(res);
  });

  upstream.on('error', (error) => {
    console.error('DeepSeek proxy error:', error.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ error: 'AI service temporarily unavailable' }));
  });

  req.pipe(upstream);
});

server.listen(port, host, () => {
  console.log(`DeepSeek proxy listening on http://${host}:${port}`);
});
