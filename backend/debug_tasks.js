const { createTaskSchema } = require('./src/controllers/taskController');
const fs = require('fs');

console.log('--- Testing createTaskSchema ---');

const testData = {
  body: {
    title: 'test task',
    description: 'test desc',
    status: 'todo',
    priority: 'medium',
    due_date: '2026-04-02',
    assigned_to: null
  }
};

const result = createTaskSchema.safeParse(testData);

if (result.success) {
  console.log('SUCCESS: Validation passed!');
} else {
  console.log('FAILURE: Validation failed!');
  console.log(JSON.stringify(result.error.issues, null, 2));
}

console.log('\n--- Code Check (src/controllers/taskController.js) ---');
const content = fs.readFileSync('./src/controllers/taskController.js', 'utf8');
const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('const createTaskSchema ='));
if (start !== -1) {
  console.log(lines.slice(start, start + 10).join('\n'));
}

process.exit(0);
