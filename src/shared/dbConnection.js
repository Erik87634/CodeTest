const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const DB_NAME = process.env.DB_NAME;

let db;

async function initDb() {
  // Ensure the database directory exists
  const dbDir = path.dirname(DB_NAME);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Open the database connection
  db = await open({
    filename: DB_NAME,
    driver: sqlite3.Database,
  });

  // Enable foreign key constraints
  await db.exec(`PRAGMA foreign_keys = ON;`);

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS winners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER,
      name TEXT,
      email TEXT,
      drawn_at TEXT,
      FOREIGN KEY (entry_id) REFERENCES entries(id)
    );
  `);

  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

module.exports = {
  initDb,
  getDb,
};
