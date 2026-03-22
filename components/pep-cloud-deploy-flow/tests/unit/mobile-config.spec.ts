import { describe, expect, it } from 'vitest';
import type { PepCloudDeployFlowProps } from '../../src/types';
import { resolveMobileConfig } from '../../src/utils/mobile-config';
import defaultData from '../../mocks/props/default.json';

describe('resolveMobileConfig', () => {
    it('merges PC title and sidebar footer into resolved mobile config', () => {
        const data = JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;

        const resolved = resolveMobileConfig(data);

        expect(resolved.title).toBe(data.mainContent.title);
        expect(resolved.footer).toEqual(data.sidebar.footer);
    });

    it('falls back to sidebar.tabs[0] steps when mobile.steps is empty', () => {
        const data = JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;
        // mobile.steps 未填写，应 fallback 到 sidebar.tabs[0]
        data.mobile.steps = undefined;

        const resolved = resolveMobileConfig(data);

        // sidebar.tabs[0] 是多应用模式，展平所有 applications 的 steps
        const firstTab = data.sidebar.tabs[0];
        const expectedSteps = firstTab.applications
            ? firstTab.applications.flatMap((app) => app.steps)
            : (firstTab.steps ?? []);
        expect(resolved.steps.length).toBe(expectedSteps.length);
    });

    it('uses mobile.steps when explicitly provided', () => {
        const data = JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;
        data.mobile.steps = [
            {
                title: '移动专属步骤',
                remoteContent: { source: { markdownContent: '# 移动端内容' } }
            }
        ];

        const resolved = resolveMobileConfig(data);

        expect(resolved.steps.length).toBe(1);
        expect(resolved.steps[0].title).toBe('移动专属步骤');
    });

    it('falls back to navbar logo when mobile.navbar.logo is not set', () => {
        const data = JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;
        // mobile.navbar 未填写
        data.mobile.navbar = undefined;

        const resolved = resolveMobileConfig(data);

        expect(resolved.navbar.logo.img).toBe(data.navbar.logo.img);
    });

    it('uses mobile.navbar.logo when explicitly provided', () => {
        const data = JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;
        data.mobile.navbar = {
            logo: { img: 'https://example.com/mobile-logo.svg' },
            breadcrumbs: []
        };

        const resolved = resolveMobileConfig(data);

        expect(resolved.navbar.logo.img).toBe('https://example.com/mobile-logo.svg');
    });
});
