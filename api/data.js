const fs = require('node:fs');
const path = require('node:path');

function getDefaultData() {
  return { recipes: [], books: [] };
}

function getDataFile() {
  if (process.env.VERCEL) {
    return path.join('/tmp', 'recipe-app-data.json');
  }

  return path.join(process.cwd(), 'data', 'recipes.json');
}

function ensureDataFile() {
  const filePath = getDataFile();
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(getDefaultData(), null, 2));
  }
}

function readData() {
  ensureDataFile();

  try {
    const raw = fs.readFileSync(getDataFile(), 'utf8');
    if (!raw.trim()) {
      return getDefaultData();
    }

    const parsed = JSON.parse(raw);
    return {
      recipes: Array.isArray(parsed.recipes) ? parsed.recipes : [],
      books: Array.isArray(parsed.books) ? parsed.books : []
    };
  } catch (error) {
    return getDefaultData();
  }
}

function writeData(data) {
  ensureDataFile();
  const safeData = {
    recipes: Array.isArray(data?.recipes) ? data.recipes : [],
    books: Array.isArray(data?.books) ? data.books : []
  };

  fs.writeFileSync(getDataFile(), JSON.stringify(safeData, null, 2));
  return safeData;
}

module.exports = (req, res) => {
  const allowOrigin = '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(readData()));
    return;
  }

  if (req.method === 'PUT') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const saved = writeData(parsed);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(saved));
      } catch (error) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  res.statusCode = 405;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify({ error: 'Method not allowed' }));
};
