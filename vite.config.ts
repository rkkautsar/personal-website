import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { articleMarkdown } from './scripts/markdown.mjs';

const mdxPlugin = mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight] });
const mdxTransform = mdxPlugin.transform;
if (typeof mdxTransform === 'function') {
  mdxPlugin.transform = function (code, id) {
    if (new URLSearchParams(id.split('?')[1]).has('raw')) return null;
    return mdxTransform.call(this, code, id);
  };
}

export default defineConfig({
  plugins: [mdxPlugin, react(), {
    name: 'dev-article-markdown',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = new URL(req.url || '/', 'http://localhost').pathname.match(/^\/_markdown\/blog\/([^/]+)\/index\.md$/);
        if (!match || !['GET', 'HEAD'].includes(req.method || '')) return next();
        try {
          const { posts } = await server.ssrLoadModule('/src/blog/metadata.ts');
          const post = posts.find((item: { slug: string }) => item.slug === match[1]);
          if (!post) return next();
          const { default: Content } = await server.ssrLoadModule(`/src/posts/${post.slug}.mdx`);
          const content = renderToStaticMarkup(React.createElement(Content, { components: { Demo: () => null } }));
          res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
          res.end(req.method === 'HEAD' ? undefined : articleMarkdown(post, content));
        } catch (error) {
          next(error);
        }
      });
    },
  }],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { manifest: true, rollupOptions: { input: { main: path.resolve(__dirname, 'index.html'), blog: path.resolve(__dirname, 'src/blog/client.ts') } } },
});
