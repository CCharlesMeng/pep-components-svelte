import { describe, expect, it } from 'vitest';
import {
    getApplicationDisplayTitle,
    resolveSidebarTabSteps,
    shouldShowApplicationDropdown
} from '../../src/utils/sidebar-tab-mode';
import type { SidebarTab } from '../../src/types';

describe('sidebar tab mode helpers', () => {
    it('treats single untitled application as steps-only mode', () => {
        const tab: SidebarTab = {
            title: '操作手册',
            applications: [
                {
                    steps: [
                        { title: '步骤1', remoteContent: { source: { markdownContent: '# 1' } } },
                        { title: '步骤2', remoteContent: { source: { markdownContent: '# 2' } } }
                    ]
                }
            ]
        };

        expect(shouldShowApplicationDropdown(tab)).toBe(false);
        expect(resolveSidebarTabSteps(tab, 0).map((step) => step.title)).toEqual([
            '步骤1',
            '步骤2'
        ]);
    });

    it('shows dropdown when multiple applications exist even if titles are empty', () => {
        const tab: SidebarTab = {
            title: '多应用',
            applications: [
                { steps: [{ title: 'A1', remoteContent: { source: { markdownContent: '# A1' } } }] },
                { steps: [{ title: 'B1', remoteContent: { source: { markdownContent: '# B1' } } }] }
            ]
        };

        expect(shouldShowApplicationDropdown(tab)).toBe(true);
        expect(resolveSidebarTabSteps(tab, 1).map((step) => step.title)).toEqual(['B1']);
    });

    it('provides fallback display title for untitled applications', () => {
        expect(getApplicationDisplayTitle({ steps: [] }, 0)).toBe('应用1');
        expect(getApplicationDisplayTitle({ title: '控制台', steps: [] }, 1)).toBe('控制台');
    });
});
