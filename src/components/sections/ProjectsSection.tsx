import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectDialog } from '@/components/ProjectDialog';
import type { Repository } from '@/types/github';

export function ProjectsSection({ projects, profileUrl }: { projects: Repository[]; profileUrl: string }) {
  const [activeProject, setActiveProject] = useState<Repository | null>(null);

  return (
    <section className="content-section" id="projects">
      <div className="section-heading">
        <p className="section-label">03 / Projects</p>
        <h2>Selected work</h2>
        <p className="section-intro">A few things I’ve built and kept pinned on GitHub.</p>
      </div>
      <Dialog.Root open={Boolean(activeProject)} onOpenChange={(open) => !open && setActiveProject(null)}>
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project.url} project={project} onPreview={setActiveProject} />
          ))}
        </div>
        <ProjectDialog key={activeProject?.url ?? 'closed'} project={activeProject} />
      </Dialog.Root>
      <a className="text-link github-link" href={profileUrl} target="_blank" rel="noreferrer">
        More on GitHub <ArrowUpRight aria-hidden="true" size={15} />
      </a>
    </section>
  );
}
