import markup from './demo-cart-cache.html?raw';
import { start } from './demo-cart-cache.js';
export function init(element: HTMLElement) {
  const root = element.attachShadow({ mode: 'open' });
  root.innerHTML = markup;
  start(root);
}
