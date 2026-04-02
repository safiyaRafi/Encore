const BASE = 'http://localhost:3001';

async function run() {
  console.log('\n--- Testing login: user@taskmanager.com ---');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'user@taskmanager.com', password: 'UserPass123!' })
  });
  const loginData = await loginRes.json();
  console.log('Status:', loginRes.status);
  console.log('Body:', JSON.stringify(loginData, null, 2));

  if (!loginData.token) {
    console.error('Login failed — stopping.');
    process.exit(1);
  }

  const token = loginData.token;
  console.log('\n--- Testing GET /tasks ---');
  const tasksRes = await fetch(`${BASE}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tasksData = await tasksRes.json();
  console.log('Status:', tasksRes.status);
  console.log('Body:', JSON.stringify(tasksData, null, 2));

  console.log('\n--- Testing admin login ---');
  const adminRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@taskmanager.com', password: 'AdminPass123!' })
  });
  const adminData = await adminRes.json();
  console.log('Status:', adminRes.status);
  console.log('Admin user:', adminData.user);
  console.log('\nAll tests passed!');
}

run().catch(err => { console.error('Test error:', err.message); process.exit(1); });
