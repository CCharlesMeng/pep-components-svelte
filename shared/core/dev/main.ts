import '@pep/shared/styles/tokens/semantic.css';
import Component from '$component';
import data from '$data';

import { mount, type Component as SvelteComponent } from 'svelte';

/**
 * Mounts a Svelte component for local development.
 * Used in main.ts.
 * 
 * @param SvelteComponent - The Svelte component class
 * @param data - The mock data props
 * @param targetId - The ID of the DOM element to mount to (default: 'app')
 */
const mountDevApp = (Component: SvelteComponent, data: any, targetId: string = 'app') => {
    console.log(`[Dev] Mounting app with data:`, data);

    const target = document.getElementById(targetId);

    if (!target) {
        console.error(`[Dev] Target element #${targetId} not found.`);
        return;
    }

    mount(Component, {
        target,
        props: data
    });
};


// @ts-ignore - Dynamic import for loader
const loadComponentData = async () => {
    try {
        // Dynamically import the component.server.ts to get the loader
        const { loader } = await import('$loader');

        if (!loader) {
            return data;
        }

        // Create mock request client for development
        const mockRequestClient = {
            get: async (url: string) => ({ data: {} }),
            post: async (url: string, payload: any) => ({ data: {} }),
            // Add other HTTP methods as needed
        };

        // Call loader with mock client and data (now async)
        const requestClient = new RequestAdater();
        const method = { requestClient: requestClient };
        const loadedData = await loader(method, data);

        // Combine loader result with original data
        const combinedData = {
            ...data,
            ...loadedData
        };

        return combinedData;
    } catch (error) {
        console.warn('[Dev] Failed to load component data, using raw data:', error);
        return data;
    }
};

// Load component data and mount
loadComponentData().then(combinedData => {
    mountDevApp(Component, combinedData);
});
