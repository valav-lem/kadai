import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

console.log('🚀 Starting Kadai Dev Environment (API :3000 | Counter UI :5173)...');

const api = spawn(npmCmd, ['run', 'dev:api'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

const web = spawn(npmCmd, ['run', 'dev:web'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

const cleanExit = () => {
  api.kill();
  web.kill();
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);
