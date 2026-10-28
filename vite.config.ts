import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import path from 'path';

export default defineConfig({
  plugins: [mdx({ remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight] }), react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: { manifest: true, rollupOptions: { input: { main: path.resolve(__dirname, 'index.html'), blog: path.resolve(__dirname, 'src/blog/client.ts') } } },
});
