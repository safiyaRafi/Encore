const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const crypto = require('crypto');

let db;

async function initDB() {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT CHECK( role IN ('admin', 'user') ) NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT CHECK( status IN ('todo', 'in_progress', 'done') ) NOT NULL DEFAULT 'todo',
      priority TEXT CHECK( priority IN ('low', 'medium', 'high') ) NOT NULL DEFAULT 'medium',
      due_date DATETIME,
      assigned_to TEXT,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(assigned_to) REFERENCES users(id),
      FOREIGN KEY(created_by) REFERENCES users(id)
    );
  `);

  return db;
}

function getDB() {
  return db;
}

module.exports = { initDB, getDB };
