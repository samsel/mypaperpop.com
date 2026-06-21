import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const warnings = [];

const ignoredDirs = new Set([
  '.git',
  'internal',
  'node_modules',
  '.next',
  'coverage',
  'test-results',
  'playwright-report',
]);

const internalOnlyPaths = [
  '.agent/',
  'ARCHITECTURE.md',
  'TESTING.md',
  'docs/decisions/',
  'docs/playbooks/',
  'scripts/download-images.ts',
  'scripts/setup-stripe-products.ts',
  'scripts/configure-braintrust-online-scoring.ts',
  'scripts/submit-indexnow.mjs',
  'public/43927e7b02f5c2189dfe05825139bc74.txt',
];

const allowedInternalReferenceFiles = new Set([
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'docs/development.md',
  'docs/internal-overlay.md',
  'docs/repo-boundaries.md',
  'docs/release-boundary-checklist.md',
  'scripts/check-internal-overlay.mjs',
  'scripts/check-repo-boundaries.mjs',
]);

const codeRoots = [
  'app/',
  'auth.config.ts',
  'auth.ts',
  'braintrust/',
  'components/',
  'drizzle.config.ts',
  'evals/',
  'hooks/',
  'lib/',
  'next.config.ts',
  'playwright.config.ts',
  'postcss.config.mjs',
  'proxy.ts',
  'scripts/',
  'tests/',
  'tsconfig.json',
  'types/',
  'vitest.config.ts',
];

const optionalEnvKeys = [
  'AXIOM_TOKEN',
  'BRAINTRUST_API_KEY',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'RESEND_API_KEY',
];

function addError(message) {
  errors.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function hasGitCheckout() {
  return existsSync(join(root, '.git'));
}

function runGit(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function trackedFiles() {
  if (!hasGitCheckout()) {
    return walkFiles(root);
  }

  return runGit(['ls-files', '-z']).split('\0').filter(Boolean);
}

function walkFiles(dir) {
  const result = [];

  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) {
      continue;
    }

    const absolute = join(dir, entry);
    const stats = statSync(absolute);

    if (stats.isDirectory()) {
      result.push(...walkFiles(absolute));
      continue;
    }

    if (stats.isFile()) {
      result.push(relative(root, absolute).replaceAll('\\', '/'));
    }
  }

  return result;
}

function fileExists(path) {
  return existsSync(join(root, path));
}

function readText(path) {
  return readFileSync(join(root, path), 'utf8');
}

function isCodeOrConfig(path) {
  return codeRoots.some((prefix) => path === prefix || path.startsWith(prefix));
}

function checkInternalIgnored() {
  const gitignore = fileExists('.gitignore') ? readText('.gitignore') : '';

  if (!/^\/internal\/$/m.test(gitignore)) {
    addError('.gitignore must keep /internal/ ignored.');
  }

  if (fileExists('internal') && hasGitCheckout()) {
    try {
      execFileSync('git', ['check-ignore', '-q', 'internal/'], {
        cwd: root,
        stdio: 'ignore',
      });
    } catch {
      addError('internal/ exists but is not ignored by the public repository.');
    }
  }
}

function checkTsconfig() {
  if (!fileExists('tsconfig.json')) {
    addError('tsconfig.json is missing.');
    return;
  }

  const config = JSON.parse(readText('tsconfig.json'));
  const excluded = Array.isArray(config.exclude) ? config.exclude : [];

  if (!excluded.includes('internal')) {
    addError('tsconfig.json must exclude internal so mounted private files are not compiled.');
  }
}

function checkPackageScripts() {
  if (!fileExists('package.json')) {
    addError('package.json is missing.');
    return;
  }

  const pkg = JSON.parse(readText('package.json'));
  const scripts = pkg.scripts ?? {};

  if (scripts['check:boundaries'] !== 'node scripts/check-repo-boundaries.mjs') {
    addError('package.json must expose check:boundaries.');
  }

  for (const [name, value] of Object.entries(scripts)) {
    if (name === 'internal:check') {
      continue;
    }

    if (/\binternal[\\/]/.test(String(value))) {
      addError(`package script "${name}" must not execute private overlay files.`);
    }
  }
}

function checkEnvExample() {
  if (!fileExists('.env.example')) {
    addError('.env.example is missing.');
    return;
  }

  const envExample = readText('.env.example');

  if (!/^POSTGRES_URL=postgres:\/\//m.test(envExample)) {
    addError('.env.example must use a syntactically valid local POSTGRES_URL for smoke builds.');
  }

  for (const key of optionalEnvKeys) {
    if (new RegExp(`^${key}=`, 'm').test(envExample)) {
      addError(`${key} must stay commented out in .env.example so optional integrations are not fake-enabled.`);
    }
  }
}

function checkTrackedFiles(files) {
  for (const path of files) {
    if (path === 'internal' || path.startsWith('internal/')) {
      addError(`public repository must not track private overlay path: ${path}`);
    }

    for (const internalPath of internalOnlyPaths) {
      if (path === internalPath || path.startsWith(internalPath)) {
        addError(`internal-only file is present in public repository: ${path}`);
      }
    }

    if (/^\.env($|\.)/.test(basename(path)) && path !== '.env.example' && path !== '.env.test.local.example') {
      addError(`local environment file must not be tracked: ${path}`);
    }
  }
}

function checkCodeReferences(files) {
  const internalReferencePattern = /(?:^|['"`\s])(?:\.{1,2}\/)*internal[\\/]/;

  for (const path of files) {
    if (!isCodeOrConfig(path) || allowedInternalReferenceFiles.has(path)) {
      continue;
    }

    if (!/\.(cjs|js|jsx|json|mjs|ts|tsx)$/.test(path)) {
      continue;
    }

    const text = readText(path);

    if (internalReferencePattern.test(text)) {
      addError(`public code/config must not reference private overlay files: ${path}`);
    }
  }
}

function checkGitState() {
  if (!hasGitCheckout()) {
    addWarning('No .git directory found. Checked file tree, but could not verify git tracking.');
    return;
  }

  try {
    runGit(['rev-parse', '--is-inside-work-tree']);
  } catch {
    addWarning('Could not verify git work tree state.');
  }
}

const files = trackedFiles();

checkGitState();
checkInternalIgnored();
checkTsconfig();
checkPackageScripts();
checkEnvExample();
checkTrackedFiles(files);
checkCodeReferences(files);

for (const warning of warnings) {
  console.warn(`warning: ${warning}`);
}

if (errors.length > 0) {
  console.error('Public repository boundary check failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.info('Public repository boundary check passed.');

