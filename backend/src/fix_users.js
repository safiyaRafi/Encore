const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { initDB, getDB } = require('./db');

async function fix() {
  await initDB();
  const db = getDB();

  const accounts = [
    { name: 'Admin User',    email: 'admin@taskmanager.com', password: 'AdminPass123!', role: 'admin' },
    { name: 'Standard User', email: 'user@taskmanager.com',  password: 'UserPass123!',  role: 'user'  },
  ];

  for (const account of accounts) {
    const hash = await bcrypt.hash(account.password, 12);
    const id = crypto.randomUUID();
    
    // Delete if exists and insert
    await db.run('DELETE FROM users WHERE email = ?', [account.email]);
    await db.run(
      'INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)',
      [id, account.email, hash, account.name, account.role]
    );
    console.log(`[fix] Reset ${account.role}: ${account.email}`);
  }

  console.log('[fix] Done.');
  process.exit(0);
}

fix().catch(err => {
  console.error('[fix] Error:', err);
  process.exit(1);
});
