import type { BrowserTab } from './phase2';

export function appendNewBrowserTab(
    tabs: BrowserTab[],
    defaultTabTitle: string,
    createTabId: () => string
): BrowserTab[] {
    const id = createTabId();
    return tabs
        .map((item) => ({ ...item, active: false }))
        .concat([{ id, title: defaultTabTitle, url: '', active: true }]);
}

export function closeBrowserTab(
    tabs: BrowserTab[],
    id: string,
    defaultTabTitle: string,
    createTabId: () => string
): BrowserTab[] {
    if (tabs.length <= 1) {
        return appendNewBrowserTab([], defaultTabTitle, createTabId);
    }

    const closingActive = tabs.find((item) => item.id === id)?.active;
    const filtered = tabs.filter((item) => item.id !== id);

    if (!closingActive || filtered.length === 0) {
        return filtered;
    }

    const [firstTab, ...restTabs] = filtered;
    return [{ ...firstTab, active: true }, ...restTabs];
}
