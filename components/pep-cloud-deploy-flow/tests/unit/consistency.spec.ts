import { describe, expect, it } from 'vitest';
import schema from '../../schema.json';
import defaultData from '../../mocks/props/default.json';
import type { PepCloudDeployFlowProps } from '../../src/types';

describe('Schema & Data Consistency', () => {
    it('default mock should satisfy authoring types', () => {
        const typedData: PepCloudDeployFlowProps = defaultData as PepCloudDeployFlowProps;
        expect(typedData.navbar.logo.img).toBeTypeOf('string');
        expect('text' in typedData.navbar.logo).toBe(false);
        expect(typedData.sidebar.tabs.length).toBeGreaterThan(0);
        expect(typedData.sidebar.texts.miniIconHoverText).toBeTypeOf('string');
        expect(typedData.mainContent.cloudProducts.products.length).toBeGreaterThan(0);
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

    it('schema should require iframePages domain whitelist, icons and new-tab fields', () => {
        const root = schema as {
            properties: {
                iframePages: {
                    required?: string[];
                    properties: {
                        newTabPage: {
                            required?: string[];
                            properties: {
                                title: { required?: string[] };
                                shortcuts: { required?: string[] };
                            };
                        };
                    };
                };
            };
        };
        expect(root.properties.iframePages.required ?? []).toEqual(
            expect.arrayContaining(['domainWhitelistPatterns', 'icons', 'newTabPage'])
        );
        expect(root.properties.iframePages.properties.newTabPage.required ?? []).toEqual(
            expect.arrayContaining(['tabTitle', 'title', 'addressPlaceholder', 'shortcuts'])
        );
        expect(
            root.properties.iframePages.properties.newTabPage.properties.title.required ?? []
        ).toEqual(expect.arrayContaining(['icon', 'text']));
        expect(
            root.properties.iframePages.properties.newTabPage.properties.shortcuts.required ?? []
        ).toEqual(expect.arrayContaining(['title', 'items']));
    });

    it('schema should require sidebar icons, tabs, footer, texts including miniIconHoverText', () => {
        const sidebarSchema = (
            schema as {
                properties: {
                    sidebar: {
                        required?: string[];
                        properties: {
                            texts: { required?: string[] };
                        };
                    };
                };
            }
        ).properties.sidebar;

        expect(sidebarSchema.required ?? []).toEqual(
            expect.arrayContaining(['icons', 'tabs', 'footer', 'texts'])
        );
        expect(sidebarSchema.properties.texts.required ?? []).toEqual(
            expect.arrayContaining([
                'openExternalDefaultTitle',
                'remoteLoadingText',
                'remoteLoadFailedText',
                'remoteFallbackMessageTemplate',
                'remoteFallbackLinkText',
                'miniIconHoverText'
            ])
        );
    });
});
