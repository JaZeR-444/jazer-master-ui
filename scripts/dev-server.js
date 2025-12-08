const http = require('http');
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 5173;

const root = path.join(__dirname, '..');

http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  let filePath = path.join(root, url === '/' ? 'HOME.html' : url);
  if (filePath.endsWith('/')) filePath += 'HOME.html';
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.statusCode = 404; res.end('Not found');
    return;
  }
  const ext = path.extname(filePath).slice(1);
  const contentType = {
    html: 'text/html', css: 'text/css', js: 'application/javascript'
  }[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', contentType + '; charset=utf-8');
  fs.createReadStream(filePath).pipe(res);
}).listen(port, () => console.log(`Dev server: http://localhost:${port}`));
