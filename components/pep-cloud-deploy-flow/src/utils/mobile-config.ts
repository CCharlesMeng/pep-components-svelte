import type { MobileConfig, PepCloudDeployFlowProps, SidebarFooter } from '../types';

export interface ResolvedMobileConfig extends MobileConfig {
    title: string;
    footer: SidebarFooter;
}

export function resolveMobileConfig(data: PepCloudDeployFlowProps): ResolvedMobileConfig {
    return {
        ...data.mobile,
        title: data.mainContent.title,
        footer: data.sidebar.footer
    };
}
