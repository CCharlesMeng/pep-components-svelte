import { describe, expect, it } from 'vitest';
import type { BrowserTab } from '../../src/utils/phase2';
import {
    appendNewBrowserTab,
    closeBrowserTab
} from '../../src/utils/pseudo-browser-tabs';

describe('pseudo browser tabs utils', () => {
    it('appends a new active tab using the shared creation flow', () => {
        const currentTabs: BrowserTab[] = [
            { id: '1', title: 'A', url: 'https://a.com', active: true }
        ];

        const nextTabs = appendNewBrowserTab(currentTabs, '新标签页', () => 'new-tab');

        expect(nextTabs).toEqual([
            { id: '1', title: 'A', url: 'https://a.com', active: false },
            { id: 'new-tab', title: '新标签页', url: '', active: true }
        ]);
    });

    it('creates a fresh new tab when the last tab is closed', () => {
        const currentTabs: BrowserTab[] = [
            { id: 'last-tab', title: '部署中', url: 'https://console.example.com', active: true }
        ];

        const nextTabs = closeBrowserTab(
            currentTabs,
            'last-tab',
            '新标签页',
            () => 'replacement-tab'
        );

        expect(nextTabs).toEqual([
            { id: 'replacement-tab', title: '新标签页', url: '', active: true }
        ]);
    });

    it('activates the first remaining tab after closing the current active tab', () => {
        const currentTabs: BrowserTab[] = [
            { id: '1', title: 'A', url: 'https://a.com', active: false },
            { id: '2', title: 'B', url: 'https://b.com', active: true },
            { id: '3', title: 'C', url: 'https://c.com', active: false }
        ];

        const nextTabs = closeBrowserTab(currentTabs, '2', '新标签页', () => 'replacement-tab');

        expect(nextTabs).toEqual([
            { id: '1', title: 'A', url: 'https://a.com', active: true },
            { id: '3', title: 'C', url: 'https://c.com', active: false }
        ]);
    });
});
