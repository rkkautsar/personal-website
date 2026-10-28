import { ArrowUpRight } from 'lucide-react';
import { posts } from '@/lib/posts';

export function WritingSection() {
  return (
    <section className="content-section" id="writing">
      <div className="section-heading">
        <p className="section-label">04 / Writing</p>
        <h2>Notes and longer reads</h2>
      </div>
      {posts.length ? (
        <div className="writing-list">
          {posts.map((post) => (
            <a className="writing-item" href={post.url} key={post.url}>
              <span>
                <span className="writing-title">{post.title}</span>
                <span className="writing-description">{post.description}</span>
              </span>
              <ArrowUpRight aria-hidden="true" size={17} />
            </a>
          ))}
        </div>
      ) : (
        <p className="empty-writing">No posts published yet.</p>
      )}
    </section>
  );
}
