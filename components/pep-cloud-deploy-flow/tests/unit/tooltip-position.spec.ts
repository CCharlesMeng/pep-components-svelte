import { describe, expect, it } from 'vitest';
import { computeTooltipPosition } from '../../src/utils/tooltip-position';

function createRect(
    left: number,
    top: number,
    width: number,
    height: number
): DOMRect {
    return {
        x: left,
        y: top,
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        toJSON: () => ({})
    } as DOMRect;
}

describe('tooltip position engine', () => {
    it('shifts tooltip in viewport and keeps arrow aligned to anchor', () => {
        const result = computeTooltipPosition({
            anchorRect: createRect(310, 120, 8, 8),
            popupRect: createRect(0, 0, 120, 40),
            viewportWidth: 360,
            viewportHeight: 300,
            placement: 'top'
        });

        expect(result.left).toBe(236);
        expect(result.placement).toBe('top');
        expect(result.arrowOffsetX).toBeCloseTo(78, 6);
    });

    it('flips from top to bottom when there is not enough space above', () => {
        const result = computeTooltipPosition({
            anchorRect: createRect(140, 6, 16, 16),
            popupRect: createRect(0, 0, 100, 40),
            viewportWidth: 320,
            viewportHeight: 200,
            placement: 'top'
        });

        expect(result.placement).toBe('bottom');
        expect(result.top).toBe(30);
    });

    it('flips from bottom to top when there is not enough space below', () => {
        const result = computeTooltipPosition({
            anchorRect: createRect(120, 184, 20, 12),
            popupRect: createRect(0, 0, 110, 40),
            viewportWidth: 320,
            viewportHeight: 200,
            placement: 'bottom'
        });

        expect(result.placement).toBe('top');
        expect(result.top).toBe(136);
    });

    it('keeps historical overflow behavior when shift is disabled', () => {
        const result = computeTooltipPosition({
            anchorRect: createRect(2, 80, 8, 8),
            popupRect: createRect(0, 0, 120, 40),
            viewportWidth: 360,
            viewportHeight: 260,
            placement: 'top',
            options: {
                shift: false
            }
        });

        expect(result.left).toBe(-54);
    });

    it('clamps arrow offset to avoid exceeding popup border radius area', () => {
        const result = computeTooltipPosition({
            anchorRect: createRect(359, 80, 2, 8),
            popupRect: createRect(0, 0, 100, 36),
            viewportWidth: 360,
            viewportHeight: 240,
            placement: 'top',
            options: {
                arrowPadding: 10
            }
        });

        expect(result.left).toBe(256);
        expect(result.arrowOffsetX).toBe(90);
    });
});
