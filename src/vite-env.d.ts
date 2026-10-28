/// <reference types="vite/client" />

declare module '*.mdx' {
  import type { ComponentType } from 'react';
  const MDXContent: ComponentType<any>;
  export default MDXContent;
}
declare module '*.js' {
  export function start(root: ShadowRoot): void;
}
