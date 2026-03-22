import type { PepCloudDeployFlowProps, RemoteContentConfig } from './types';

/** 服务端 loader 合并抓取结果后写入；不属于编配/Schema 字段 */
export type RemoteContentWithPreload = RemoteContentConfig & {
    preloaded?: { html?: string; css?: string };
};

export type SidebarStepWithPreload = {
    title: string;
    remoteContent: RemoteContentWithPreload;
};

export type SidebarApplicationWithPreload = {
    title: string;
    steps: SidebarStepWithPreload[];
};

export type SidebarTabWithPreload = {
    title: string;
    applications?: SidebarApplicationWithPreload[];
    steps?: SidebarStepWithPreload[];
};

export type PepCloudDeployFlowRuntimeProps = Omit<PepCloudDeployFlowProps, 'sidebar' | 'mobile'> & {
    sidebar: Omit<PepCloudDeployFlowProps['sidebar'], 'tabs'> & { tabs: SidebarTabWithPreload[] };
    mobile: Omit<PepCloudDeployFlowProps['mobile'], 'steps'> & { steps?: SidebarStepWithPreload[] };
};
