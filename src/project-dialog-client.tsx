import { createRoot } from 'react-dom/client';
import { ProjectDialog } from './components/ProjectDialog';
import githubData from './data/github-profile.json';
import type { GithubProfile } from './types/github';

export function openProjectDialog(url: string, trigger: HTMLButtonElement) {
  const project = (githubData as GithubProfile).user.pinnedItems.edges.find(
    ({ node }) => node.url === url
  )?.node;
  if (!project) throw new Error('Project not found');

  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  root.render(
    <ProjectDialog
      project={project}
      trigger={trigger}
      onClose={() => {
        root.unmount();
        container.remove();
      }}
    />
  );
}
