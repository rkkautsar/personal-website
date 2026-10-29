import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import Home from './pages/Home';

export function renderDevHome(root: HTMLElement) {
  flushSync(() => createRoot(root).render(<Home />));
}
