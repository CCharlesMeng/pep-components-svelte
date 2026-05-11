// Global type declarations for path aliases used in Vite

import 'svelte/elements';

declare module '$component' {
  const component: any;
  export default component;
}

declare module '$data' {
  const data: any;
  export default data;
}

declare module '$loader' {
  export const loader: (method: { requestClient: any }, data: any) => Promise<any> | any;
}

declare module '$lib' {
  export * from './src/lib';
}

declare module 'svelte/elements' {
  interface HTMLAttributes<T extends EventTarget> {
    bi_name?: string;
    bi_parent_name?: string;
  }
}