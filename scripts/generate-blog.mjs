import { createServer } from 'vite';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import React from 'react';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

const site = 'https://rakha.dev';
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const main = manifest['index.html'];
const css = (main.css || []).map(file => `<link rel="stylesheet" href="/${file}">`).join('');
const client = manifest['src/blog/client.ts'].file;
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, optimizeDeps: { noDiscovery: true }, appType: 'custom' });
try {
  const { default: Home } = await server.ssrLoadModule('/src/pages/Home.tsx');
  const homeHtml = renderToString(React.createElement(Home));
  const indexPath = 'dist/index.html';
  const indexHtml = await readFile(indexPath, 'utf8');
  const rootPlaceholder = '<div id="root"></div>';
  if (!indexHtml.includes(rootPlaceholder)) throw new Error('Homepage root placeholder not found.');
  await writeFile(indexPath, indexHtml.replace(rootPlaceholder, () => `<div id="root">${homeHtml}</div>`));
  const { posts } = await server.ssrLoadModule('/src/blog/metadata.ts');
  const { Article } = await server.ssrLoadModule('/src/blog/Article.tsx');
  for (const post of posts) {
    const { default: Content } = await server.ssrLoadModule(`/src/posts/${post.slug}.mdx`);
    const canonical = `${site}/blog/${post.slug}/`;
    const body = renderToStaticMarkup(React.createElement(Article, { post, Content }));
    const json = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description, datePublished: post.date, author: { '@type': 'Person', name: 'Rakha Kanz Kautsar', url: site }, mainEntityOfPage: canonical }).replaceAll('<', '\\u003c');
    const html = `<!doctype html><html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#1e2019"><title>${escape(post.title)} | Rakha Kanz Kautsar</title><meta name="description" content="${escape(post.description)}"><link rel="canonical" href="${canonical}"><meta property="og:type" content="article"><meta property="og:title" content="${escape(post.title)}"><meta property="og:description" content="${escape(post.description)}"><meta property="og:url" content="${canonical}"><meta name="twitter:card" content="summary"><script type="application/ld+json">${json}</script>${css}</head><body>${body}<script type="module" src="/${client}"></script></body></html>`;
    const dir = `dist/blog/${post.slug}`; await mkdir(dir, { recursive: true }); await writeFile(`${dir}/index.html`, html);
  }
  const list = `<div class="article-shell"><header class="article-header"><a href="/">← Rakha Kanz Kautsar</a></header><main><p class="section-label">Writing</p><h1>Notes and longer reads</h1><div class="writing-list">${posts.map(post => `<a class="writing-item" href="/blog/${escape(post.slug)}/"><span><span class="writing-title">${escape(post.title)}</span><span class="writing-description">${escape(post.description)}</span></span><span aria-hidden="true">↗</span></a>`).join('')}</div></main></div>`;
  await mkdir('dist/blog', { recursive: true });
  await writeFile('dist/blog/index.html', `<!doctype html><html lang="en" class="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Writing | Rakha Kanz Kautsar</title><meta name="description" content="Articles by Rakha Kanz Kautsar on frontend engineering and performance."><link rel="canonical" href="${site}/blog/">${css}</head><body>${list}</body></html>`);
  const urls = [site + '/', site + '/blog/', ...posts.map(post => `${site}/blog/${post.slug}/`)];
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`);
  await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
} finally { await server.close(); }
