export interface NavbarLogo {
    img: string;
    url?: string;
}

export interface BreadcrumbItem {
    text: string;
    url?: string;
}

export interface RightActionItem {
    text: string;
    url?: string;
    icon: string;
}

export interface SuccessRecommendationItem {
    icon: string;
    text: string;
    url: string;
}

export interface EndDeploymentConfig {
    buttonText: string;
    icon: string;
    modal: {
        title: string;
        icon: string;
        content: string;
        confirmText: string;
    };
    successPage: {
        title: string;
        description: string;
        items: SuccessRecommendationItem[];
        redeployText: string;
    };
}

export interface NavbarConfig {
    logo: NavbarLogo;
    breadcrumbs: BreadcrumbItem[];
    rightActions: RightActionItem[];
    endDeployment: EndDeploymentConfig;
}

export interface RemoteContentSource {
    /** 编配表单项；未传时仍按是否填写 markdown 推断（兼容旧数据） */
    contentType?: 'markdown' | 'remoteHtml';
    markdownContent?: string;
    htmlUrl?: string;
    cssUrl?: string;
}

export interface RemoteContentConfig {
    source: RemoteContentSource;
}

export interface SidebarStep {
    title: string;
    remoteContent: RemoteContentConfig;
}

export interface SidebarApplication {
    title?: string;
    steps: SidebarStep[];
}

export interface SidebarTab {
    title: string;
    applications?: SidebarApplication[];
    steps?: SidebarStep[];
}

export interface SidebarFooter {
    prevText: string;
    nextText: string;
}

export interface SidebarTexts {
    openExternalDefaultTitle: string;
    browserFrameLoadingText: string;
    remoteLoadingText: string;
    remoteLoadFailedText: string;
    remoteFallbackMessageTemplate: string;
    remoteFallbackLinkText: string;
    miniIconHoverText: string;
}

export interface SidebarIcons {
    floatIcon: string;
    switchToSideModeIcon: string;
    minimizeToSideIcon: string;
    collapseIcon: string;
    stepCheckedIcon: string;
    sideResizeIcon: string;
    sidebarMinimizeIcon: string;
}

export interface SidebarConfig {
    icons: SidebarIcons;
    tabs: SidebarTab[];
    footer: SidebarFooter;
    texts: SidebarTexts;
    /** 域名白名单 patterns，命中则在伪浏览器中打开，否则新开页签。支持 *.example.com 通配符。 */
    domainWhitelistPatterns?: string[];
}

export interface CloudProductItem {
    icon: string;
    text: string;
    url: string;
}

export interface MainContentConfig {
    title: string;
    notice: {
        contentHtml: string;
    };
    cloudProducts: {
        title: string;
        products: CloudProductItem[];
    };
    deploymentEstimate: {
        contentHtml: string;
    };
    action: {
        buttonText: string;
        url: string;
        launchTitle: string;
    };
    agreement: {
        contentHtml: string;
    };
}

export interface IframePageIconConfig {
    headerLogo: string;
    addTab: string;
    fullscreen: string;
    closeTab: string;
    switchToSideIcon: string;
}

export interface NewTabPageTitleConfig {
    icon: string;
    text: string;
}

export interface NewTabPageShortcutItem {
    icon: string;
    text: string;
    url: string;
}

export interface NewTabPageShortcutConfig {
    title: string;
    items: NewTabPageShortcutItem[];
}

export interface NewTabPageConfig {
    tabTitle: string;
    title: NewTabPageTitleConfig;
    addressPlaceholder: string;
    shortcuts: NewTabPageShortcutConfig;
}

export interface IframePagesConfig {
    domainWhitelistPatterns: string[];
    icons: IframePageIconConfig;
    newTabPage: NewTabPageConfig;
    frameLoadingText: string;
}

export interface MobileNavbarConfig {
    logo: NavbarLogo;
    breadcrumbs: BreadcrumbItem[];
}

export interface MobileLinkImageConfig {
    image: string;
    url: string;
}

export interface MobileConfig {
    navbar: MobileNavbarConfig;
    linkImage: MobileLinkImageConfig;
    steps: SidebarStep[];
}

// ─── 新增：theme 模块 ───────────────────────────────────────────────────────

export interface ThemeIconsSidebar {
    floatIcon: string;
    switchToSideModeIcon: string;
    minimizeToSideIcon: string;
    collapseIcon: string;
    stepCheckedIcon: string;
    sideResizeIcon: string;
    sidebarMinimizeIcon: string;
}

export interface ThemeIconsBrowser {
    headerLogo: string;
    addTab: string;
    fullscreen: string;
    closeTab: string;
    switchToSideIcon: string;
}

export interface ThemeTexts {
    openExternalDefaultTitle: string;
    browserFrameLoadingText: string;
    remoteLoadingText: string;
    remoteLoadFailedText: string;
    remoteFallbackMessageTemplate: string;
    remoteFallbackLinkText: string;
    miniIconHoverText: string;
}

export interface ThemeConfig {
    icons: {
        sidebar: ThemeIconsSidebar;
        browser: ThemeIconsBrowser;
    };
    texts: ThemeTexts;
}

// ─── 新增：shortcuts 模块 ──────────────────────────────────────────────────

export interface ShortcutItem {
    icon: string;
    text: string;
    url: string;
}

export interface ShortcutsConfig {
    deployPage: {
        title: string;
        items: ShortcutItem[];
    };
    finishPage: {
        description: string;
        items: ShortcutItem[];
    };
    browserNewTab: {
        title: string;
        items: ShortcutItem[];
    };
}

// ─── 新增：schema 层的原始 props（字段为新结构，icons/texts 在 theme，快捷入口在 shortcuts）

export interface PepCloudDeployFlowSchemaProps {
    navbar: Omit<NavbarConfig, 'endDeployment'> & {
        endDeployment: Omit<EndDeploymentConfig, 'successPage'> & {
            successPage: Pick<EndDeploymentConfig['successPage'], 'title' | 'redeployText'>;
        };
    };
    sidebar: {
        tabs: SidebarTab[];
        footer: SidebarFooter;
    };
    mainContent: Omit<MainContentConfig, 'cloudProducts'>;
    backgroundImage: string;
    iframePages: {
        domainWhitelistPatterns: string[];
        newTabPage: Omit<NewTabPageConfig, 'shortcuts'>;
    };
    mobile: {
        navbar?: {
            logo?: NavbarLogo;
            breadcrumbs?: BreadcrumbItem[];
        };
        linkImage: MobileLinkImageConfig;
        steps?: SidebarStep[];
    };
    theme: ThemeConfig;
    shortcuts: ShortcutsConfig;
}

export interface PepCloudDeployFlowProps extends PepCloudDeployFlowSchemaProps {}
