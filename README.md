# My Recipes & Books

A simple Node.js app for tracking recipes and books in a local JSON-backed storage system. It serves a browser interface and exposes a small REST API for reading and saving data.

## Features

- Track recipe entries with titles and categories
- Maintain a list of books
- Persist data to a local JSON file
- Serve a lightweight front-end from the project root
- Run tests with Node's built-in test runner

## Project Structure

```text
recipe-app/
├── data/
│   └── recipes.json
├── tests/
│   └── storage.test.js
├── My Recipes & Books.html
├── My Recipes & Books.md
├── package.json
├── server.js
├── README.md
└── .gitignore (if present)
```

## Requirements

- Node.js 18+ recommended
- npm (comes with Node.js)

## Installation

```bash
npm install
```

## Run the app

Start the server:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:3000
```

## API

The app exposes a simple JSON API:

- GET `/api/data` - return stored recipes and books
- PUT `/api/data` - replace stored data with a JSON payload

Example payload:

```json
{
  "recipes": [
    { "title": "Pasta", "category": "Dinner", "done": false }
  ],
  "books": []
}
```

## Data Storage

The application stores data in:

```text
data/recipes.json
```

If the file does not exist, it is created automatically on first startup.

## Testing

Run the project tests:

```bash
npm test
```

The test suite checks that the server stores and retrieves data correctly from the JSON file.

## Notes

This project is intentionally lightweight and uses the built-in Node.js HTTP server instead of a framework, making it easy to run locally without extra dependencies.
