const demos: Record<
  string,
  () => Promise<{ init: (element: HTMLElement) => void }>
> = {
  'demo-flag-flicker': () => import('./demos/flag'),
  'demo-trip-rendering': () => import('./demos/trip-rendering'),
  'demo-cart-rendering': () => import('./demos/rendering'),
  'demo-cart-cache': () => import('./demos/cache'),
  'demo-taa-main': () => import('./demos/taa'),
  'demo-taa-crossasset': () => import('./demos/taa'),
  'demo-taa-timing': () => import('./demos/taa'),
  'demo-taa-overfit': () => import('./demos/taa'),
};

export function init(root: ParentNode = document) {
  const elements = [...root.querySelectorAll<HTMLElement>('[data-demo]')];
  const supportsVisibilityObserver = 'IntersectionObserver' in window;
  const loadElement = (element: HTMLElement) => {
    const load = demos[element.dataset.demo || ''];
    if (load)
      load()
        .then(({ init: initialize }) => initialize(element))
        .catch((error) => {
          console.error(
            `Could not load article demo: ${element.dataset.demo}`,
            error
          );
          element.textContent = 'The interactive demo could not be loaded.';
        });
  };
  if (!supportsVisibilityObserver) {
    elements.forEach(loadElement);
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          loadElement(entry.target as HTMLElement);
        }
      },
      { rootMargin: '200px' }
    );
    elements.forEach((element) => observer.observe(element));
  }

  const discussion = root.querySelector<HTMLElement>('[data-engagement]');
  if (discussion) {
    const loadDiscussion = () =>
      import('./engagement')
        .then(({ init: initialize }) => initialize(discussion))
        .catch(() => {
          discussion.textContent = 'Discussion could not be loaded.';
        });
    if (!supportsVisibilityObserver) {
      void loadDiscussion();
    } else {
      const discussionObserver = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          discussionObserver.disconnect();
          void loadDiscussion();
        },
        { rootMargin: '200px' }
      );
      discussionObserver.observe(discussion);
    }
  }
}

if (!import.meta.env.DEV) init();
