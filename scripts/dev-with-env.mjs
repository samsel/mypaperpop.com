import { spawn } from 'node:child_process';
import path from 'node:path';
import dotenv from 'dotenv';

const parsedEnv = dotenv.config({ path: '.env' }).parsed;

process.env.NODE_ENV = 'development';

if (parsedEnv?.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = parsedEnv.GEMINI_API_KEY;
}

const stripeSecretIsPlaceholder =
  !process.env.STRIPE_SECRET_KEY ||
  process.env.STRIPE_SECRET_KEY === 'sk_test_dev';

if (stripeSecretIsPlaceholder && process.env.STRIPE_TEST_API_KEY) {
  process.env.STRIPE_SECRET_KEY = process.env.STRIPE_TEST_API_KEY;
}

const binPath = path.resolve('node_modules', '.bin');
const pathKey = process.platform === 'win32' ? 'Path' : 'PATH';
const env = {
  ...process.env,
  [pathKey]: [binPath, process.env[pathKey]].filter(Boolean).join(path.delimiter),
};

const child = spawn('next', ['dev', '--turbopack', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
  shell: process.platform === 'win32',
});

child.on('error', (error) => {
  console.error(`Failed to start Next.js dev server: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
