import { ArrowUpRight } from 'lucide-react';
import type { Repository } from '@/types/github';

export function ProjectCard({ project }: { project: Repository }) {
  return (
    <article className="project-card">
      <button
        className="project-preview"
        data-project-url={project.url}
        type="button"
      >
        <span className="project-title-row">
          <span className="project-title">{project.name}</span>
          <ArrowUpRight aria-hidden="true" size={17} />
        </span>
        <span className="project-description">
          {project.description?.trim() || 'A project from my GitHub profile.'}
        </span>
      </button>
      {project.homepageUrl && (
        <a
          className="project-site"
          href={project.homepageUrl}
          target="_blank"
          rel="noreferrer"
        >
          Visit project site <ArrowUpRight aria-hidden="true" size={14} />
        </a>
      )}
    </article>
  );
}
