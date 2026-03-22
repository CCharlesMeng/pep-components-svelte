/** 与 schema 中 source.contentType 及历史数据（无 contentType 时按字段推断）对齐 */

export type RemoteContentSourceLike = {
    contentType?: 'markdown' | 'remoteHtml';
    markdownContent?: string;
};

export function isRemoteContentMarkdownMode(source: RemoteContentSourceLike): boolean {
    if (source.contentType === 'remoteHtml') return false;
    if (source.contentType === 'markdown') return true;
    return Boolean(source.markdownContent?.trim());
}
