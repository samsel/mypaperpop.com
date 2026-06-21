import { existsSync } from 'fs';
import { join } from 'path';

const internalDir = join(process.cwd(), 'internal');
const internalReadme = join(internalDir, 'README.md');

if (!existsSync(internalDir)) {
  console.info([
    'Internal overlay: not mounted.',
    'This is expected for public users. The app does not need ./internal to install, build, test, or run.',
    'Private maintainers can clone samsel/mypaperpop.com-internal into ./internal.',
  ].join('\n'));
  process.exit(0);
}

if (!existsSync(internalReadme)) {
  console.warn([
    'Internal overlay: ./internal exists, but README.md was not found.',
    'If you are a private maintainer, make sure ./internal is a clone of samsel/mypaperpop.com-internal.',
    'The public app still does not depend on this folder.',
  ].join('\n'));
  process.exit(0);
}

console.info('Internal overlay: mounted at ./internal.');
