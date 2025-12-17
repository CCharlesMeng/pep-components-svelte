import * as server from '../entries/pages/_...catchall_/_page.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_...catchall_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/[...catchall]/+page.server.ts";
export const imports = ["_app/immutable/nodes/2.B_K6RGQb.js","_app/immutable/chunks/Dlc_SMu7.js","_app/immutable/chunks/BfU0bO0h.js"];
export const stylesheets = ["_app/immutable/assets/2.Bbgck-ta.css"];
export const fonts = [];
