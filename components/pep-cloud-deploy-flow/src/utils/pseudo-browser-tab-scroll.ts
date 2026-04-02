export type TabScrollDirection = -1 | 1;

export interface TabScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

interface TabScrollControllerOptions {
  getContainer: () => HTMLElement | null;
  getStep: () => number;
  onStateChange?: (state: TabScrollState) => void;
}

const INITIAL_HOLD_DELAY_MS = 260;
const HOLD_START_DELAY_MS = 180;
const MIN_HOLD_DELAY_MS = 60;
const HOLD_ACCELERATION_RATIO = 0.82;

export function createTabScrollController(options: TabScrollControllerOptions) {
  let holdTimer: number | null = null;
  let state: TabScrollState = {
    canScrollLeft: false,
    canScrollRight: false,
  };

  function emit(nextState: TabScrollState): void {
    state = nextState;
    options.onStateChange?.(nextState);
  }

  function resolveState(container: HTMLElement | null): TabScrollState {
    if (!container) {
      return { canScrollLeft: false, canScrollRight: false };
    }
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    return {
      canScrollLeft: container.scrollLeft > 0,
      canScrollRight: container.scrollLeft < maxScrollLeft - 1,
    };
  }

  function updateScrollState(): TabScrollState {
    const nextState = resolveState(options.getContainer());
    emit(nextState);
    return nextState;
  }

  function scrollByOneTab(
    direction: TabScrollDirection,
    behavior: ScrollBehavior = "smooth",
  ): boolean {
    const container = options.getContainer();
    if (!container) {
      return false;
    }
    const step = Math.max(1, Math.round(options.getStep()));
    const before = container.scrollLeft;
    container.scrollBy({ left: direction * step, behavior });
    if (behavior === "smooth") {
      window.setTimeout(updateScrollState, 120);
      return true;
    }
    updateScrollState();
    return Math.abs(container.scrollLeft - before) >= 1;
  }

  function stopContinuousScroll(): void {
    if (holdTimer !== null) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function startContinuousScroll(direction: TabScrollDirection): void {
    if (typeof window === "undefined") {
      return;
    }
    stopContinuousScroll();
    let delay = INITIAL_HOLD_DELAY_MS;

    const tick = (): void => {
      const moved = scrollByOneTab(direction, "auto");
      const latestState = updateScrollState();
      if (!moved || (direction < 0 ? !latestState.canScrollLeft : !latestState.canScrollRight)) {
        stopContinuousScroll();
        return;
      }
      delay = Math.max(MIN_HOLD_DELAY_MS, Math.floor(delay * HOLD_ACCELERATION_RATIO));
      holdTimer = window.setTimeout(tick, delay);
    };

    holdTimer = window.setTimeout(tick, HOLD_START_DELAY_MS);
  }

  function destroy(): void {
    stopContinuousScroll();
  }

  return {
    getState: () => state,
    updateScrollState,
    scrollByOneTab,
    startContinuousScroll,
    stopContinuousScroll,
    destroy,
  };
}
