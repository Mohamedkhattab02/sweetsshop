const fs = require('node:fs');
const path = require('node:path');

const serverDirectory = path.join(process.cwd(), 'dist', 'server');
const workerPath = path.join(serverDirectory, 'index.js');

const workerSource = `const hasFileExtension = (pathname) => /\\.[a-z0-9]+$/i.test(pathname);

const fetchAsset = (request, env, pathname) => {
  const url = new URL(request.url);
  url.pathname = pathname;
  return env.ASSETS.fetch(new Request(url, request));
};

export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return new Response('Static asset binding unavailable', { status: 500 });
    }

    let response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== 'GET') return response;

    const url = new URL(request.url);
    if (!hasFileExtension(url.pathname)) {
      response = await fetchAsset(request, env, url.pathname.replace(/\\/$/, '') + '.html');
      if (response.status !== 404) return response;

      response = await fetchAsset(request, env, url.pathname.replace(/\\/$/, '') + '/index.html');
      if (response.status !== 404) return response;
    }

    return fetchAsset(request, env, '/+not-found.html');
  },
};
`;

fs.mkdirSync(serverDirectory, { recursive: true });
fs.writeFileSync(workerPath, workerSource, 'utf8');
