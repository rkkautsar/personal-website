import { SiteFooter } from '../components/SiteFooter';
import { posts } from './metadata';

export function Demo({ name }: { name: string }) {
  return <div className="article-demo" data-demo={name}><p>Interactive demo loading. JavaScript is required to use it.</p></div>;
}

function ArticleTable(props: React.ComponentPropsWithoutRef<'table'>) {
  return <div className="article-table-scroll" role="region" aria-label="Scrollable table" tabIndex={0}><table {...props} /></div>;
}

export type ArticleContent = React.ComponentType<{ components: { Demo: typeof Demo; table: typeof ArticleTable } }>;

export function Article({ post, Content }: { post: typeof posts[number]; Content: ArticleContent }) {
  return <div className="article-shell article-page"><header className="article-header"><a href="/">← Rakha Kanz Kautsar</a><a href="/blog/">Writing</a></header><main><article><p className="section-label">Writing / {new Date(`${post.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p><h1>{post.title}</h1><div className="article-prose"><Content components={{ Demo, table: ArticleTable }} /></div></article><section className="engagement" data-engagement={post.slug} aria-labelledby="discussion-heading"><h2 id="discussion-heading">Discussion</h2><p>Loading comments and likes…</p><noscript>Enable JavaScript to use the discussion preview.</noscript></section></main><SiteFooter name="Rakha Kanz Kautsar" /></div>;
}
