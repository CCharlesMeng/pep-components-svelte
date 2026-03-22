import { describe, expect, it, vi } from 'vitest';
import { loadRemoteContentForStep } from '../../src/utils/remote-content-loader';
import type { SidebarStepWithPreload } from '../../src/runtime-data';

const createStep = (): SidebarStepWithPreload => ({
    title: '步骤1',
    remoteContent: {
        source: {
            htmlUrl: 'https://example.com/step-1.html',
            cssUrl: 'https://example.com/step-1.css'
        }
    }
});

describe('loadRemoteContentForStep', () => {
    it('prioritizes markdown content and skips remote fetch', async () => {
        const fetchText = vi.fn(async () => '<html>should-not-load</html>');
        const extractArticleHtml = vi.fn((html: string) => `<article>${html}</article>`);
        const step: SidebarStepWithPreload = {
            ...createStep(),
            remoteContent: {
                source: {
                    markdownContent: '## 标题\n\n**加粗内容**',
                    htmlUrl: 'https://example.com/unused.html',
                    cssUrl: 'https://example.com/unused.css'
                }
            }
        };

        const result = await loadRemoteContentForStep({
            tabTitle: '操作手册',
            step,
            stepIndex: 0,
            texts: {
                messageTemplate: '{tabLabel}-{stepId}-{stepLabel}',
                linkText: '打开'
            },
            fetchText,
            extractArticleHtml
        });

        expect(result.html).toContain('<h2>标题</h2>');
        expect(result.html).toContain('<strong>加粗内容</strong>');
        expect(result.css).toBe('');
        expect(fetchText).not.toHaveBeenCalled();
        expect(extractArticleHtml).not.toHaveBeenCalled();
    });

    it('uses preloaded html/css when provided', async () => {
        const step: SidebarStepWithPreload = {
            ...createStep(),
            remoteContent: {
                ...createStep().remoteContent,
                preloaded: {
                    html: '<div>preloaded</div>',
                    css: '.preloaded { color: red; }'
                }
            }
        };
        const fetchText = vi.fn();
        const result = await loadRemoteContentForStep({
            tabTitle: '操作手册',
            step,
            stepIndex: 0,
            texts: {
                messageTemplate: '{tabLabel}-{stepId}-{stepLabel}',
                linkText: '打开'
            },
            fetchText
        });

        expect(result.html).toBe('<div>preloaded</div>');
        expect(result.css).toBe('.preloaded { color: red; }');
        expect(fetchText).not.toHaveBeenCalled();
    });

    it('fetches and extracts html/css when preloaded is absent', async () => {
        const step = createStep();
        const fetchText = vi.fn(async (url: string) =>
            url.endsWith('.css') ? '.remote { color: blue; }' : '<html>remote-html</html>'
        );
        const extractArticleHtml = vi.fn((html: string) => `<article>${html}</article>`);

        const result = await loadRemoteContentForStep({
            tabTitle: '操作手册',
            step,
            stepIndex: 1,
            texts: {
                messageTemplate: '{tabLabel}-{stepId}-{stepLabel}',
                linkText: '打开'
            },
            fetchText,
            extractArticleHtml
        });

        expect(fetchText).toHaveBeenCalledTimes(2);
        expect(result.html).toBe('<article><html>remote-html</html></article>');
        expect(result.css).toBe('.remote { color: blue; }');
    });

    it('returns fallback remote content when load fails', async () => {
        const step = createStep();
        const fetchText = vi.fn(async () => {
            throw new Error('boom');
        });

        const result = await loadRemoteContentForStep({
            tabTitle: '操作手册',
            step,
            stepIndex: 2,
            texts: {
                messageTemplate: '{tabLabel}-{stepId}-{stepLabel}',
                linkText: '打开'
            },
            fetchText
        });

        expect(result.html).toContain('步骤1');
        expect(result.html).toContain('操作手册');
        expect(result.html).toContain('https://example.com/step-1.html');
    });
});
