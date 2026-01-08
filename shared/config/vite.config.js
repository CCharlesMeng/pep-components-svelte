import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import { presetPep } from '@pep/unocss-preset';
import { presetUno, presetAttributify } from 'unocss';

export default function () {
    return defineConfig({
        plugins: [
            UnoCSS({
                presets: [
                    presetUno(),
                    presetAttributify(),
                    presetPep(),
                ],
            }),
            sveltekit()
        ]
    });
}
