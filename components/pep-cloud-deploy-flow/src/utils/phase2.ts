export interface BrowserExternalUrl {
    url: string;
    title: string;
    timestamp: number;
}

export interface BrowserTab {
    id: string;
    title: string;
    url: string;
    active: boolean;
}

export interface RemoteContentData {
    html: string;
    css?: string;
}

export interface RemoteContentFallbackTexts {
    messageTemplate: string;
    linkText: string;
}

const ARTICLE_BOX_SELECTOR = '.articleBoxWithoutHead';
const TABLE_SCROLL_WRAP_CLASS = 'pep-cloud-deploy-flow-sidebar__table-wrap';

/**
 * 将 box 内所有 table 包一层横向滚动容器，压缩后超出时出现横向滚动条。
 */
function wrapTablesInScrollContainer(box: Element): void {
    const tables = box.querySelectorAll('table');
    tables.forEach((table) => {
        const wrap = box.ownerDocument.createElement('div');
        wrap.className = TABLE_SCROLL_WRAP_CLASS;
        table.parentNode?.insertBefore(wrap, table);
        wrap.appendChild(table);
    });
}

/**
 * 从完整页面 HTML 中仅提取 .articleBoxWithoutHead 及其子节点，避免整页 DOM 导致渲染异常。
 * 表格会被包在横向滚动容器内，超出侧边栏宽度时出现横向滚动条。
 * 若未找到该元素则返回原始 html。
 */
export function extractArticleContent(html: string): string {
    if (typeof document === 'undefined' || !html?.trim()) {
        return html;
    }
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const box = doc.querySelector(ARTICLE_BOX_SELECTOR);
        if (box) {
            wrapTablesInScrollContainer(box);
            return box.outerHTML;
        }
    } catch {
        // 解析失败时返回原文
    }
    return html;
}

export function shouldHijackLink(href: string | null | undefined): boolean {
    if (!href) {
        return false;
    }
    return href.trim().length > 0 && !href.startsWith('#');
}

export function getPrevStepIndex(activeStepIndex: number): number {
    return Math.max(0, activeStepIndex - 1);
}

export function getNextStepIndex(activeStepIndex: number, totalSteps: number): number {
    if (totalSteps <= 0) {
        return 0;
    }
    return Math.min(totalSteps - 1, activeStepIndex + 1);
}

export function injectExternalTab(
    tabs: BrowserTab[],
    externalUrl: BrowserExternalUrl,
    fallbackTitle: string
): BrowserTab[] {
    const next = tabs.map((item) => ({ ...item, active: false }));
    next.push({
        id: String(externalUrl.timestamp),
        title: externalUrl.title || fallbackTitle,
        url: externalUrl.url,
        active: true
    });
    return next;
}

export function createFallbackRemoteContent(
    tabLabel: string,
    stepId: number,
    stepLabel: string,
    htmlUrl: string | undefined,
    texts: RemoteContentFallbackTexts
): RemoteContentData {
    const fallbackMessage = texts.messageTemplate
        .replaceAll('{tabLabel}', tabLabel)
        .replaceAll('{stepId}', String(stepId))
        .replaceAll('{stepLabel}', stepLabel);
    const safeUrl = htmlUrl ?? '';

    return {
        html: `
            <h2>${stepLabel}</h2>
            <p>${fallbackMessage}</p>
            <a href="${safeUrl}" target="_blank" rel="noreferrer">${texts.linkText}</a>
        `,
        css: '.remote-content a{color:#165dff;text-decoration:none}.remote-content a:hover{text-decoration:underline}'
    };
}
