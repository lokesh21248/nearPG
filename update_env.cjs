const { spawn } = require('child_process');

const envs = {
  VITE_FIREBASE_PROJECT_ID: 'studio-7328371401-9d600',
  VITE_FIREBASE_STORAGE_BUCKET: 'studio-7328371401-9d600.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '976765407893',
  VITE_FIREBASE_APP_ID: '1:976765407893:web:b31abd32465c6442f2419c'
};

async function updateEnv(key, value) {
  return new Promise((resolve, reject) => {
    console.log(`Updating ${key}...`);
    const child = spawn('npx.cmd', ['vercel', 'env', 'add', key, 'production', '--value', value, '--force', '--yes'], { shell: true });
    let done = false;
    
    child.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      if (output.includes('Added Environment Variable') || output.includes('Overrode Environment Variable')) {
        done = true;
        child.kill();
        resolve();
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
    });

    child.on('close', () => {
      if (!done) resolve();
    });
  });
}

async function main() {
  for (const [k, v] of Object.entries(envs)) {
    await updateEnv(k, v);
  }
  console.log('All done updating envs.');
}

main();
