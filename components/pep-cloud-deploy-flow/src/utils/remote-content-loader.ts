import type { SidebarStepWithPreload } from '../runtime-data';
import { marked } from 'marked';
import {
    createFallbackRemoteContent,
    extractArticleContent,
    type RemoteContentData
} from './phase2';
import { fetchWithCache } from './remoteContentCache';
import { isRemoteContentMarkdownMode } from './remote-source-mode';

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
        const src = step.remoteContent.source;
        if (isRemoteContentMarkdownMode(src)) {
            const markdownContent = src.markdownContent?.trim();
            if (!markdownContent) {
                throw new Error('Missing markdownContent');
            }
            return {
                html: marked.parse(markdownContent, { async: false }) as string,
                css: '',
                sourceType: 'markdown'
            };
        }

        const preloadedHtml = step.remoteContent.preloaded?.html;
        const preloadedCss = step.remoteContent.preloaded?.css ?? '';
        const htmlUrl = step.remoteContent.source.htmlUrl;
        if (!preloadedHtml && !htmlUrl) {
            throw new Error('Missing htmlUrl and markdownContent');
        }
        const html = preloadedHtml ?? (await fetchText(htmlUrl ?? ''));
        const css = preloadedHtml
            ? preloadedCss
            : step.remoteContent.source.cssUrl
              ? await fetchText(step.remoteContent.source.cssUrl)
              : '';

        return {
            html: extractArticleHtml(html),
            css,
            sourceType: 'remote'
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
