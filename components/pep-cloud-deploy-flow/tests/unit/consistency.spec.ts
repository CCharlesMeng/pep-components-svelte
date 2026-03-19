import { describe, expect, it } from 'vitest';
import schema from '../../schema.json';
import defaultData from '../../mocks/default.json';
import type { PepCloudDeployFlowProps } from '../../src/types';

describe('Schema & Data Consistency', () => {
    it('default mock should satisfy top-level contract', () => {
        const typedData: PepCloudDeployFlowProps = defaultData as PepCloudDeployFlowProps;
        expect(typedData.navbar.logo.text).toBeTypeOf('string');
        expect(typedData.sidebar.tabs.length).toBeGreaterThan(0);
        expect(typedData.mainContent.cloudProducts.products.length).toBeGreaterThan(0);
    });

    it('schema should define all top-level properties from types', () => {
        const schemaProperties = Object.keys((schema as { properties: Record<string, unknown> }).properties);
        const requiredTopLevel: Array<keyof PepCloudDeployFlowProps> = ['navbar', 'sidebar', 'mainContent'];
        requiredTopLevel.forEach((key) => {
            expect(schemaProperties).toContain(key);
        });
    });

    it('schema required fields should include top-level contract keys', () => {
        const required = (schema as { required?: string[] }).required ?? [];
        expect(required).toEqual(expect.arrayContaining(['navbar', 'sidebar', 'mainContent']));
    });

    it('schema should require deploy launch title instead of code fallback', () => {
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

    it('schema should require iframePages new-tab copy fields', () => {
        const root = schema as {
            required?: string[];
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
        expect(root.required ?? []).toEqual(expect.arrayContaining(['iframePages']));
        expect(root.properties.iframePages.required ?? []).toEqual(expect.arrayContaining(['newTabPage']));
        expect(root.properties.iframePages.properties.newTabPage.required ?? []).toEqual(
            expect.arrayContaining(['tabTitle', 'title', 'addressPlaceholder', 'shortcuts'])
        );
        expect(
            root.properties.iframePages.properties.newTabPage.properties.title.required ?? []
        ).toEqual(expect.arrayContaining(['text']));
        expect(
            root.properties.iframePages.properties.newTabPage.properties.shortcuts.required ?? []
        ).toEqual(expect.arrayContaining(['title', 'items']));
    });

    it('schema should require sidebar text copy fields', () => {
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

        expect(sidebarSchema.required ?? []).toEqual(expect.arrayContaining(['tabs', 'footer', 'texts']));
        expect(sidebarSchema.properties.texts.required ?? []).toEqual(
            expect.arrayContaining([
                'openExternalDefaultTitle',
                'remoteLoadingText',
                'remoteLoadFailedText',
                'remoteFallbackMessageTemplate',
                'remoteFallbackLinkText'
            ])
        );
        expect(defaultData.sidebar.texts.openExternalDefaultTitle).toBeTypeOf('string');
    });
});
