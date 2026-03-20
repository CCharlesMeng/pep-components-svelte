import type { SidebarStepWithPreload } from '../runtime-data';
import {
    createFallbackRemoteContent,
    extractArticleContent,
    type RemoteContentData
} from './phase2';
import { fetchWithCache } from './remoteContentCache';

export interface RemoteFallbackTexts {
    messageTemplate: string;
    linkText: string;
}

interface LoadRemoteContentForStepParams {
    tabTitle: string;
    step: SidebarStepWithPreload;
    stepIndex: number;
    texts: RemoteFallbackTexts;
    fetchText?: (url: string) => Promise<string>;
    extractArticleHtml?: (html: string) => string;
}

export async function loadRemoteContentForStep(
    params: LoadRemoteContentForStepParams
): Promise<RemoteContentData> {
    const {
        tabTitle,
        step,
        stepIndex,
        texts,
        fetchText = fetchWithCache,
        extractArticleHtml = extractArticleContent
    } = params;

    try {
        const preloadedHtml = step.remoteContent.preloaded?.html;
        const preloadedCss = step.remoteContent.preloaded?.css ?? '';
        const html = preloadedHtml ?? (await fetchText(step.remoteContent.source.htmlUrl));
        const css = preloadedHtml
            ? preloadedCss
            : step.remoteContent.source.cssUrl
              ? await fetchText(step.remoteContent.source.cssUrl)
              : '';

        return {
            html: extractArticleHtml(html),
            css
        };
    } catch {
        return createFallbackRemoteContent(
            tabTitle,
            stepIndex + 1,
            step.title,
            step.remoteContent.source.htmlUrl,
            texts
        );
    }
}
