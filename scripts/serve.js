// A zero-dependency static server. Browsers refuse to load ES modules from
// file:// URLs, so the course needs to be served over HTTP.
//
//   node scripts/serve.js [--port 8000] [--prefix /SymbolicLogic]
//
// --prefix serves the site under a sub-path, as GitHub Pages does, to catch
// accidental absolute URLs.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : dflt;
};
const PORT = Number(opt('port', process.env.PORT ?? 8000));
const PREFIX = (opt('prefix', '') || '').replace(/\/$/, '');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.md': 'text/plain; charset=utf-8',
};

export function startServer({ port = PORT, prefix = PREFIX } = {}) {
  const server = createServer(async (req, res) => {
    try {
      let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (prefix) {
        if (!path.startsWith(prefix)) { res.writeHead(404).end('Not found'); return; }
        path = path.slice(prefix.length) || '/';
      }
      if (path.endsWith('/')) path += 'index.html';
      const file = normalize(join(ROOT, path));
      if (!file.startsWith(ROOT.replace(/[\\/]$/, '') + sep) && file !== ROOT) { res.writeHead(403).end(); return; }
      const info = await stat(file);
      if (!info.isFile()) throw new Error('not a file');
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(await readFile(file));
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
    }
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const server = await startServer();
  const { port } = server.address();
  console.log(`Serving the course at http://localhost:${port}${PREFIX}/`);
}
