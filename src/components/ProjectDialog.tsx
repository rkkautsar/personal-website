import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDownRight, ArrowUpRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProjectReadme } from '@/hooks/useProjectReadme';
import type { Repository } from '@/types/github';
import './project-dialog.css';

export function ProjectDialog({ project, onClose, trigger }: { project: Repository; onClose: () => void; trigger: HTMLElement | null }) {
  const [expanded, setExpanded] = useState(false);
  const readmeState = useProjectReadme(project);
  const readme = readmeState.text.trim();
  const hasMore = readme.length > 1400;

  useEffect(() => {
    setExpanded(false);
  }, [project?.url]);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      {project && (
        <Dialog.Content className="project-dialog" aria-describedby="project-dialog-description" onCloseAutoFocus={(event) => {
          event.preventDefault();
          trigger?.focus();
        }}>
          <div className="dialog-heading">
            <div>
              <p className="eyebrow">Pinned repository</p>
              <Dialog.Title className="dialog-title">{project.name}</Dialog.Title>
              <Dialog.Description id="project-dialog-description" className="dialog-description">
                {project.description?.trim() || 'Project README preview.'}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close README preview">
              <X aria-hidden="true" size={20} />
            </Dialog.Close>
          </div>

          <div className={`readme-content ${expanded ? 'is-expanded' : ''}`}>
            {readme ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
            ) : readmeState.loading ? (
              <p className="quiet-copy">Loading README from GitHub…</p>
            ) : readmeState.unavailable ? (
              <p className="quiet-copy">README preview isn’t available right now.</p>
            ) : (
              <p className="quiet-copy">GitHub has no README for this repository.</p>
            )}
          </div>
          {hasMore && (
            <button
              className="read-more-button"
              type="button"
              aria-expanded={expanded}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? 'Show less' : 'Read more'}
              <ArrowDownRight aria-hidden="true" size={15} />
            </button>
          )}

          <div className="dialog-links">
            <a href={project.url} target="_blank" rel="noreferrer">
              Open repository <ArrowUpRight aria-hidden="true" size={15} />
            </a>
            {project.homepageUrl && (
              <a href={project.homepageUrl} target="_blank" rel="noreferrer">
                Visit project site <ArrowUpRight aria-hidden="true" size={15} />
              </a>
            )}
          </div>
        </Dialog.Content>
      )}
    </Dialog.Portal>
    </Dialog.Root>
  );
}
