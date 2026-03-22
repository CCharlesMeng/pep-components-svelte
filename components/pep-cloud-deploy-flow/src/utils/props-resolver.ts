import type {
    SidebarConfig,
    IframePagesConfig,
    MainContentConfig,
    EndDeploymentConfig,
    NavbarConfig,
    SidebarStep,
} from '../types';
import type { PepCloudDeployFlowRuntimeProps, SidebarStepWithPreload } from '../runtime-data';

/**
 * 为 SidebarPanel 组装完整的 SidebarConfig。
 * 将 theme.icons.sidebar 和 theme.texts 注入回 sidebar.icons / sidebar.texts，
 * 输出结构与重构前的 SidebarConfig 完全一致。
 */
export function resolveSidebarForPanel(data: PepCloudDeployFlowRuntimeProps): SidebarConfig & { tabs: PepCloudDeployFlowRuntimeProps['sidebar']['tabs'] } {
    return {
        ...data.sidebar,
        icons: data.theme.icons.sidebar,
        texts: data.theme.texts,
        domainWhitelistPatterns: data.iframePages.domainWhitelistPatterns ?? [],
    };
}

/**
 * 为 PseudoBrowser 组装完整的 IframePagesConfig。
 * 将 theme.icons.browser 注入回 iframePages.icons，
 * 将 theme.texts.browserFrameLoadingText 注入为 iframePages.frameLoadingText，
 * 将 shortcuts.browserNewTab 注入回 iframePages.newTabPage.shortcuts。
 */
export function resolveIframePagesForBrowser(data: PepCloudDeployFlowRuntimeProps): IframePagesConfig {
    return {
        ...data.iframePages,
        icons: data.theme.icons.browser,
        newTabPage: {
            ...data.iframePages.newTabPage,
            shortcuts: data.shortcuts.browserNewTab,
        },
        frameLoadingText: data.theme.texts.browserFrameLoadingText,
    };
}

/**
 * 为 MainPanel 组装完整的 MainContentConfig。
 * 将 shortcuts.deployPage 注入回 mainContent.cloudProducts，
 * 输出结构与重构前的 MainContentConfig 完全一致。
 */
export function resolveMainContent(data: PepCloudDeployFlowRuntimeProps): MainContentConfig {
    return {
        ...data.mainContent,
        cloudProducts: {
            title: data.shortcuts.deployPage.title,
            products: data.shortcuts.deployPage.items,
        },
    };
}

/**
 * 为 DeploymentFinished 组装完整的 EndDeploymentConfig。
 * 将 shortcuts.finishPage 的 description 和 items 注入回 successPage，
 * 输出结构与重构前的 EndDeploymentConfig 完全一致。
 */
export function resolveEndDeployment(data: PepCloudDeployFlowRuntimeProps): EndDeploymentConfig {
    return {
        ...data.navbar.endDeployment,
        successPage: {
            ...data.navbar.endDeployment.successPage,
            description: data.shortcuts.finishPage.description,
            items: data.shortcuts.finishPage.items,
        },
    };
}

/** 顶栏与结束页共用完整 endDeployment.successPage（含 shortcuts 注入）。 */
export function resolveNavbarForBar(data: PepCloudDeployFlowRuntimeProps): NavbarConfig {
    return {
        ...data.navbar,
        endDeployment: resolveEndDeployment(data),
    };
}

/**
 * 从 theme 中提取 index.svelte 直接使用的侧边栏手柄图标。
 */
export function resolveSidebarHandleIcons(data: PepCloudDeployFlowRuntimeProps): {
    sidebarMinimizeIcon: string;
    sideResizeIcon: string;
} {
    return {
        sidebarMinimizeIcon: data.theme.icons.sidebar.sidebarMinimizeIcon,
        sideResizeIcon: data.theme.icons.sidebar.sideResizeIcon,
    };
}

/**
 * 当 mobile.steps 为空时，从 sidebar.tabs[0] 展平步骤作为 fallback。
 * 支持单应用模式（直接有 steps）和多应用模式（有 applications）。
 */
export function resolveMobileSteps(data: PepCloudDeployFlowRuntimeProps): SidebarStepWithPreload[] {
    if (data.mobile.steps && data.mobile.steps.length > 0) {
        return data.mobile.steps;
    }
    const firstTab = data.sidebar.tabs?.[0];
    if (!firstTab) return [];
    if (firstTab.applications && firstTab.applications.length > 0) {
        return firstTab.applications.flatMap((app) => app.steps);
    }
    return firstTab.steps ?? [];
}
