import { c as create_ssr_component, v as validate_component } from './ssr-DHpF3kMw.js';

const Layout$1 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${slots.default ? slots.default({}) : ``}`;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(Layout$1, "SharedLayout").$$render($$result, {}, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});

export { Layout as default };
//# sourceMappingURL=_layout.svelte-CUUTz223.js.map
