import { describe, expect, it, vi } from 'vitest';
import { openLinkByPolicy } from '../../src/utils/link-open-policy';

describe('openLinkByPolicy', () => {
    it('uses embedded mode for whitelist links', () => {
        const onOpenEmbedded = vi.fn();
        const onOpenExternal = vi.fn();

        const mode = openLinkByPolicy({
            url: 'https://console.huaweicloud.com/aos',
            title: 'AOS 控制台',
            whitelistPatterns: ['*.huaweicloud.com'],
            onOpenEmbedded,
            onOpenExternal
        });

        expect(mode).toBe('embedded');
        expect(onOpenEmbedded).toHaveBeenCalledTimes(1);
        expect(onOpenEmbedded).toHaveBeenCalledWith(
            'https://console.huaweicloud.com/aos',
            'AOS 控制台'
        );
        expect(onOpenExternal).not.toHaveBeenCalled();
    });

    it('opens external tab for non-whitelist links', () => {
        const onOpenEmbedded = vi.fn();
        const onOpenExternal = vi.fn();

        const mode = openLinkByPolicy({
            url: 'https://github.com',
            title: 'Github',
            whitelistPatterns: ['*.huaweicloud.com'],
            onOpenEmbedded,
            onOpenExternal
        });

        expect(mode).toBe('external');
        expect(onOpenEmbedded).not.toHaveBeenCalled();
        expect(onOpenExternal).toHaveBeenCalledTimes(1);
        expect(onOpenExternal).toHaveBeenCalledWith('https://github.com');
    });

    it('falls back to external when embedded callback is absent', () => {
        const onOpenExternal = vi.fn();

        const mode = openLinkByPolicy({
            url: 'https://console.huaweicloud.com/ecs',
            title: 'ECS',
            whitelistPatterns: ['*.huaweicloud.com'],
            onOpenExternal
        });

        expect(mode).toBe('external');
        expect(onOpenExternal).toHaveBeenCalledTimes(1);
        expect(onOpenExternal).toHaveBeenCalledWith('https://console.huaweicloud.com/ecs');
    });
});

