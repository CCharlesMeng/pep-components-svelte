import { describe, expect, it } from 'vitest';
import {
    computeMaxSidebarWidthByRightDock,
    computeSidebarWidthByRightDock,
    getRightDockFloatingX,
    shouldShowRightSnapShadow,
    shouldSnapToRightDock
} from '../../src/utils/sidebar-layout';

describe('sidebar right-dock layout utils', () => {
    it('computes sidebar width from workspace right edge', () => {
        expect(
            computeSidebarWidthByRightDock({
                clientX: 1200,
                workspaceRight: 1600,
                minWidth: 320,
                maxWidth: 640
            })
        ).toBe(400);
    });

    it('clamps computed width within min and max', () => {
        expect(
            computeSidebarWidthByRightDock({
                clientX: 1580,
                workspaceRight: 1600,
                minWidth: 320,
                maxWidth: 640
            })
        ).toBe(320);

        expect(
            computeSidebarWidthByRightDock({
                clientX: 200,
                workspaceRight: 1600,
                minWidth: 320,
                maxWidth: 640
            })
        ).toBe(640);
    });

    it('computes dynamic max width for right-dock sidebar', () => {
        expect(
            computeMaxSidebarWidthByRightDock({
                workspaceWidth: 1280,
                minMainWidth: 240,
                fallbackMinWidth: 320
            })
        ).toBe(1040);

        expect(
            computeMaxSidebarWidthByRightDock({
                workspaceWidth: 400,
                minMainWidth: 240,
                fallbackMinWidth: 320
            })
        ).toBe(320);
    });

    it('positions floating panel near right edge by default', () => {
        expect(getRightDockFloatingX(1600, 400)).toBe(1184);
        expect(getRightDockFloatingX(300, 400)).toBe(0);
    });

    it('detects right-edge snap shadow and docking threshold', () => {
        expect(shouldShowRightSnapShadow(1200, 380, 1600, 24)).toBe(true);
        expect(shouldShowRightSnapShadow(1000, 380, 1600, 24)).toBe(false);
        expect(shouldSnapToRightDock(1196, 380, 1600, 24)).toBe(true);
        expect(shouldSnapToRightDock(1100, 380, 1600, 24)).toBe(false);
    });
});
