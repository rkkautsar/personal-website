import markup from './demo-flag-flicker.html?raw';
import { start } from './demo-flag-flicker.js';
export function init(element: HTMLElement) {
  const root = element.attachShadow({ mode: 'open' });
  root.innerHTML = markup;
  start(root);
}
