import markup from './demo-cart-rendering.html?raw';
import { start } from './demo-cart-rendering.js';
export function init(element: HTMLElement) {
  const root = element.attachShadow({ mode: 'open' });
  root.innerHTML = markup;
  start(root);
}
