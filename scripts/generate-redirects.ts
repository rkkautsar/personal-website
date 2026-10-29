import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const linksPath = resolve(root, 'shortlinks.json');
const links = JSON.parse(readFileSync(linksPath, 'utf8')) as Record<string, string>;
const lines = Object.entries(links)
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([slug, destination]) => {
    if (!/^[a-z0-9][a-z0-9-]*$/i.test(slug)) {
      throw new Error(`Invalid shortlink path: ${slug}`);
    }
    if (!destination || /[\r\n]/.test(destination)) {
      throw new Error(`Invalid shortlink destination for ${slug}`);
    }
    return `/l/${slug} ${destination} 301`;
  });

lines.push('/blog/the-performance-cost-of-feature-flags/ /blog/the-performance-cost-of-visual-instability/ 301');
writeFileSync(resolve(root, 'dist/_redirects'), `${lines.join('\n')}\n`);
