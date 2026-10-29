import TurndownService from 'turndown';
import gfm from 'turndown-plugin-gfm';

const markdown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
markdown.use(gfm.gfm);
markdown.remove(['script', 'style', 'nav', 'footer']);
markdown.addRule('svgDescription', { filter: 'svg', replacement: (_content, node) => node.querySelector('desc')?.textContent ? `\n\n${node.querySelector('desc').textContent}\n\n` : '' });

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export const toMarkdown = html => `${markdown.turndown(html).trim()}\n`;
export const articleMarkdown = (post, content) => toMarkdown(`<h1>${escapeHtml(post.title)}</h1><p>${escapeHtml(post.description)}</p>${content}`);
