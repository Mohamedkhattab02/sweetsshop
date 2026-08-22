const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const publicDirectory = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT) || 10000;

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safeFilePath(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const relativePath = decodedPath.replace(/^[/\\]+/, '');
  const resolvedPath = path.resolve(publicDirectory, relativePath);
  const pathFromPublicDirectory = path.relative(publicDirectory, resolvedPath);

  if (pathFromPublicDirectory.startsWith('..') || path.isAbsolute(pathFromPublicDirectory)) {
    return null;
  }

  return resolvedPath;
}

function findFile(pathname) {
  const requestedPath = safeFilePath(pathname);
  if (!requestedPath) return null;

  const candidates = [requestedPath, `${requestedPath}.html`, path.join(requestedPath, 'index.html')];

  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      // Try the next static-rendered route shape.
    }
  }

  // Expo Router hydrates the requested URL on the client, so unknown dynamic
  // paths fall back to the root document instead of returning a Render 404.
  return path.join(publicDirectory, 'index.html');
}

const server = http.createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end('Method Not Allowed');
    return;
  }

  const requestUrl = new URL(request.url || '/', 'http://localhost');
  const filePath = findFile(requestUrl.pathname);

  if (!filePath || !fs.existsSync(filePath)) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not Found');
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  const immutableAsset = requestUrl.pathname.startsWith('/_expo/static/');
  response.writeHead(200, {
    'Content-Type': contentTypes[extension] || 'application/octet-stream',
    'Cache-Control': immutableAsset
      ? 'public, max-age=31536000, immutable'
      : extension === '.html'
        ? 'no-cache'
        : 'public, max-age=3600',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    if (!response.headersSent) response.writeHead(500);
    response.end('Internal Server Error');
  });
  stream.pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Nour Sweets web server listening on port ${port}`);
});
