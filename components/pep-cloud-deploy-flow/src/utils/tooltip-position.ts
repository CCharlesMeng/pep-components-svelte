export type TooltipPlacement = 'top' | 'bottom';

export interface TooltipPositioningOptions {
    offset?: number;
    viewportPadding?: number;
    flip?: boolean;
    shift?: boolean;
    arrowAlign?: 'anchor' | 'center';
    arrowPadding?: number;
}

export interface ComputeTooltipPositionInput {
    anchorRect: DOMRect;
    popupRect: DOMRect;
    viewportWidth: number;
    viewportHeight: number;
    placement: TooltipPlacement;
    options?: TooltipPositioningOptions;
}

export interface ComputeTooltipPositionResult {
    top: number;
    left: number;
    placement: TooltipPlacement;
    arrowOffsetX: number;
}

const DEFAULT_OFFSET = 8;
const DEFAULT_VIEWPORT_PADDING = 4;
const DEFAULT_FLIP = true;
const DEFAULT_SHIFT = true;
const DEFAULT_ARROW_ALIGN: NonNullable<TooltipPositioningOptions['arrowAlign']> =
    'anchor';
const DEFAULT_ARROW_PADDING = 8;

function clamp(value: number, min: number, max: number): number {
    if (max < min) {
        return min;
    }
    return Math.min(max, Math.max(min, value));
}

export function computeTooltipPosition(
    input: ComputeTooltipPositionInput
): ComputeTooltipPositionResult {
    const {
        anchorRect,
        popupRect,
        viewportWidth,
        viewportHeight,
        placement: preferredPlacement,
        options = {}
    } = input;

    const offset = options.offset ?? DEFAULT_OFFSET;
    const viewportPadding = options.viewportPadding ?? DEFAULT_VIEWPORT_PADDING;
    const flip = options.flip ?? DEFAULT_FLIP;
    const shift = options.shift ?? DEFAULT_SHIFT;
    const arrowAlign = options.arrowAlign ?? DEFAULT_ARROW_ALIGN;
    const arrowPadding = options.arrowPadding ?? DEFAULT_ARROW_PADDING;

    const anchorCenterX = anchorRect.left + anchorRect.width / 2;
    const idealLeft = anchorCenterX - popupRect.width / 2;

    let left = idealLeft;
    if (shift) {
        const minLeft = viewportPadding;
        const maxLeft = viewportWidth - popupRect.width - viewportPadding;
        left = clamp(left, minLeft, maxLeft);
    }

    const topCandidate = anchorRect.top - popupRect.height - offset;
    const bottomCandidate = anchorRect.bottom + offset;

    const spaceAbove = anchorRect.top - viewportPadding;
    const spaceBelow = viewportHeight - anchorRect.bottom - viewportPadding;
    const neededHeight = popupRect.height + offset;

    let finalPlacement: TooltipPlacement = preferredPlacement;
    if (flip) {
        const topInsufficient = preferredPlacement === 'top' && spaceAbove < neededHeight;
        const bottomInsufficient =
            preferredPlacement === 'bottom' && spaceBelow < neededHeight;

        if (topInsufficient && spaceBelow > spaceAbove) {
            finalPlacement = 'bottom';
        } else if (bottomInsufficient && spaceAbove > spaceBelow) {
            finalPlacement = 'top';
        }
    }

    let top = finalPlacement === 'bottom' ? bottomCandidate : topCandidate;
    if (shift) {
        const minTop = viewportPadding;
        const maxTop = viewportHeight - popupRect.height - viewportPadding;
        top = clamp(top, minTop, maxTop);
    }

    const centeredArrowX = popupRect.width / 2;
    const anchoredArrowX = anchorCenterX - left;
    const minArrowX = arrowPadding;
    const maxArrowX = popupRect.width - arrowPadding;
    const rawArrowX = arrowAlign === 'center' ? centeredArrowX : anchoredArrowX;
    const arrowOffsetX = clamp(rawArrowX, minArrowX, maxArrowX);

    return {
        top,
        left,
        placement: finalPlacement,
        arrowOffsetX
    };
}
