export const TAB_MIN_WIDTH = 70;
export const TAB_MAX_WIDTH = 166;
export const TAB_GAP = 2;
export const MAX_BROWSER_TABS = 30;

export interface TabOverflowLayoutInput {
  tabCount: number;
  availableWidth: number;
  minTabWidth?: number;
  maxTabWidth?: number;
  tabGap?: number;
}

export interface TabOverflowLayoutResult {
  tabWidth: number;
  totalTabsWidth: number;
  useScrollControls: boolean;
  isCompressed: boolean;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getTabTrackWidth(
  tabCount: number,
  tabWidth: number,
  tabGap: number = TAB_GAP,
): number {
  if (tabCount <= 0) {
    return 0;
  }
  return tabCount * tabWidth + (tabCount - 1) * tabGap;
}

export function computeTabOverflowLayout(
  input: TabOverflowLayoutInput,
): TabOverflowLayoutResult {
  const tabCount = Math.max(0, input.tabCount);
  const minTabWidth = input.minTabWidth ?? TAB_MIN_WIDTH;
  const maxTabWidth = input.maxTabWidth ?? TAB_MAX_WIDTH;
  const tabGap = input.tabGap ?? TAB_GAP;
  const availableWidth = Math.max(0, input.availableWidth);

  if (tabCount <= 0) {
    return {
      tabWidth: maxTabWidth,
      totalTabsWidth: 0,
      useScrollControls: false,
      isCompressed: false,
    };
  }

  const gapsWidth = (tabCount - 1) * tabGap;
  const idealWidth = Math.floor((availableWidth - gapsWidth) / tabCount);
  const clampedWidth = clamp(idealWidth, minTabWidth, maxTabWidth);
  const totalTabsWidth = getTabTrackWidth(tabCount, clampedWidth, tabGap);
  const isCompressed = clampedWidth < maxTabWidth;
  const useScrollControls = idealWidth < minTabWidth;

  return {
    tabWidth: clampedWidth,
    totalTabsWidth,
    useScrollControls,
    isCompressed,
  };
}
