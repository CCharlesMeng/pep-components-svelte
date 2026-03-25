import type { MobileConfig, PepCloudDeployFlowProps, SidebarFooter } from '../types';
import type { PepCloudDeployFlowRuntimeProps } from '../runtime-data';
import { resolveMobileSteps } from './props-resolver';

export interface ResolvedMobileConfig extends MobileConfig {
    title: string;
    footer: SidebarFooter;
}

export function resolveMobileConfig(data: PepCloudDeployFlowRuntimeProps): ResolvedMobileConfig {
    return {
        navbar: {
            logo: {
                ...data.navbar.logo,
                ...(data.mobile.navbar?.logo ?? {}),
            },
            breadcrumbs: data.mobile.navbar?.breadcrumbs ?? data.navbar.breadcrumbs,
        },
        linkImage: data.mobile.linkImage,
        steps: resolveMobileSteps(data),
        title: data.mainContent.title,
        footer: data.sidebar.footer,
    };
}
