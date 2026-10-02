// Dev server for the RPCG demo switcher: serves this folder so one origin hosts
// the panel (/rpcg-demo-switcher/), version A (/rpcg-demo-A/) and version B (/rpcg-demo-B/).
// Run: node serve-demo.js   then open http://localhost:5170
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = 5170;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') { res.writeHead(302, { Location: '/rpcg-demo-switcher/' }); return res.end(); }
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(__dirname, p);
  if (!f.startsWith(__dirname) || /[\\/]\.|node_modules/.test(p)) { res.writeHead(403); return res.end(); }
  fs.readFile(f, (e, d) => {
    if (e) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(d);
  });
}).listen(PORT, () => console.log('RPCG demo switcher: http://localhost:' + PORT));
