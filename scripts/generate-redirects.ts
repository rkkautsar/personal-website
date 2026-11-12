import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const lines = [
  '/blog/the-performance-cost-of-feature-flags/ /blog/the-performance-cost-of-visual-instability/ 301',
];

writeFileSync(resolve(root, 'dist/_redirects'), `${lines.join('\n')}\n`);
