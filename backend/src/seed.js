/**
 * Seed script — creates the two demo test accounts.
 * Run with: node src/seed.js   (from the /backend directory)
 * Safe to re-run — uses INSERT OR IGNORE.
 */
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { initDB, getDB } = require('./db');

async function seed() {
  await initDB();
  const db = getDB();

  const accounts = [
    { name: 'Admin User',    email: 'admin@taskmanager.com', password: 'AdminPass123!', role: 'admin' },
    { name: 'Standard User', email: 'user@taskmanager.com',  password: 'UserPass123!',  role: 'user'  },
  ];

  for (const account of accounts) {
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [account.email]);
    if (existing) {
      console.log(`[seed] Account already exists: ${account.email}`);
      continue;
    }
    const hash = await bcrypt.hash(account.password, 12);
    const id   = crypto.randomUUID();
    await db.run(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, account.email, hash, account.name, account.role]
    );
    console.log(`[seed] Created ${account.role}: ${account.email}`);
  }

  console.log('[seed] Done.');
  process.exit(0);
}

seed().catch(err => {
  console.error('[seed] Error:', err);
  process.exit(1);
});
