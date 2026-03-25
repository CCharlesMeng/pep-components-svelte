import { describe, expect, it } from 'vitest';
import {
    createFallbackRemoteContent,
    getNextStepIndex,
    getPrevStepIndex,
    injectExternalTab,
    shouldHijackLink,
    isUrlInWhitelist,
    resolveLinkOpenMode
} from '../../src/utils/phase2';
import type { BrowserTab } from '../../src/utils/phase2';

describe('phase2 utils', () => {
    it('should hijack non-anchor links only', () => {
        expect(shouldHijackLink('https://example.com')).toBe(true);
        expect(shouldHijackLink('/api/content/deploy.html')).toBe(true);
        expect(shouldHijackLink('#')).toBe(false);
        expect(shouldHijackLink('')).toBe(false);
    });

    it('should navigate prev/next step with boundary clamp', () => {
        expect(getPrevStepIndex(0)).toBe(0);
        expect(getPrevStepIndex(2)).toBe(1);
        expect(getNextStepIndex(0, 3)).toBe(1);
        expect(getNextStepIndex(2, 3)).toBe(2);
    });

    it('should inject external tab and set it active', () => {
        const currentTabs: BrowserTab[] = [
            { id: '1', title: 'A', url: 'https://a.com', active: true },
            { id: '2', title: 'B', url: 'https://b.com', active: false }
        ];

        const nextTabs = injectExternalTab(currentTabs, {
            url: 'https://new.com',
            title: 'New',
            timestamp: 1001
        }, '默认页签');

        expect(nextTabs).toHaveLength(3);
        expect(nextTabs[2]).toMatchObject({
            id: '1001',
            title: 'New',
            url: 'https://new.com',
            active: true
        });
        expect(nextTabs.filter((item) => item.active)).toHaveLength(1);
    });

    it('should produce fallback html from step metadata', () => {
        const content = createFallbackRemoteContent(
            '操作手册',
            2,
            '立即部署',
            'https://console.huaweicloud.com/aos/',
            {
                messageTemplate: '当前位于 {tabLabel} 第 {stepId} 步：{stepLabel}',
                linkText: '打开链接'
            }
        );
        expect(content.html).toContain('操作手册');
        expect(content.html).toContain('立即部署');
        expect(content.html).toContain('当前位于 操作手册 第 2 步：立即部署');
        expect(content.html).toContain('href="https://console.huaweicloud.com/aos/"');
        expect(content.html).toContain('打开链接');
    });

    it('should match whitelist patterns for exact and wildcard hostnames', () => {
        const patterns = ['*.huaweicloud.com', 'example.org'];
        expect(isUrlInWhitelist('https://support.huaweicloud.com/doc', patterns)).toBe(true);
        // 现有规则中，*.domain.com 也匹配根域 domain.com
        expect(isUrlInWhitelist('https://huaweicloud.com/doc', patterns)).toBe(true);
        expect(isUrlInWhitelist('https://example.org/path', patterns)).toBe(true);
        expect(isUrlInWhitelist('https://evil.com/path', patterns)).toBe(false);
    });

    it('should resolve link open mode by whitelist', () => {
        const patterns = ['*.huaweicloud.com'];
        expect(resolveLinkOpenMode('https://console.huaweicloud.com/aos', patterns)).toBe('embedded');
        expect(resolveLinkOpenMode('https://github.com', patterns)).toBe('external');
        expect(resolveLinkOpenMode('not-a-valid-url', patterns)).toBe('external');
    });
});
