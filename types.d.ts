// Global type declarations for path aliases used in Vite

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