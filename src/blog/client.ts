const demos: Record<string, () => Promise<{ init: (element: HTMLElement) => void }>> = {
  'demo-flag-flicker': () => import('./demos/flag'),
  'demo-cart-rendering': () => import('./demos/rendering'),
  'demo-cart-cache': () => import('./demos/cache'),
};
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    observer.unobserve(entry.target);
    const element = entry.target as HTMLElement;
    const load = demos[element.dataset.demo || ''];
    if (load) load().then(({ init }) => init(element)).catch(() => { element.textContent = 'The interactive demo could not be loaded.'; });
  }
}, { rootMargin: '200px' });
document.querySelectorAll<HTMLElement>('[data-demo]').forEach(element => observer.observe(element));

const discussion = document.querySelector<HTMLElement>('[data-engagement]');
if (discussion) {
  const discussionObserver = new IntersectionObserver((entries) => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    discussionObserver.disconnect();
    import('./engagement').then(({ init }) => init(discussion)).catch(() => {
      discussion.textContent = 'Discussion could not be loaded.';
    });
  }, { rootMargin: '200px' });
  discussionObserver.observe(discussion);
}
