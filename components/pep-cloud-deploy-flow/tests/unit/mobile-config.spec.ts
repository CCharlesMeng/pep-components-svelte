import { describe, expect, it } from 'vitest';
import type { PepCloudDeployFlowProps } from '../../src/types';
import { resolveMobileConfig } from '../../src/utils/mobile-config';
import defaultData from '../../mocks/default.json';

describe('resolveMobileConfig', () => {
    it('merges PC title and sidebar footer into resolved mobile config', () => {
        const data = JSON.parse(JSON.stringify(defaultData)) as PepCloudDeployFlowProps;

        const resolved = resolveMobileConfig(data);

        expect(resolved.title).toBe(data.mainContent.title);
        expect(resolved.footer).toEqual(data.sidebar.footer);
        expect(resolved.steps.length).toBe(data.mobile.steps.length);
        expect(resolved.navbar.logo.img).toBe(data.mobile.navbar.logo.img);
    });
});
