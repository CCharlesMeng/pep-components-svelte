import type { SidebarApplication, SidebarStep, SidebarTab } from '../types';

function normalizeTitle(value?: string): string {
    return (value ?? '').trim();
}

export function isSingleUntitledApplication(tab: SidebarTab | undefined): boolean {
    const apps = tab?.applications ?? [];
    if (apps.length !== 1) {
        return false;
    }
    return normalizeTitle(apps[0]?.title).length === 0;
}

export function shouldShowApplicationDropdown(tab: SidebarTab | undefined): boolean {
    const apps = tab?.applications ?? [];
    if (apps.length === 0) {
        return false;
    }
    if (isSingleUntitledApplication(tab)) {
        return false;
    }
    if (apps.length > 1) {
        return true;
    }
    return normalizeTitle(apps[0]?.title).length > 0;
}

export function resolveSidebarTabSteps(
    tab: SidebarTab | undefined,
    activeApplicationIndex: number
): SidebarStep[] {
    const apps = tab?.applications ?? [];
    if (apps.length === 0) {
        return tab?.steps ?? [];
    }
    if (isSingleUntitledApplication(tab)) {
        return apps[0]?.steps ?? [];
    }
    return apps[activeApplicationIndex]?.steps ?? [];
}

export function getApplicationDisplayTitle(
    application: SidebarApplication | undefined,
    index: number
): string {
    const title = normalizeTitle(application?.title);
    if (title) {
        return title;
    }
    return `应用${index + 1}`;
}
