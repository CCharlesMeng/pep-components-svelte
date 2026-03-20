export interface NavbarLogo {
    img: string;
    text: string;
}

export interface BreadcrumbItem {
    text: string;
    url?: string;
}

export interface RightActionItem {
    icon: string;
    text: string;
    url?: string;
}

export interface SuccessRecommendationItem {
    icon: string;
    text: string;
    url: string;
}

export interface EndDeploymentConfig {
    buttonText: string;
    /** 按钮图标地址（真实图标 URL） */
    icon?: string;
    modal: {
        title: string;
        /** 提示图标地址（真实图标 URL） */
        icon?: string;
        content: string;
        confirmText: string;
    };
    successPage: {
        title: string;
        /** 结束页描述文案 */
        description?: string;
        /** 快捷入口卡片列表 */
        items: SuccessRecommendationItem[];
        /** 重新部署按钮文案 */
        redeployText: string;
    };
}

export interface NavbarConfig {
    logo: NavbarLogo;
    breadcrumbs: BreadcrumbItem[];
    rightActions: RightActionItem[];
    endDeployment?: EndDeploymentConfig;
}

export interface RemoteContentConfig {
    source: {
        htmlUrl: string;
        cssUrl?: string;
    };
    /** 服务端预取后的远程内容 */
    preloaded?: {
        html?: string;
        css?: string;
    };
}

export interface SidebarStep {
    title: string;
    remoteContent: RemoteContentConfig;
}

/** 应用：每个应用对应一套 steps，用于 tab 下层的下拉选择 */
export interface SidebarApplication {
    title: string;
    steps: SidebarStep[];
}

export interface SidebarTab {
    title: string;
    /** 应用列表。为空或未配置时等同于单应用，不展示下拉框，使用 steps */
    applications?: SidebarApplication[];
    /** 步骤列表。无 applications 或 applications 为空时使用 */
    steps?: SidebarStep[];
}

export interface SidebarFooter {
    prevText: string;
    nextText: string;
}

export interface SidebarTexts {
    openExternalDefaultTitle: string;
    remoteLoadingText: string;
    remoteLoadFailedText: string;
    remoteFallbackMessageTemplate: string;
    remoteFallbackLinkText: string;
    miniIconHoverText?: string;
}

/** 侧栏头部工具区图标（悬浮/全屏/折叠等，真实图标 URL） */
export interface SidebarIcons {
    floatIcon?: string;
    switchToSideModeIcon?: string;
    minimizeToSideIcon?: string;
    collapseIcon?: string;
    stepCheckedIcon?: string;
    sideResizeIcon?: string;
    /** 侧栏折叠后用于恢复的图标（视口右侧纵向居中） */
    sidebarMinimizeIcon?: string;
}

export interface SidebarConfig {
    /** 头部工具区图标：悬浮/全屏/折叠等 */
    icons?: SidebarIcons;
    tabs: SidebarTab[];
    footer: SidebarFooter;
    texts: SidebarTexts;
}

export interface CloudProductItem {
    icon: string;
    text: string;
    url: string;
}

export interface MainContentConfig {
    title: string;
    notice: {
        title: string;
        contentHtml: string;
    };
    cloudProducts: {
        title: string;
        products: CloudProductItem[];
    };
    deploymentEstimate: {
        price: string;
        priceNote: string;
        duration: string;
        durationLabel: string;
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
    /** 地址栏 URL 前缀图标 */
    headerLogo?: string;
    /** 新建页签图标 */
    addTab?: string;
    /** 全屏伪浏览器图标 */
    fullscreen?: string;
    /** 每个页签的关闭图标 */
    closeTab?: string;
    /** 全屏时切回侧边模式图标 */
    switchToSideIcon?: string;
}

export interface NewTabPageTitleConfig {
    /** 新建页主标题图标 */
    icon?: string;
    /** 新建页主标题文案 */
    text: string;
}

export interface NewTabPageShortcutItem {
    /** 快捷入口图标 URL */
    icon: string;
    /** 快捷入口名称 */
    text: string;
    /** 快捷入口跳转链接 */
    url: string;
}

export interface NewTabPageShortcutConfig {
    /** 快捷入口区域标题 */
    title: string;
    /** 快捷入口列表 */
    items: NewTabPageShortcutItem[];
}

export interface NewTabPageConfig {
    /** 新标签页页签标题 */
    tabTitle: string;
    /** 新建页主标题 */
    title: NewTabPageTitleConfig;
    /** 新建标签页地址栏 placeholder 文案 */
    addressPlaceholder: string;
    /** 新建页快捷入口区域 */
    shortcuts: NewTabPageShortcutConfig;
}

/** 伪浏览器配置（图标资源与新建页内容） */
export interface IframePagesConfig {
    /** 伪浏览器图标资源 */
    icons?: IframePageIconConfig;
    /** 新建页配置 */
    newTabPage: NewTabPageConfig;
    /** 伪浏览器域名白名单（pattern 列表） */
    domainWhitelistPatterns?: string[];
}

export interface PepCloudDeployFlowProps {
    navbar: NavbarConfig;
    sidebar: SidebarConfig;
    mainContent: MainContentConfig;
    /** 伪浏览器与 iframe 区域图标配置，可填入对应图标地址 */
    iframePages: IframePagesConfig;
    /** 全局背景图片地址，应用于部署引导页、实操结束页和伪浏览器空白页 */
    backgroundImage?: string;
}
