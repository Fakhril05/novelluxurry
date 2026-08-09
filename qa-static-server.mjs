import { createServer } from 'http';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, posix } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3200;
const HOST = '0.0.0.0';

const NEXT_STATIC = join(__dirname, '.next', 'static');
const NEXT_SERVER = join(__dirname, '.next', 'server');
const STANDALONE = join(__dirname, '.next', 'standalone');
const PUBLIC_DIR = join(__dirname, 'public');

// Load pre-cached API data
const apiData = {
  testimonials: JSON.parse(readFileSync('/tmp/qa-pages/api-testimonials.json', 'utf8')),
  books: JSON.parse(readFileSync('/tmp/qa-pages/api-books.json', 'utf8')),
  categories: JSON.parse(readFileSync('/tmp/qa-pages/api-categories.json', 'utf8')),
  blogs: JSON.parse(readFileSync('/tmp/qa-pages/api-blogs.json', 'utf8')),
  faqs: JSON.parse(readFileSync('/tmp/qa-pages/api-faqs.json', 'utf8')),
  bookDetail: JSON.parse(readFileSync('/tmp/qa-pages/api-book-detail.json', 'utf8')),
};

// Serve the pre-rendered homepage HTML
const INDEX_HTML = readFileSync('/tmp/qa-pages/index.html', 'utf8');

const MIME_TYPES = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

function serveFile(filePath, res) {
  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = extname(filePath).toLowerCase();
  const mime = MIME_TYPES[ext] || 'application/octet-stream';
  try {
    const data = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'public, max-age=31536000, immutable' });
    res.end(data);
  } catch (e) {
    res.writeHead(500);
    res.end('Error reading file');
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // CORS for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  // API routes
  if (path.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json', ...headers });

    if (path === '/api/testimonials') {
      return res.end(JSON.stringify(apiData.testimonials));
    }
    if (path === '/api/books' || path === '/api/books/') {
      return res.end(JSON.stringify(apiData.books));
    }
    if (path.startsWith('/api/books/')) {
      const slug = path.replace('/api/books/', '');
      const book = apiData.bookDetail;
      return res.end(JSON.stringify(book));
    }
    if (path === '/api/categories') {
      return res.end(JSON.stringify(apiData.categories));
    }
    if (path === '/api/blogs') {
      return res.end(JSON.stringify(apiData.blogs));
    }
    if (path.startsWith('/api/blogs/')) {
      return res.end(JSON.stringify({}));
    }
    if (path === '/api/faqs') {
      return res.end(JSON.stringify(apiData.faqs));
    }
    if (path === '/api/reviews') {
      return res.end(JSON.stringify([]));
    }
    // Auth, orders, vouchers - return empty
    return res.end(JSON.stringify({}));
  }

  // Next.js static assets
  if (path.startsWith('/_next/static/')) {
    const filePath = join(__dirname, '.next', path);
    return serveFile(filePath, res);
  }

  // Try public directory
  const pubPath = join(PUBLIC_DIR, path.slice(1));
  if (existsSync(pubPath) && statSync(pubPath).isFile()) {
    return serveFile(pubPath, res);
  }

  // SPA fallback - serve index.html for all routes
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(INDEX_HTML);
});

server.listen(PORT, HOST, () => {
  console.log(`QA Static Server on http://${HOST}:${PORT}`);
});
