/**
 * 右侧停靠 sidebar 的布局计算（与 viewport / workspace 右缘对齐）。
 * 供 `index.svelte` 拖拽宽度、悬浮默认位置与右吸附使用。
 */

/** 悬浮面板与视口右缘的默认间距（px） */
export const RIGHT_DOCK_FLOAT_MARGIN_PX = 16;

export interface ComputeSidebarWidthByRightDockParams {
    clientX: number;
    workspaceRight: number;
    minWidth: number;
    maxWidth: number;
}

export interface ComputeMaxSidebarWidthByRightDockParams {
    workspaceWidth: number;
    minMainWidth: number;
    fallbackMinWidth: number;
}

/**
 * 根据鼠标 X 与 workspace 右边界计算侧栏宽度（侧栏贴在右侧时，宽度 = 右边界 - 鼠标 X）。
 */
export function computeSidebarWidthByRightDock(
    params: ComputeSidebarWidthByRightDockParams
): number {
    const { clientX, workspaceRight, minWidth, maxWidth } = params;
    const raw = workspaceRight - clientX;
    return Math.min(maxWidth, Math.max(minWidth, raw));
}

/**
 * 计算侧栏的动态最大宽度：总可用宽度减去主区最小宽度。
 * 当空间不足时，至少回退到 fallbackMinWidth（避免出现无效上限）。
 */
export function computeMaxSidebarWidthByRightDock(
    params: ComputeMaxSidebarWidthByRightDockParams
): number {
    const { workspaceWidth, minMainWidth, fallbackMinWidth } = params;
    const dynamicMax = workspaceWidth - minMainWidth;
    return Math.max(fallbackMinWidth, dynamicMax);
}

/**
 * 悬浮面板默认 left：靠右，留 `RIGHT_DOCK_FLOAT_MARGIN_PX`；视口过窄时 clamp 为 0。
 */
export function getRightDockFloatingX(
    viewportWidth: number,
    floatWidth: number
): number {
    const x = viewportWidth - floatWidth - RIGHT_DOCK_FLOAT_MARGIN_PX;
    return Math.max(0, x);
}

/**
 * 悬浮面板右缘距视口右缘 ≤ threshold 时显示右吸附阴影提示。
 */
export function shouldShowRightSnapShadow(
    floatX: number,
    floatWidth: number,
    viewportWidth: number,
    thresholdPx: number
): boolean {
    const rightEdge = floatX + floatWidth;
    const gap = viewportWidth - rightEdge;
    return gap <= thresholdPx;
}

/**
 * 松手时：若右缘已进入吸附带，则应贴回侧边 normal 态。
 */
export function shouldSnapToRightDock(
    floatX: number,
    floatWidth: number,
    viewportWidth: number,
    thresholdPx: number
): boolean {
    return shouldShowRightSnapShadow(
        floatX,
        floatWidth,
        viewportWidth,
        thresholdPx
    );
}
