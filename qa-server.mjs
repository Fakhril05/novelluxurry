import { createServer } from 'http';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3200;
const HOST = '0.0.0.0';

const STANDALONE = join(__dirname, '.next/standalone');
const STATIC_DIR = join(__dirname, '.next/static');
const PUBLIC_DIR = join(__dirname, 'public');

// Load API data
let testimonialsData = [];
let booksData = [];
let categoriesData = [];
let blogsData = [];
let faqsData = [];

try {
  const res1 = await fetch('http://localhost:3102/api/testimonials');
  if (res1.ok) testimonialsData = await res1.json();
} catch {}

try {
  const res2 = await fetch('http://localhost:3102/api/books?limit=50');
  if (res2.ok) booksData = await res2.json();
} catch {}

try {
  const res3 = await fetch('http://localhost:3102/api/categories');
  if (res3.ok) categoriesData = await res3.json();
} catch {}

try {
  const res4 = await fetch('http://localhost:3102/api/blogs');
  if (res4.ok) blogsData = await res4.json();
} catch {}

try {
  const res5 = await fetch('http://localhost:3102/api/faqs');
  if (res5.ok) faqsData = await res5.json();
} catch {}

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // API routes
  if (path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (path === '/api/testimonials') {
      return res.end(JSON.stringify(testimonialsData));
    }
    if (path === '/api/books' || path === '/api/books/') {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const page = parseInt(url.searchParams.get('page') || '1');
      return res.end(JSON.stringify(booksData.slice(0, limit)));
    }
    if (path.startsWith('/api/books/')) {
      const slug = path.replace('/api/books/', '');
      const book = booksData.find(b => b.slug === slug);
      return res.end(JSON.stringify(book || { error: 'Not found' }));
    }
    if (path === '/api/categories') {
      return res.end(JSON.stringify(categoriesData));
    }
    if (path === '/api/blogs') {
      return res.end(JSON.stringify(blogsData));
    }
    if (path.startsWith('/api/blogs/')) {
      const slug = path.replace('/api/blogs/', '');
      const blog = blogsData.find(b => b.slug === slug);
      return res.end(JSON.stringify(blog || { error: 'Not found' }));
    }
    if (path === '/api/faqs') {
      return res.end(JSON.stringify(faqsData));
    }
    if (path === '/api/reviews') {
      return res.end(JSON.stringify([]));
    }
    // Auth, orders, vouchers - return empty
    return res.end(JSON.stringify({}));
  }

  // Static assets from .next/static
  if (path.startsWith('/_next/static/')) {
    const filePath = join(__dirname, '.next', path);
    if (existsSync(filePath)) {
      const ext = extname(filePath);
      const types = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.woff2': 'font/woff2',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.json': 'application/json',
      };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      return res.end(readFileSync(filePath));
    }
  }

  // Public assets
  if (path.startsWith('/')) {
    const pubPath = join(PUBLIC_DIR, path.slice(1));
    if (existsSync(pubPath)) {
      return res.end(readFileSync(pubPath));
    }
  }

  // For all other routes, serve the homepage HTML (SPA-like behavior)
  // We need to serve the built HTML. Let's use the standalone's server-rendered pages
  // For simplicity, serve index.html
  const htmlPath = join(STATIC_DIR, '..', 'server', 'app', 'index.html');
  if (existsSync(htmlPath)) {
    res.setHeader('Content-Type', 'text/html');
    return res.end(readFileSync(htmlPath));
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, HOST, () => {
  console.log(`QA Server running on http://${HOST}:${PORT}`);
  console.log(`Loaded: ${testimonialsData.length} testimonials, ${booksData.length} books, ${categoriesData.length} categories, ${blogsData.length} blogs`);
});
