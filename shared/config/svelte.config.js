import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter(),
        files: {
            appTemplate: path.resolve(__dirname, '../../templates/app.html')
        },
        paths: {
            assets: process.env.SVELTE_CLIENT_ASSET_PATH,
            relative: false
        }
    }
};

export default config;
