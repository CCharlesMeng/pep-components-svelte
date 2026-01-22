// @ts-ignore - $component is an alias
import '/@shared/styles/tokens/semantic.css';
import Component from '$component';
import { hydrate, type Component as SvelteComponent } from 'svelte';

declare global {
    interface Window {
        __INITIAL_DATA__: Record<string, any>;
    }
}

/**
 * Creates a hydration function for a generic Svelte component.
 * Used in client entry points.
 * 
 * @param SvelteComponent - The Svelte component class
 * @returns A function that takes a module ID and hydrates the component
 */
const createHydrateApp = (Component: SvelteComponent) => {
    return (id: string) => {
        const target = document.querySelector(`[data-mod-id="${id}"]`);

        if (!target) {
            console.error(`[Hydration] Target element with data-mod-id="${id}" not found.`);
            return;
        }

        const props = window.__INITIAL_DATA__?.[id];
        if (!props) {
            console.warn(`[Hydration] No initial data found for id="${id}".`);
        }

        hydrate(Component, {
            target,
            props: props || {}
        });
    };
};

export const hydrateApp = createHydrateApp(Component);
