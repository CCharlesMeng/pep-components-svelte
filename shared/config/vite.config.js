import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default function () {
    return defineConfig({
        plugins: [sveltekit()]
    });
}
