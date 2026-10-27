const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'recipes.json');
const PORT = process.env.PORT || 3000;
let server;

function ensureDataFile() {
  const dir = path.dirname(DATA_FILE);
  fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ recipes: [], books: [] }, null, 2));
  }
}

function readData() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (!raw.trim()) {
      return { recipes: [], books: [] };
    }
    const parsed = JSON.parse(raw);
    return {
      recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
      books: Array.isArray(parsed.books) ? parsed.books : []
    };
  } catch (error) {
    return { recipes: [], books: [] };
  }
}

function writeData(data) {
  ensureDataFile();
  const safeData = {
    recipes: Array.isArray(data?.recipes) ? data.recipes : [],
    books: Array.isArray(data?.books) ? data.books : []
  };
  fs.writeFileSync(DATA_FILE, JSON.stringify(safeData, null, 2));
  return safeData;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8'
  };

  fs.readFile(filePath, (err, content) => {
    if (err) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'text/plain; charset=utf-8' });
    res.end(content);
  });
}

function requestHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/data') {
    sendJson(res, 200, readData());
    return;
  }

  if (req.method === 'PUT' && url.pathname === '/api/data') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const saved = writeData(parsed);
        sendJson(res, 200, saved);
      } catch (error) {
        sendJson(res, 400, { error: 'Invalid JSON payload' });
      }
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/') {
    serveFile(path.join(__dirname, 'My Recipes & Books.html'), res);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/My%20Recipes%20%26%20Books.html') {
    serveFile(path.join(__dirname, 'My Recipes & Books.html'), res);
    return;
  }

  if (req.method === 'GET' && url.pathname === '/My%20Recipes%20%26%20Books.md') {
    serveFile(path.join(__dirname, 'My Recipes & Books.md'), res);
    return;
  }

  if (req.method === 'GET') {
    const cleanPath = decodeURIComponent(url.pathname).replace(/^\//, '');
    const filePath = path.join(__dirname, cleanPath);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      serveFile(filePath, res);
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found' });
}

function startServer(port = PORT) {
  ensureDataFile();
  return new Promise((resolve) => {
    server = http.createServer(requestHandler);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function stopServer() {
  return new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }
    server.close(err => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function getDataPath() {
  return DATA_FILE;
}

if (require.main === module) {
  startServer(PORT)
    .then(() => {
      console.log(`Server running at http://127.0.0.1:${PORT}`);
    })
    .catch(error => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

module.exports = { startServer, stopServer, getDataPath, readData, writeData };
