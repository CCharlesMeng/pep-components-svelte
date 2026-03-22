import type { PepCloudDeployFlowProps, SidebarStep } from './types';
import type { PepCloudDeployFlowRuntimeProps, SidebarStepWithPreload } from './runtime-data';

interface LoaderMethod {
    requestClient?: {
        fetch?: typeof fetch;
    };
}

type FetchText = (url: string) => Promise<string | null>;

function createFetchText(method: LoaderMethod): FetchText | null {
    const requestClientFetch = method.requestClient?.fetch;
    const globalFetch = typeof fetch === 'function' ? fetch : undefined;
    const fetcher = requestClientFetch ?? globalFetch;

    if (!fetcher) {
        return null;
    }

    return async (url: string): Promise<string | null> => {
        try {
            const response = await fetcher(url);
            if (!response.ok) {
                return null;
            }
            return await response.text();
        } catch {
            return null;
        }
    };
}

async function preloadRemoteContent(
    props: PepCloudDeployFlowProps,
    fetchText: FetchText
): Promise<PepCloudDeployFlowRuntimeProps> {
    const urlCache = new Map<string, Promise<string | null>>();

    const fetchOnce = (url: string | undefined): Promise<string | null> => {
        if (!url) {
            return Promise.resolve(null);
        }
        const existing = urlCache.get(url);
        if (existing) {
            return existing;
        }
        const request = fetchText(url);
        urlCache.set(url, request);
        return request;
    };

    const preloadSteps = async (steps: SidebarStep[]): Promise<SidebarStepWithPreload[]> =>
        Promise.all(
            steps.map(async (step) => {
                if (step.remoteContent.source.markdownContent?.trim()) {
                    return {
                        ...step
                    };
                }
                const [html, css] = await Promise.all([
                    fetchOnce(step.remoteContent.source.htmlUrl),
                    fetchOnce(step.remoteContent.source.cssUrl)
                ]);
                const preloaded = {
                    ...(html ? { html } : {}),
                    ...(css ? { css } : {})
                };
                return {
                    ...step,
                    remoteContent: {
                        ...step.remoteContent,
                        ...(Object.keys(preloaded).length > 0 ? { preloaded } : {})
                    }
                };
            })
        );

    const tabs = await Promise.all(
        props.sidebar.tabs.map(async (tab) => {
            const applications = tab.applications
                ? await Promise.all(
                    tab.applications.map(async (application) => ({
                        ...application,
                        steps: await preloadSteps(application.steps)
                    }))
                )
                : undefined;

            const steps = tab.steps ? await preloadSteps(tab.steps) : undefined;

            return {
                ...tab,
                ...(applications ? { applications } : {}),
                ...(steps ? { steps } : {})
            };
        })
    );

    const mobileSteps = props.mobile.steps ? await preloadSteps(props.mobile.steps) : undefined;

    return {
        ...props,
        sidebar: {
            ...props.sidebar,
            tabs
        },
        mobile: {
            ...props.mobile,
            steps: mobileSteps
        }
    };
}

export const loader = async (
    method: LoaderMethod,
    data: unknown
): Promise<PepCloudDeployFlowRuntimeProps> => {
    const props = { ...(data as PepCloudDeployFlowProps) };
    const fetchText = createFetchText(method);

    if (!fetchText) {
        return props;
    }

    return preloadRemoteContent(props, fetchText);
};
