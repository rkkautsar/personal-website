import { navigation } from './data/navigation';
import './index.css';

function initHome() {
  const sections = navigation
    .map(({ id }) => document.getElementById(id))
    .filter((section): section is HTMLElement => Boolean(section));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio
          )[0];
        if (visible)
          document.documentElement.dataset.activeSection = visible.target.id;
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.3] }
    );
    sections.forEach((section) => observer.observe(section));
  }

  const status = document.querySelector<HTMLElement>('[data-project-status]');
  let loading = false;
  document.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>(
      'button[data-project-url]'
    );
    const url = button?.dataset.projectUrl;
    if (!button || !url || loading) return;

    loading = true;
    button.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Loading project preview…';
    try {
      const { openProjectDialog } = await import('./project-dialog-client');
      openProjectDialog(url, button);
      if (status) status.textContent = '';
    } catch (error) {
      console.error('Could not load project preview', error);
      if (status)
        status.textContent = 'Project preview could not be loaded. Try again.';
    } finally {
      loading = false;
      button.removeAttribute('aria-busy');
    }
  });
}

if (import.meta.env.DEV) {
  const root = document.getElementById('root')!;
  const isBlogRoute =
    window.location.pathname === '/blog' ||
    window.location.pathname.startsWith('/blog/');
  if (isBlogRoute) {
    void import('./blog/dev').then(({ renderDevBlog }) =>
      renderDevBlog(root, window.location.pathname)
    );
  } else {
    void import('./home-dev').then(({ renderDevHome }) => {
      renderDevHome(root);
      initHome();
    });
  }
} else {
  initHome();
}
