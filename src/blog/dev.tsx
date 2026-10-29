import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Article, type ArticleContent } from './Article';
import { posts } from './metadata';
import { readingTime } from './reading-time';
import './article.css';

const contents = import.meta.glob<{ default: ArticleContent }>(
  '../posts/*.mdx',
  { eager: true }
);
const sources = import.meta.glob<string>('../posts/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

function BlogIndex() {
  return (
    <div className="article-shell">
      <header className="article-header">
        <a href="/">← Rakha Kanz Kautsar</a>
      </header>
      <main>
        <p className="section-label">Writing</p>
        <h1>Notes and longer reads</h1>
        <div className="writing-list">
          {posts.map((post) => (
            <a
              className="writing-item"
              href={`/blog/${post.slug}/`}
              key={post.slug}
            >
              <span>
                <span className="writing-title">{post.title}</span>
                <span className="writing-description">{post.description}</span>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}

function DevArticle({ slug }: { slug: string }) {
  const post = posts.find((item) => item.slug === slug);
  const Content = contents[`../posts/${slug}.mdx`]?.default;

  useEffect(() => {
    if (post && Content)
      void import('./client').then(({ init }) => init(document));
  }, [post, Content]);

  if (!post || !Content)
    return (
      <div className="article-shell">
        <header className="article-header">
          <a href="/blog/">← Writing</a>
        </header>
        <main>
          <h1>Article not found</h1>
        </main>
      </div>
    );
  return (
    <Article
      post={post}
      Content={Content}
      minutes={readingTime(sources[`../posts/${slug}.mdx`] ?? '')}
    />
  );
}

export function renderDevBlog(root: HTMLElement, pathname: string) {
  const route = pathname.replace(/\/+$/, '') || '/';
  const app =
    route === '/blog' ? (
      <BlogIndex />
    ) : (
      <DevArticle slug={route.slice('/blog/'.length)} />
    );
  createRoot(root).render(app);
}
