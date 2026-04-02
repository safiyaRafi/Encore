const { exec } = require('child_process');

function kill() {
  // On Windows, find the process listening on port 3001
  exec('netstat -ano | findstr :3001', (err, stdout, stderr) => {
    if (err || !stdout) {
      console.log('No process found on port 3001');
      process.exit(0);
    }

    const lines = stdout.trim().split('\n');
    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1]; // PID is the last column
      
      if (pid && pid !== '0') {
        console.log(`Killing process ${pid} on port 3001...`);
        exec(`taskkill /F /PID ${pid}`, (kErr) => {
          if (kErr) console.error(`Failed to kill ${pid}:`, kErr);
          else console.log(`Killed ${pid}`);
        });
      }
    }
  });
}

kill();
