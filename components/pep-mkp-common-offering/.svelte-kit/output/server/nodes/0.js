

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export const imports = ["_app/immutable/nodes/0.GzZI6DEX.js","_app/immutable/chunks/Dlc_SMu7.js","_app/immutable/chunks/BfU0bO0h.js"];
export const stylesheets = [];
export const fonts = [];
