/// <reference types="vite/client" />

declare module '*.json' {
  const content: any;
  export default content;
}

declare module '*.svelte' {
  import type { Component } from 'svelte';
  const component: Component<any>;
  export default component;
}
