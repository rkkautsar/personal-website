import { ArrowUpRight } from 'lucide-react';
import { ProjectCard } from '@/components/ProjectCard';
import type { Repository } from '@/types/github';

export function ProjectsSection({
  projects,
  profileUrl,
}: {
  projects: Repository[];
  profileUrl: string;
}) {
  return (
    <section className="content-section" id="projects">
      <div className="section-heading">
        <p className="section-label">03 / Projects</p>
        <h2>Selected work</h2>
        <p className="section-intro">
          A few things I’ve built and kept pinned on GitHub.
        </p>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.url} project={project} />
        ))}
      </div>
      <p className="quiet-copy" role="status" data-project-status />
      <a
        className="text-link github-link"
        href={profileUrl}
        target="_blank"
        rel="noreferrer"
      >
        More on GitHub <ArrowUpRight aria-hidden="true" size={15} />
      </a>
    </section>
  );
}
