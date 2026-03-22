import { resolveLinkOpenMode } from './phase2';

export interface OpenLinkByPolicyParams {
    url: string;
    title: string;
    whitelistPatterns: string[];
    onOpenEmbedded?: (url: string, title: string) => void;
    onOpenExternal: (url: string) => void;
}

/**
 * 统一链接打开策略：
 * - 白名单命中：在伪浏览器中打开（embedded）
 * - 非白名单：新开页签打开（external）
 */
export function openLinkByPolicy(params: OpenLinkByPolicyParams): 'embedded' | 'external' {
    const { url, title, whitelistPatterns, onOpenEmbedded, onOpenExternal } = params;
    const mode = resolveLinkOpenMode(url, whitelistPatterns);

    if (mode === 'embedded' && onOpenEmbedded) {
        onOpenEmbedded(url, title);
        return 'embedded';
    }

    onOpenExternal(url);
    return 'external';
}

