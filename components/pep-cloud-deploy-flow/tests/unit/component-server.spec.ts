import { describe, expect, it, vi, afterEach } from 'vitest';
import { loader } from '../../src/component.server';
import type { PepCloudDeployFlowProps } from '../../src/types';

const createMockData = (): PepCloudDeployFlowProps => ({
    navbar: {
        logo: { img: '', text: '' },
        breadcrumbs: [],
        rightActions: []
    },
    sidebar: {
        tabs: [
            {
                title: '手册',
                steps: [
                    {
                        title: '步骤1',
                        remoteContent: {
                            source: {
                                htmlUrl: 'https://example.com/a.html',
                                cssUrl: 'https://example.com/a.css'
                            }
                        }
                    },
                    {
                        title: '步骤2',
                        remoteContent: {
                            source: {
                                htmlUrl: 'https://example.com/a.html',
                                cssUrl: 'https://example.com/a.css'
                            }
                        }
                    }
                ]
            }
        ],
        footer: {
            prevText: '上一步',
            nextText: '下一步'
        },
        texts: {
            openExternalDefaultTitle: '新页面',
            remoteLoadingText: '加载中',
            remoteLoadFailedText: '失败',
            remoteFallbackMessageTemplate: '{tabLabel}-{stepId}-{stepLabel}',
            remoteFallbackLinkText: '打开'
        }
    },
    mainContent: {
        title: '',
        notice: {
            title: '',
            contentHtml: ''
        },
        cloudProducts: {
            title: '',
            products: []
        },
        deploymentEstimate: {
            price: '',
            priceNote: '',
            duration: '',
            durationLabel: ''
        },
        action: {
            buttonText: '',
            url: '',
            launchTitle: ''
        },
        agreement: {
            contentHtml: ''
        }
    },
    iframePages: {
        newTabPage: {
            tabTitle: '',
            title: {
                text: ''
            },
            addressPlaceholder: '',
            shortcuts: {
                title: '',
                items: []
            }
        }
    }
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('component.server loader', () => {
    it('should preload html and css for sidebar steps', async () => {
        const fetchMock = vi.fn(async (url: string) => ({
            ok: true,
            text: async () => (url.endsWith('.css') ? 'body{color:red;}' : '<div>article</div>')
        }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await loader({}, createMockData());
        const steps = result.sidebar.tabs[0].steps ?? [];

        expect(steps[0].remoteContent.preloaded?.html).toBe('<div>article</div>');
        expect(steps[0].remoteContent.preloaded?.css).toBe('body{color:red;}');
        expect(steps[1].remoteContent.preloaded?.html).toBe('<div>article</div>');
        expect(steps[1].remoteContent.preloaded?.css).toBe('body{color:red;}');
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should keep url-only config when preload request fails', async () => {
        const fetchMock = vi.fn(async () => ({
            ok: false,
            text: async () => ''
        }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await loader({}, createMockData());
        const firstStep = result.sidebar.tabs[0].steps?.[0];

        expect(firstStep?.remoteContent.preloaded).toBeUndefined();
        expect(firstStep?.remoteContent.source.htmlUrl).toBe('https://example.com/a.html');
        expect(firstStep?.remoteContent.source.cssUrl).toBe('https://example.com/a.css');
    });
});
