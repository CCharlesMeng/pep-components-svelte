// @ts-ignore - $component is an alias
import Component from '$component';
import { mount, type Component as SvelteComponent } from 'svelte';

/**
 * Creates a mount function for a generic Svelte component.
 * Used in editor entry points.
 * 
 * @param SvelteComponent - The Svelte component class
 * @returns A function that takes a module ID and props to mount the component
 */
const createMountApp = (Component: SvelteComponent) => {
    return (id: string, props: Record<string, any>) => {
        const target = document.querySelector(`[data-mod-id="${id}"]`);

        if (!target) {
            console.error(`[Mount] Target element with data-mod-id="${id}" not found.`);
            return;
        }

        mount(Component, {
            target,
            props: props || {}
        });
    };
};

export const mountApp = createMountApp(Component);
