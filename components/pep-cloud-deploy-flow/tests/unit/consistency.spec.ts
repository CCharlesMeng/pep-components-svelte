import { describe, expect, it } from 'vitest';
import schema from '../../schema.json';
import defaultData from '../../mocks/props/default.json';
import type { PepCloudDeployFlowProps } from '../../src/types';

describe('Schema & Data Consistency', () => {
    it('default mock should satisfy authoring types', () => {
        const typedData: PepCloudDeployFlowProps = defaultData as unknown as PepCloudDeployFlowProps;
        expect(typedData.navbar.logo.img).toBeTypeOf('string');
        expect('text' in typedData.navbar.logo).toBe(false);
        expect(typedData.sidebar.tabs.length).toBeGreaterThan(0);
        expect(typedData.theme.texts.miniIconHoverText).toBeTypeOf('string');
        expect(typedData.shortcuts.deployPage.items.length).toBeGreaterThan(0);
    });

    it('schema should define all top-level keys present in default.json', () => {
        const schemaProperties = Object.keys((schema as { properties: Record<string, unknown> }).properties);
        const defaultKeys = Object.keys(defaultData);
        for (const key of defaultKeys) {
            expect(schemaProperties).toContain(key);
        }
    });

    it('schema root required should match default.json top-level keys', () => {
        const required = new Set((schema as { required?: string[] }).required ?? []);
        for (const key of Object.keys(defaultData)) {
            expect(required.has(key)).toBe(true);
        }
    });

    it('mobile schema should not define title or footer (use PC fallbacks in code)', () => {
        const mobileSchema = (
            schema as {
                properties: {
                    mobile: { properties?: Record<string, unknown> };
                };
            }
        ).properties.mobile;
        expect(mobileSchema.properties).toBeDefined();
        expect(Object.keys(mobileSchema.properties ?? {})).not.toContain('title');
        expect(Object.keys(mobileSchema.properties ?? {})).not.toContain('footer');
    });

    it('schema should require deploy launch title', () => {
        const actionSchema = (
            schema as {
                properties: {
                    mainContent: {
                        properties: {
                            action: { required?: string[] };
                        };
                    };
                };
            }
        ).properties.mainContent.properties.action;
        expect(actionSchema.required ?? []).toEqual(
            expect.arrayContaining(['buttonText', 'url', 'launchTitle'])
        );
        expect(defaultData.mainContent.action.launchTitle).toBeTypeOf('string');
    });

    it('schema should require iframePages domain whitelist and new-tab fields (icons moved to theme)', () => {
        const root = schema as {
            properties: {
                iframePages: {
                    required?: string[];
                    properties: {
                        newTabPage: {
                            required?: string[];
                            properties: {
                                title: { required?: string[] };
                            };
                        };
                    };
                };
            };
        };
        expect(root.properties.iframePages.required ?? []).toEqual(
            expect.arrayContaining(['domainWhitelistPatterns', 'newTabPage'])
        );
        expect(root.properties.iframePages.required ?? []).not.toContain('icons');
        expect(root.properties.iframePages.properties.newTabPage.required ?? []).toEqual(
            expect.arrayContaining(['tabTitle', 'title', 'addressPlaceholder'])
        );
        expect(
            root.properties.iframePages.properties.newTabPage.properties.title.required ?? []
        ).toEqual(expect.arrayContaining(['icon', 'text']));
    });

    it('schema should require sidebar tabs and footer (icons and texts moved to theme)', () => {
        const sidebarSchema = (
            schema as {
                properties: {
                    sidebar: {
                        required?: string[];
                        properties: Record<string, unknown>;
                    };
                };
            }
        ).properties.sidebar;

        expect(sidebarSchema.required ?? []).toEqual(
            expect.arrayContaining(['tabs', 'footer'])
        );
        expect(sidebarSchema.required ?? []).not.toContain('icons');
        expect(sidebarSchema.required ?? []).not.toContain('texts');
    });

    it('schema theme should require icons.sidebar, icons.browser and texts', () => {
        const themeSchema = (
            schema as {
                properties: {
                    theme: {
                        required?: string[];
                        properties: {
                            icons: {
                                required?: string[];
                                properties: {
                                    sidebar: { required?: string[] };
                                    browser: { required?: string[] };
                                };
                            };
                            texts: { required?: string[] };
                        };
                    };
                };
            }
        ).properties.theme;

        expect(themeSchema.required ?? []).toEqual(expect.arrayContaining(['icons', 'texts']));
        expect(themeSchema.properties.icons.required ?? []).toEqual(
            expect.arrayContaining(['sidebar', 'browser'])
        );
        expect(themeSchema.properties.icons.properties.sidebar.required ?? []).toEqual(
            expect.arrayContaining(['floatIcon', 'collapseIcon', 'stepCheckedIcon', 'sidebarMinimizeIcon'])
        );
        expect(themeSchema.properties.texts.required ?? []).toEqual(
            expect.arrayContaining([
                'openExternalDefaultTitle',
                'browserFrameLoadingText',
                'remoteLoadingText',
                'remoteLoadFailedText',
                'remoteFallbackMessageTemplate',
                'remoteFallbackLinkText',
                'miniIconHoverText'
            ])
        );
    });

    it('schema shortcuts should require deployPage, finishPage and browserNewTab', () => {
        const shortcutsSchema = (
            schema as {
                properties: {
                    shortcuts: { required?: string[] };
                };
            }
        ).properties.shortcuts;

        expect(shortcutsSchema.required ?? []).toEqual(
            expect.arrayContaining(['deployPage', 'finishPage', 'browserNewTab'])
        );
    });
});
