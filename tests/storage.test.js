const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer, stopServer, getDataPath } = require('../server');

const fs = require('node:fs');
const path = require('node:path');

test('server stores data in a separate JSON file', async () => {
  const server = await startServer(0);
  const port = server.address().port;

  try {
    const initial = await fetch(`http://127.0.0.1:${port}/api/data`);
    const initialJson = await initial.json();
    assert.deepEqual(initialJson, { recipes: [], books: [] });

    const payload = {
      recipes: [{ title: 'Pasta', category: 'Dinner', done: false }],
      books: []
    };

    const put = await fetch(`http://127.0.0.1:${port}/api/data`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(put.status, 200);

    const saved = JSON.parse(fs.readFileSync(getDataPath(), 'utf8'));
    assert.deepEqual(saved, payload);

    const next = await fetch(`http://127.0.0.1:${port}/api/data`);
    const nextJson = await next.json();
    assert.deepEqual(nextJson, payload);
  } finally {
    await stopServer();
  }
});
