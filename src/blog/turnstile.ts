type WidgetApi = {
  render(element: HTMLElement, options: Record<string, unknown>): string;
  execute(widget: string): void;
  remove(widget: string): void;
};
declare global {
  interface Window {
    turnstile?: WidgetApi;
  }
}
let loader: Promise<WidgetApi> | undefined;
function loadScript(): Promise<WidgetApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!loader)
    loader = new Promise<WidgetApi>((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () =>
        window.turnstile
          ? resolve(window.turnstile)
          : reject(new Error('Verification unavailable'));
      script.onerror = () => {
        script.remove();
        reject(new Error('Verification unavailable'));
      };
      document.head.append(script);
    }).catch((error) => {
      loader = undefined;
      throw error;
    });
  return loader;
}
export async function challenge(
  container: HTMLElement,
  sitekey: string
): Promise<string> {
  const turnstile = await loadScript();
  return new Promise((resolve, reject) => {
    let id: string | undefined;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (value?: string) => {
      clearTimeout(timer);
      if (id) turnstile.remove(id);
      value ? resolve(value) : reject(new Error('Verification failed'));
    };
    try {
      id = turnstile.render(container, {
        sitekey,
        action: 'comment',
        execution: 'execute',
        appearance: 'interaction-only',
        theme: 'dark',
        callback: (value: string) => finish(value),
        'error-callback': () => finish(),
        'expired-callback': () => finish(),
        'timeout-callback': () => finish(),
      });
      timer = setTimeout(() => finish(), 120_000);
      turnstile.execute(id);
    } catch {
      finish();
    }
  });
}
