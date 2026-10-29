import { ArrowUpRight } from 'lucide-react';
import { lazy, Suspense, useRef, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import type { Repository } from '@/types/github';

const ProjectDialog = lazy(() => import('@/components/ProjectDialog').then(({ ProjectDialog }) => ({ default: ProjectDialog })));

export function ProjectsSection({ projects, profileUrl }: { projects: Repository[]; profileUrl: string }) {
  const [activeProject, setActiveProject] = useState<Repository | null>(null);
  const trigger = useRef<HTMLElement | null>(null);

  return (
    <section className="content-section" id="projects">
      <div className="section-heading">
        <p className="section-label">03 / Projects</p>
        <h2>Selected work</h2>
        <p className="section-intro">A few things I’ve built and kept pinned on GitHub.</p>
      </div>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.url} project={project} onPreview={(selected, button) => {
            trigger.current = button;
            setActiveProject(selected);
          }} />
        ))}
      </div>
      {activeProject && (
        <Suspense fallback={<p className="quiet-copy" role="status">Loading project preview…</p>}>
          <ProjectDialog project={activeProject} onClose={() => setActiveProject(null)} trigger={trigger.current} />
        </Suspense>
      )}
      <a className="text-link github-link" href={profileUrl} target="_blank" rel="noreferrer">
        More on GitHub <ArrowUpRight aria-hidden="true" size={15} />
      </a>
    </section>
  );
}
