export interface NavbarLogo {
    img: string;
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

export interface RemoteContentConfig {
    source: {
        markdownContent?: string;
        htmlUrl?: string;
        cssUrl?: string;
    };
}

export interface SidebarStep {
    title: string;
    remoteContent: RemoteContentConfig;
}

export interface SidebarApplication {
    title: string;
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
    /** 白名单域名 patterns，命中则在伪浏览器中打开，否则新开页签。支持 *.example.com 通配符。 */
    linkWhitelistPatterns?: string[];
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

export interface PepCloudDeployFlowProps {
    navbar: NavbarConfig;
    sidebar: SidebarConfig;
    mainContent: MainContentConfig;
    iframePages: IframePagesConfig;
    backgroundImage: string;
    mobile: MobileConfig;
}
