

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/fallbacks/error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.D7YMU8ly.js","_app/immutable/chunks/Dlc_SMu7.js","_app/immutable/chunks/BfU0bO0h.js","_app/immutable/chunks/DRL0_eXV.js"];
export const stylesheets = [];
export const fonts = [];
