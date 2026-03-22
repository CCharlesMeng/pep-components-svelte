import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get current directory of this factory file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '../../'); // Go up from shared/config to project root

/**
 * Shared Vite configuration factory for PEP components
 * @param {object} options - Configuration options
 * @param {string} options.cwd - Current working directory (process.cwd())
 * @param {string} options.name - Component library name (e.g., 'NavigateLinkData')
 * @returns {import('vite').UserConfig}
 */
export function createComponentConfig(options: { cwd: string; name: string }) {
    const { cwd, name } = options;
    const sharedCoreDir = resolve(projectRoot, 'shared/core');

    // Common aliases for all modes
    // Priority: mocks/props/* then mocks/* — props/ 用于拆分 mock 的组件（如 pep-cloud-deploy-flow）
    const mockCandidates = [
        resolve(cwd, 'mocks/props/index.ts'),
        resolve(cwd, 'mocks/props/index.js'),
        resolve(cwd, 'mocks/props/default.json'),
        resolve(cwd, 'mocks/index.ts'),
        resolve(cwd, 'mocks/index.js'),
        resolve(cwd, 'mocks/default.json')
    ];
    const dataPath =
        mockCandidates.find((p) => fs.existsSync(p)) ?? resolve(cwd, 'mocks/default.json');

    const commonAliases = {
        '$lib': resolve(cwd, 'src/lib'),
        '$component': resolve(cwd, 'src/index.svelte'), // Convention: main component is src/index.svelte
        '$loader': resolve(cwd, 'src/component.server.ts'),
        '$data': dataPath,
        '/@shared': resolve(projectRoot, 'shared')
    };

    return defineConfig(({ command, mode }) => {
        // Check build mode from command line
        const buildMode = process.argv.find(arg =>
            arg === '--mode=server' ||
            arg === '--mode=client' ||
            arg === '--mode=data' ||
            arg === '--mode=editor'
        )?.split('=')[1] || 'client';

        if (buildMode === 'data') {
            return defineConfig({
                build: {
                    lib: {
                        entry: resolve(cwd, 'src/component.server.ts'),
                        name: `${name}Data`,
                        formats: ['cjs'],
                        fileName: (format) => `load-data.${format}`
                    },
                    outDir: 'dist/data',
                    emptyOutDir: true,
                    rollupOptions: {
                        external: [/\.json$/] // Don't bundle JSON files
                    }
                },
                resolve: { alias: commonAliases }
            });
        }

        if (buildMode === 'editor') {
            return defineConfig({
                plugins: [
                    svelte({ compilerOptions: { runes: true } })
                ],
                build: {
                    lib: {
                        entry: resolve(sharedCoreDir, 'entry-editor.ts'),
                        name: `${name}Editor`,
                        formats: ['es'],
                        fileName: 'entry-editor'
                    },
                    outDir: 'dist/editor',
                    emptyOutDir: true
                },
                resolve: { alias: commonAliases }
            });
        }

        if (buildMode === 'server' || process.argv.includes('--ssr')) {
            return defineConfig({
                plugins: [
                    svelte({ compilerOptions: { runes: true } })
                ],
                build: {
                    ssr: true,
                    rollupOptions: {
                        // Use shared server entry
                        input: resolve(sharedCoreDir, 'entry-server.ts'),
                        output: {
                            format: 'cjs',
                            // Preserve the export name structure if needed
                        }
                    },
                    outDir: 'dist/server',
                    emptyOutDir: true
                },
                resolve: { alias: commonAliases }
            });
        }

        // Client build
        if (mode === 'production') {
            return defineConfig({
                plugins: [
                    svelte({ compilerOptions: { runes: true } })
                ],
                build: {
                    lib: {
                        // Use shared client entry
                        entry: resolve(sharedCoreDir, 'entry-client.ts'),
                        formats: ['es'],
                        fileName: 'entry-client'
                    },
                    outDir: 'dist/client',
                    emptyOutDir: true
                },
                resolve: { alias: commonAliases }
            });
        }

        // Development - SPA mode with shared index.html
        return defineConfig({
            plugins: [
                svelte({ compilerOptions: { runes: true } }),
                {
                    name: 'serve-shared-html',
                    configureServer(server) {
                        server.middlewares.use((req, res, next) => {
                                if (req.url === '/' || req.url === '/index.html') {
                                const templatePath = resolve(projectRoot, 'shared/templates/index.html');
                                try {
                                    const html = fs.readFileSync(templatePath, 'utf-8');
                                    // Transform HTML to let Vite inject its client scripts
                                    server.transformIndexHtml(req.url, html).then(transformedHtml => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'text/html');
                                        res.end(transformedHtml);
                                    }).catch(e => {
                                        console.error(e);
                                        next(e);
                                    });
                                    return;
                                } catch (e) {
                                    console.error('Failed to read shared index.html', e);
                                }
                            }
                            next();
                        });
                    }
                }
            ],
            resolve: { alias: commonAliases }
        });
    });
}
