import { describe, expect, it, vi, afterEach } from 'vitest';
import { loader } from '../../src/component.server';
import type { PepCloudDeployFlowProps } from '../../src/types';
import defaultData from '../../mocks/default.json';

const cloneDefault = (): PepCloudDeployFlowProps =>
    JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;

const createMockData = (): PepCloudDeployFlowProps => {
    const data = cloneDefault();
    data.mobile.steps = [];
    data.sidebar.tabs = [
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
    ];
    return data;
};

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

    it('should preload html and css for mobile steps', async () => {
        const data = createMockData();
        data.mobile.steps = [
            {
                title: '移动步骤1',
                remoteContent: {
                    source: {
                        htmlUrl: 'https://example.com/mobile-a.html',
                        cssUrl: 'https://example.com/mobile-a.css'
                    }
                }
            }
        ];
        const fetchMock = vi.fn(async (url: string) => ({
            ok: true,
            text: async () => (url.endsWith('.css') ? 'body{color:blue;}' : '<div>mobile</div>')
        }));
        vi.stubGlobal('fetch', fetchMock);

        const result = await loader({}, data);

        expect(result.mobile.steps[0].remoteContent.preloaded?.html).toBe('<div>mobile</div>');
        expect(result.mobile.steps[0].remoteContent.preloaded?.css).toBe('body{color:blue;}');
        expect(fetchMock).toHaveBeenCalledTimes(4);
    });
});
