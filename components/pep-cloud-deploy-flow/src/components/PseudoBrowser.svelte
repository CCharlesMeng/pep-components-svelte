<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { injectExternalTab } from "../utils/phase2";
  import type { BrowserExternalUrl, BrowserTab } from "../utils/phase2";
  import {
    MAX_BROWSER_TABS,
    TAB_GAP,
    computeTabOverflowLayout,
  } from "../utils/pseudo-browser-tab-overflow";
  import {
    createTabScrollController,
    type TabScrollDirection,
  } from "../utils/pseudo-browser-tab-scroll";
  import type { IframePagesConfig } from "../types";
  import AlertToast from "./AlertToast.svelte";
  import QuickLinkCard from "./QuickLinkCard.svelte";
  import Tooltip from "./Tooltip.svelte";

  interface Props {
    externalUrl?: BrowserExternalUrl | null;
    iframePages: IframePagesConfig;
    backgroundImage?: string;
    isBrowserFullscreen?: boolean;
    onClose?: () => void;
    onFullscreen?: () => void;
    onSwitchToSideMode?: () => void;
  }

  let {
    externalUrl = null,
    iframePages,
    backgroundImage,
    isBrowserFullscreen = false,
    onClose,
    onFullscreen,
    onSwitchToSideMode,
  }: Props = $props();
  let tabs = $state<BrowserTab[]>([]);
  let handledTimestamp = $state<number | null>(null);
  let addressInput = $state("");
  let frameLoading = $state(false);
  let tabFrameVersions = $state<Record<string, number>>({});
  let loadedFrameKeys = $state<Record<string, true>>({});
  let pinnedTabTitles = $state<Record<string, string>>({});
  let tabAreaEl = $state<HTMLDivElement | null>(null);
  let tabsViewportEl = $state<HTMLDivElement | null>(null);
  let addTabButtonEl = $state<HTMLButtonElement | null>(null);
  let computedTabWidth = $state(166);
  let useTabScrollControls = $state(false);
  let addTabPinned = $state(false);
  let canScrollLeft = $state(false);
  let canScrollRight = $state(false);
  let layoutRafId = 0;
  let activeTabScrollRafId = 0;
  let resizeObserver: ResizeObserver | null = null;
  let tabScrollController: ReturnType<typeof createTabScrollController> | null =
    null;
  let tabIdSeed = 0;
  let tabLimitWarningVisible = $state(false);
  let tabLimitWarningTimer: ReturnType<typeof setTimeout> | null = null;

  const LEFT_ARROW_ICON =
    "https://res-static.hc-cdn.cn/cloudbu-site/intl/zh-cn/pep-component-svelte/pep-cloud-deploy-flow/browserIcon/leftArrowIcon.svg";
  const LEFT_ARROW_ICON_DISABLED =
    "https://res-static.hc-cdn.cn/cloudbu-site/intl/zh-cn/pep-component-svelte/pep-cloud-deploy-flow/browserIcon/leftArrowIconDisabled.svg";
  const RIGHT_ARROW_ICON =
    "https://res-static.hc-cdn.cn/cloudbu-site/intl/zh-cn/pep-component-svelte/pep-cloud-deploy-flow/browserIcon/rightArrowIcon.svg";
  const RIGHT_ARROW_ICON_DISABLED =
    "https://res-static.hc-cdn.cn/cloudbu-site/intl/zh-cn/pep-component-svelte/pep-cloud-deploy-flow/browserIcon/rightArrowIconDisabled.svg";
  const TAB_LIMIT_CONFIRM_TEXT =
    "页签已增加至最大数量，如需继续增加可关闭无用标签";
  const TAB_LIMIT_WARNING_TITLE = "告警信息";
  const TAB_LIMIT_WARNING_DURATION = 3000;
  const TAB_SCROLL_ARROWS_TOTAL_WIDTH = 46;
  const ADD_BTN_PINNED_RESERVED = 48;

  function createTabId(): string {
    tabIdSeed += 1;
    return `${Date.now()}-${tabIdSeed}`;
  }

  function getHorizontalOuterWidth(element: HTMLElement | null): number {
    if (!element || typeof window === "undefined") {
      return 0;
    }
    const styles = window.getComputedStyle(element);
    const marginLeft = Number.parseFloat(styles.marginLeft || "0") || 0;
    const marginRight = Number.parseFloat(styles.marginRight || "0") || 0;
    return element.offsetWidth + marginLeft + marginRight;
  }

  function scheduleTabLayoutRecompute(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (layoutRafId) {
      window.cancelAnimationFrame(layoutRafId);
    }
    layoutRafId = window.requestAnimationFrame(() => {
      layoutRafId = 0;
      recomputeTabLayout();
    });
  }

  function recomputeTabLayout(): void {
    if (!tabAreaEl) {
      computedTabWidth = 166;
      useTabScrollControls = false;
      addTabPinned = false;
      return;
    }
    const containerWidth = tabAreaEl.clientWidth;
    const addBtnWidth = getHorizontalOuterWidth(addTabButtonEl);

    const inlineAvailable = Math.max(0, containerWidth - addBtnWidth);
    const inlineLayout = computeTabOverflowLayout({
      tabCount: tabs.length,
      availableWidth: inlineAvailable,
      tabGap: TAB_GAP,
    });

    if (!inlineLayout.isCompressed) {
      computedTabWidth = 166;
      useTabScrollControls = false;
      addTabPinned = false;
      if (tabsViewportEl) {
        tabsViewportEl.scrollLeft = 0;
      }
      tabScrollController?.updateScrollState();
      return;
    }

    const pinnedAvailable = Math.max(
      0,
      containerWidth - ADD_BTN_PINNED_RESERVED,
    );
    const pinnedLayout = computeTabOverflowLayout({
      tabCount: tabs.length,
      availableWidth: pinnedAvailable,
      tabGap: TAB_GAP,
    });

    if (!pinnedLayout.useScrollControls) {
      computedTabWidth = pinnedLayout.tabWidth;
      useTabScrollControls = false;
      addTabPinned = true;
      if (tabsViewportEl) {
        tabsViewportEl.scrollLeft = 0;
      }
      tabScrollController?.updateScrollState();
      return;
    }

    const scrollAvailable = Math.max(
      0,
      pinnedAvailable - TAB_SCROLL_ARROWS_TOTAL_WIDTH,
    );
    const scrollLayout = computeTabOverflowLayout({
      tabCount: tabs.length,
      availableWidth: scrollAvailable,
      tabGap: TAB_GAP,
    });
    computedTabWidth = scrollLayout.tabWidth;
    useTabScrollControls = true;
    addTabPinned = true;
    tabScrollController?.updateScrollState();
  }

  function clearTabLimitWarningTimer(): void {
    if (tabLimitWarningTimer) {
      clearTimeout(tabLimitWarningTimer);
      tabLimitWarningTimer = null;
    }
  }

  function dismissTabLimitWarning(): void {
    clearTabLimitWarningTimer();
    tabLimitWarningVisible = false;
  }

  function scheduleScrollAfterLayout(): void {
    if (typeof window === "undefined") {
      return;
    }
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (useTabScrollControls) {
          scrollActiveTabIntoView("auto");
        }
      });
    });
  }

  function scrollActiveTabIntoView(behavior: ScrollBehavior = "smooth"): void {
    if (!tabsViewportEl || typeof window === "undefined") {
      return;
    }
    if (activeTabScrollRafId) {
      window.cancelAnimationFrame(activeTabScrollRafId);
    }
    activeTabScrollRafId = window.requestAnimationFrame(() => {
      activeTabScrollRafId = 0;
      const activeElement = tabsViewportEl?.querySelector(
        ".pep-cloud-deploy-flow-browser__tab-item.active",
      ) as HTMLElement | null;
      activeElement?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior,
      });
      tabScrollController?.updateScrollState();
    });
  }

  function notifyTabLimitReached(): void {
    if (typeof window === "undefined" || tabLimitWarningVisible) {
      return;
    }
    tabLimitWarningVisible = true;
    clearTabLimitWarningTimer();
    tabLimitWarningTimer = setTimeout(() => {
      dismissTabLimitWarning();
    }, TAB_LIMIT_WARNING_DURATION);
  }

  function canAppendTab(): boolean {
    if (tabs.length < MAX_BROWSER_TABS) {
      return true;
    }
    notifyTabLimitReached();
    return false;
  }

  $effect(() => {
    if (externalUrl && externalUrl.timestamp !== handledTimestamp) {
      const normalized = normalizeUrl(externalUrl.url);
      if (normalized && isUrlAllowed(normalized)) {
        if (!canAppendTab()) {
          handledTimestamp = externalUrl.timestamp;
          return;
        }
        tabs = injectExternalTab(
          tabs,
          { ...externalUrl, url: normalized },
          defaultTabTitle,
        );
      } else if (normalized) {
        openInRealBrowser(normalized);
      }
      handledTimestamp = externalUrl.timestamp;
    }
  });

  let defaultTabTitle = $derived(iframePages.newTabPage.tabTitle);
  let pageTitleText = $derived(iframePages.newTabPage.title.text);
  let pageTitleIcon = $derived(iframePages.newTabPage.title.icon);
  let shortcutTitle = $derived(iframePages.newTabPage.shortcuts.title);
  let shortcutItems = $derived(iframePages.newTabPage.shortcuts.items);
  let addressPlaceholder = $derived(iframePages.newTabPage.addressPlaceholder);
  let activeTab = $derived(
    tabs.find((item) => item.active) ??
      tabs[0] ?? {
        id: "fallback",
        title: defaultTabTitle,
        url: "",
        active: true,
      },
  );

  let activeFrameKey = $derived(
    activeTab.url
      ? `${activeTab.id}:${activeTab.url}:${tabFrameVersions[activeTab.id] ?? 0}`
      : "",
  );

  $effect(() => {
    if (!activeFrameKey) {
      frameLoading = false;
      return;
    }
    frameLoading = !Boolean(loadedFrameKeys[activeFrameKey]);
  });

  function getTabFrameVersion(tabId: string): number {
    return tabFrameVersions[tabId] ?? 0;
  }

  function getTabFrameKey(tab: BrowserTab): string {
    if (!tab.url) {
      return "";
    }
    return `${tab.id}:${tab.url}:${getTabFrameVersion(tab.id)}`;
  }

  function clearTabFrameCache(tabId: string): void {
    const keyPrefix = `${tabId}:`;
    const nextLoaded: Record<string, true> = {};
    for (const key of Object.keys(loadedFrameKeys)) {
      if (!key.startsWith(keyPrefix)) {
        nextLoaded[key] = true;
      }
    }
    loadedFrameKeys = nextLoaded;
    const { [tabId]: _ignored, ...restVersions } = tabFrameVersions;
    tabFrameVersions = restVersions;
    clearPinnedTabTitle(tabId);
  }

  function selectTab(id: string): void {
    tabs = tabs.map((item) => ({ ...item, active: item.id === id }));
    if (useTabScrollControls) {
      scrollActiveTabIntoView();
    }
  }

  function addTab(): void {
    if (!canAppendTab()) {
      return;
    }
    const id = createTabId();
    tabs = tabs
      .map((item) => ({ ...item, active: false }))
      .concat([{ id, title: defaultTabTitle, url: "", active: true }]);
    scheduleScrollAfterLayout();
  }

  function closeTab(id: string): void {
    if (tabs.length <= 1) {
      onClose?.();
      return;
    }
    const closingActive = tabs.find((item) => item.id === id)?.active;
    const filtered = tabs.filter((item) => item.id !== id);
    if (closingActive) {
      filtered[0].active = true;
    }
    tabs = filtered;
    clearTabFrameCache(id);
  }

  function normalizeUrl(raw: string): string {
    const value = raw.trim();
    if (!value || value === "about:blank") {
      return "";
    }
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value)) {
      return value;
    }
    return `https://${value}`;
  }

  function clearPinnedTabTitle(tabId: string): void {
    const { [tabId]: _ignoredPinnedTitle, ...restPinnedTitles } =
      pinnedTabTitles;
    pinnedTabTitles = restPinnedTitles;
  }

  function setPinnedTabTitle(tabId: string, preferredTitle?: string): void {
    const normalizedPreferredTitle = preferredTitle?.trim();
    if (normalizedPreferredTitle) {
      pinnedTabTitles = {
        ...pinnedTabTitles,
        [tabId]: normalizedPreferredTitle,
      };
      return;
    }
    clearPinnedTabTitle(tabId);
  }

  /**
   * tab 标题优先级（从高到低）：
   * 1) preferredTitle：业务显式指定（如快捷卡片主标题）
   * 2) iframeTitle：页面加载后读到的 document.title
   * 3) url hostname：从地址推导
   * 4) defaultTabTitle：兜底标题
   */
  function resolveTabTitle({
    preferredTitle,
    iframeTitle,
    url,
  }: {
    preferredTitle?: string;
    iframeTitle?: string | null;
    url?: string;
  }): string {
    const explicitTitle = preferredTitle?.trim();
    if (explicitTitle) {
      return explicitTitle;
    }
    const loadedTitle = iframeTitle?.trim();
    if (loadedTitle) {
      return loadedTitle;
    }
    if (!url) {
      return defaultTabTitle;
    }
    try {
      return new URL(url).hostname || url;
    } catch {
      return url;
    }
  }

  function isUrlAllowed(url: string): boolean {
    if (!iframePages?.domainWhitelistPatterns?.length) {
      return false;
    }
    let hostname: string;
    try {
      hostname = new URL(url).hostname;
    } catch {
      return false;
    }
    for (const pattern of iframePages.domainWhitelistPatterns) {
      if (!pattern) continue;
      if (pattern.includes("*")) {
        const base = pattern.replace(/^\*\./, "");
        if (!base) continue;
        if (hostname === base || hostname.endsWith(`.${base}`)) {
          return true;
        }
      } else if (hostname === pattern) {
        return true;
      }
    }
    return false;
  }

  function openInRealBrowser(url: string): void {
    if (typeof window === "undefined") {
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function openUrlFromShortcut(rawUrl: string, preferredTitle?: string): void {
    const nextUrl = normalizeUrl(rawUrl);
    if (!nextUrl) {
      return;
    }
    if (!isUrlAllowed(nextUrl)) {
      openInRealBrowser(nextUrl);
      return;
    }
    tabs = tabs.map((item) =>
      item.id === activeTab.id
        ? {
            ...item,
            url: nextUrl,
            title: resolveTabTitle({ preferredTitle, url: nextUrl }),
          }
        : item,
    );
    tabFrameVersions = {
      ...tabFrameVersions,
      [activeTab.id]: getTabFrameVersion(activeTab.id) + 1,
    };
    setPinnedTabTitle(activeTab.id, preferredTitle);
  }

  function navigateToAddress(): void {
    const nextUrl = normalizeUrl(addressInput);
    if (!nextUrl) {
      return;
    }
    if (!isUrlAllowed(nextUrl)) {
      openInRealBrowser(nextUrl);
      return;
    }
    tabs = tabs.map((item) =>
      item.id === activeTab.id
        ? { ...item, url: nextUrl, title: resolveTabTitle({ url: nextUrl }) }
        : item,
    );
    tabFrameVersions = {
      ...tabFrameVersions,
      [activeTab.id]: getTabFrameVersion(activeTab.id) + 1,
    };
    clearPinnedTabTitle(activeTab.id);
  }

  function handleAddressKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    navigateToAddress();
  }

  /** 同源时可读；跨域恒为 null */
  function tryReadIframeDocumentTitle(
    iframe: HTMLIFrameElement,
  ): string | null {
    try {
      const raw = iframe.contentDocument?.title?.trim();
      return raw || null;
    } catch {
      return null;
    }
  }

  function applyLoadedIframeTitle(
    event: Event,
    mountedTabId: string,
    mountedTabUrl: string,
    mountedFrameKey: string,
  ): void {
    if (
      activeTab.id !== mountedTabId ||
      activeTab.url !== mountedTabUrl ||
      activeFrameKey !== mountedFrameKey
    ) {
      return;
    }
    loadedFrameKeys = { ...loadedFrameKeys, [mountedFrameKey]: true };
    frameLoading = false;
    const iframe = event.currentTarget as HTMLIFrameElement;
    const docTitle = tryReadIframeDocumentTitle(iframe);
    const pinnedTitle = pinnedTabTitles[mountedTabId];
    if (!docTitle && !pinnedTitle) {
      return;
    }
    const nextTitle = resolveTabTitle({
      preferredTitle: pinnedTitle,
      iframeTitle: docTitle,
      url: mountedTabUrl,
    });
    tabs = tabs.map((item) =>
      item.id === mountedTabId && item.url === mountedTabUrl
        ? { ...item, title: nextTitle }
        : item,
    );
  }

  $effect(() => {
    addressInput = activeTab.url || "";
  });

  $effect(() => {
    tabs.length;
    scheduleTabLayoutRecompute();
  });

  $effect(() => {
    useTabScrollControls;
    scheduleTabLayoutRecompute();
  });

  $effect(() => {
    activeTab.id;
    if (useTabScrollControls) {
      scrollActiveTabIntoView();
    }
  });

  function handleTabViewportScroll(): void {
    tabScrollController?.updateScrollState();
  }

  function handleArrowPointerDown(
    event: PointerEvent,
    direction: TabScrollDirection,
  ): void {
    const target = event.currentTarget as HTMLElement | null;
    target?.setPointerCapture?.(event.pointerId);
    tabScrollController?.startContinuousScroll(direction);
  }

  function handleArrowPointerUp(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement | null;
    if (target?.hasPointerCapture?.(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }
    tabScrollController?.stopContinuousScroll();
  }

  onMount(() => {
    if (typeof window === "undefined") {
      return;
    }
    tabScrollController = createTabScrollController({
      getContainer: () => tabsViewportEl,
      getStep: () => computedTabWidth + TAB_GAP,
      onStateChange: (nextState) => {
        canScrollLeft = nextState.canScrollLeft;
        canScrollRight = nextState.canScrollRight;
      },
    });
    resizeObserver = new ResizeObserver(() => {
      scheduleTabLayoutRecompute();
    });
    if (tabAreaEl) {
      resizeObserver.observe(tabAreaEl);
    }
    if (addTabButtonEl) {
      resizeObserver.observe(addTabButtonEl);
    }
    window.addEventListener("resize", scheduleTabLayoutRecompute);
    scheduleTabLayoutRecompute();
    return () => {
      if (layoutRafId) {
        window.cancelAnimationFrame(layoutRafId);
      }
      if (activeTabScrollRafId) {
        window.cancelAnimationFrame(activeTabScrollRafId);
      }
      window.removeEventListener("resize", scheduleTabLayoutRecompute);
      resizeObserver?.disconnect();
      resizeObserver = null;
      tabScrollController?.destroy();
      tabScrollController = null;
    };
  });

  onDestroy(() => {
    if (layoutRafId && typeof window !== "undefined") {
      window.cancelAnimationFrame(layoutRafId);
    }
    if (activeTabScrollRafId && typeof window !== "undefined") {
      window.cancelAnimationFrame(activeTabScrollRafId);
    }
    clearTabLimitWarningTimer();
  });
</script>

<section class="pep-cloud-deploy-flow-browser" bi_parent_name="PseudoBrowser">
  <AlertToast
    variant="warning"
    visible={tabLimitWarningVisible}
    title={TAB_LIMIT_WARNING_TITLE}
    description={TAB_LIMIT_CONFIRM_TEXT}
    onClose={dismissTabLimitWarning}
  />
  <div class="pep-cloud-deploy-flow-browser__tabs-bar">
    <div class="pep-cloud-deploy-flow-browser__tab-main" bind:this={tabAreaEl}>
      {#if useTabScrollControls}
        <button
          type="button"
          class="pep-cloud-deploy-flow-browser__tab-arrow pep-cloud-deploy-flow-browser__tab-arrow--left"
          bi_name="BrowserTabScrollLeft"
          onclick={() => tabScrollController?.scrollByOneTab(-1)}
          onpointerdown={(event) => handleArrowPointerDown(event, -1)}
          onpointerup={handleArrowPointerUp}
          onpointercancel={handleArrowPointerUp}
          onpointerleave={handleArrowPointerUp}
          onlostpointercapture={handleArrowPointerUp}
          aria-label="向左滚动标签页"
          disabled={!canScrollLeft}
        >
          <img
            src={canScrollLeft ? LEFT_ARROW_ICON : LEFT_ARROW_ICON_DISABLED}
            alt=""
          />
        </button>
      {/if}
      <div
        class="pep-cloud-deploy-flow-browser__tabs-viewport"
        class:pep-cloud-deploy-flow-browser__tabs-viewport--scrollable={useTabScrollControls}
        bind:this={tabsViewportEl}
        onscroll={handleTabViewportScroll}
      >
        <div
          class="pep-cloud-deploy-flow-browser__tabs"
          class:pep-cloud-deploy-flow-browser__tabs--scrollable={useTabScrollControls}
        >
          {#each tabs as tab}
            <div
              class:active={tab.active}
              class="pep-cloud-deploy-flow-browser__tab-item"
              class:pep-cloud-deploy-flow-browser__tab-item--fixed-width={useTabScrollControls}
              style={useTabScrollControls
                ? `width:${computedTabWidth}px;min-width:${computedTabWidth}px;max-width:${computedTabWidth}px;`
                : undefined}
              role="button"
              tabindex="0"
              bi_name="BrowserTabItem"
              onclick={() => selectTab(tab.id)}
              onkeydown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  selectTab(tab.id);
                }
              }}
            >
              <Tooltip
                content={tab.title}
                placement="bottom"
                positioning={{ offset: 16 }}
              >
                <span class="pep-cloud-deploy-flow-browser__tab-title"
                  >{tab.title}</span
                >
              </Tooltip>
              <button
                type="button"
                class="pep-cloud-deploy-flow-browser__close"
                bi_name="BrowserCloseTab"
                onclick={(event) => {
                  event.stopPropagation();
                  closeTab(tab.id);
                }}
                aria-label="关闭标签页"
              >
                {#if iframePages?.icons?.closeTab}
                  <img src={iframePages.icons.closeTab} alt="" />
                {:else}
                  x
                {/if}
              </button>
            </div>
          {/each}
          {#if !addTabPinned}
            <button
              type="button"
              class="pep-cloud-deploy-flow-browser__add-tab"
              bi_name="BrowserAddTab"
              onclick={addTab}
              aria-label="新建标签页"
              bind:this={addTabButtonEl}
            >
              {#if iframePages?.icons?.addTab}
                <img src={iframePages.icons.addTab} alt="" />
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 5v14M5 12h14"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  ></path>
                </svg>
              {/if}
            </button>
          {/if}
        </div>
      </div>
      {#if useTabScrollControls}
        <button
          type="button"
          class="pep-cloud-deploy-flow-browser__tab-arrow pep-cloud-deploy-flow-browser__tab-arrow--right"
          bi_name="BrowserTabScrollRight"
          onclick={() => tabScrollController?.scrollByOneTab(1)}
          onpointerdown={(event) => handleArrowPointerDown(event, 1)}
          onpointerup={handleArrowPointerUp}
          onpointercancel={handleArrowPointerUp}
          onpointerleave={handleArrowPointerUp}
          onlostpointercapture={handleArrowPointerUp}
          aria-label="向右滚动标签页"
          disabled={!canScrollRight}
        >
          <img
            src={canScrollRight ? RIGHT_ARROW_ICON : RIGHT_ARROW_ICON_DISABLED}
            alt=""
          />
        </button>
      {/if}
      {#if addTabPinned}
        <button
          type="button"
          class="pep-cloud-deploy-flow-browser__add-tab pep-cloud-deploy-flow-browser__add-tab--pinned"
          bi_name="BrowserAddTab"
          onclick={addTab}
          aria-label="新建标签页"
          bind:this={addTabButtonEl}
        >
          {#if iframePages?.icons?.addTab}
            <img src={iframePages.icons.addTab} alt="" />
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 5v14M5 12h14"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              ></path>
            </svg>
          {/if}
        </button>
      {/if}
    </div>
    {#if isBrowserFullscreen}
      <button
        type="button"
        class="pep-cloud-deploy-flow-browser__tool-btn"
        bi_name="BrowserSwitchToSideMode"
        onclick={onSwitchToSideMode}
        aria-label="切回侧边模式"
      >
        {#if iframePages?.icons?.switchToSideIcon}
          <img src={iframePages.icons.switchToSideIcon} alt="" />
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
            <path
              d="M11 8l-4 4 4 4"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        {/if}
      </button>
    {:else}
      <button
        type="button"
        class="pep-cloud-deploy-flow-browser__tool-btn"
        bi_name="BrowserFullscreen"
        onclick={onFullscreen}
        aria-label="全屏伪浏览器"
      >
        {#if iframePages?.icons?.fullscreen}
          <img src={iframePages.icons.fullscreen} alt="" />
        {:else}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 21h-5v-5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></path>
          </svg>
        {/if}
      </button>
    {/if}
  </div>

  {#if !activeTab.url}
    <div class="pep-cloud-deploy-flow-browser__address-wrap">
      <label class="pep-cloud-deploy-flow-browser__address-bar">
        {#if iframePages?.icons?.headerLogo}
          <img
            class="pep-cloud-deploy-flow-browser__header-logo pep-cloud-deploy-flow-browser__address-prefix-logo"
            src={iframePages.icons.headerLogo}
            alt=""
          />
        {:else}
          <div
            class="pep-cloud-deploy-flow-browser__logo-dot pep-cloud-deploy-flow-browser__address-prefix-logo"
          ></div>
        {/if}
        <input
          type="text"
          class="pep-cloud-deploy-flow-browser__address-input"
          aria-label="地址栏"
          bind:value={addressInput}
          placeholder={addressPlaceholder}
          onkeydown={handleAddressKeydown}
        />
      </label>
    </div>
  {/if}

  <div class="pep-cloud-deploy-flow-browser__frame-wrap">
    {#each tabs as tab (tab.id)}
      {#if tab.url}
        {@const mountedTabId = tab.id}
        {@const mountedTabUrl = tab.url}
        {@const mountedFrameKey = getTabFrameKey(tab)}
        {#key mountedFrameKey}
          <div
            class="pep-cloud-deploy-flow-browser__frame-host"
            class:pep-cloud-deploy-flow-browser__frame-host--hidden={!tab.active}
          >
            {#if tab.active && frameLoading}
              <div
                class="pep-cloud-deploy-flow-browser__frame-loading"
                role="status"
                aria-live="polite"
                aria-busy="true"
              >
                <span class="pep-cloud-deploy-flow-browser__frame-loading-text"
                  >{iframePages.frameLoadingText}</span
                >
              </div>
            {/if}
            <iframe
              src={tab.url}
              title={tab.title}
              class="pep-cloud-deploy-flow-browser__frame-iframe"
              onload={(e) =>
                applyLoadedIframeTitle(
                  e,
                  mountedTabId,
                  mountedTabUrl,
                  mountedFrameKey,
                )}
            ></iframe>
          </div>
        {/key}
      {/if}
    {/each}
    {#if !activeTab.url}
      <div
        class="pep-cloud-deploy-flow-browser__blank"
        style={backgroundImage
          ? `background-color: #d8e9f6; background-image: url('${backgroundImage}'); background-size: cover; background-position: center;`
          : undefined}
      >
        <div class="pep-cloud-deploy-flow-browser__blank-title">
          {#if pageTitleIcon}
            <img src={pageTitleIcon} alt="" />
          {:else}
            <span class="pep-cloud-deploy-flow-browser__blank-title-dot">i</span
            >
          {/if}
          <h3>{pageTitleText}</h3>
        </div>

        <div class="pep-cloud-deploy-flow-browser__shortcut-group">
          <p class="pep-cloud-deploy-flow-browser__shortcut-title">
            {shortcutTitle}
          </p>
          {#if shortcutItems.length}
            <div class="pep-cloud-deploy-flow-browser__shortcut-list">
              {#each shortcutItems as item}
                <QuickLinkCard
                  icon={item.icon}
                  label={item.text}
                  href={item.url}
                  onClick={() => openUrlFromShortcut(item.url, item.text)}
                />
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .pep-cloud-deploy-flow-browser {
    background: #fff;
    border: 1px solid #d8dde7;
    border-radius: 2px;
    overflow: hidden;
    min-height: 760px;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .pep-cloud-deploy-flow-browser__tabs-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0 0 4px;
    min-height: 32px;
    background: #d3e3fd;
    border-bottom: 1px solid #fff;
  }

  .pep-cloud-deploy-flow-browser__tab-main {
    display: flex;
    align-items: center;
    min-width: 0;
    width: 0;
    flex: 1;
  }

  .pep-cloud-deploy-flow-browser__tabs-viewport {
    flex: 1;
    width: 0;
    min-width: 0;
    overflow: hidden;
    scrollbar-width: none;
  }

  .pep-cloud-deploy-flow-browser__tabs-viewport--scrollable {
    overflow-x: auto;
    overflow-y: hidden;
  }

  .pep-cloud-deploy-flow-browser__tabs-viewport::-webkit-scrollbar {
    display: none;
  }

  .pep-cloud-deploy-flow-browser__tabs {
    display: flex;
    gap: 2px;
    align-items: flex-end;
    width: 100%;
  }

  .pep-cloud-deploy-flow-browser__tabs--scrollable {
    width: max-content;
    min-width: 100%;
  }

  .pep-cloud-deploy-flow-browser__tab-item {
    box-sizing: border-box;
    border: none;
    border-radius: 8px 8px 0 0;
    background: transparent;
    color: #4e5969;
    padding: 0 8px 0 20px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    cursor: pointer;
    font-size: 12px;
    line-height: 16px;
    position: relative;
    transition: background-color 0.15s;
    flex: 1 1 0;
    min-width: 70px;
    max-width: 166px;
  }

  .pep-cloud-deploy-flow-browser__tab-item--fixed-width {
    flex: 0 0 auto;
  }

  .pep-cloud-deploy-flow-browser__tab-item:not(.active):hover {
    background: #a8c7fa;
  }

  .pep-cloud-deploy-flow-browser__tab-item.active {
    background: #fff;
    color: #1f2329;
  }

  .pep-cloud-deploy-flow-browser__tab-item:not(.active)::after {
    content: "";
    position: absolute;
    right: 0;
    top: 25%;
    bottom: 25%;
    width: 1px;
    background: #9ca3af;
    opacity: 0.5;
  }

  .pep-cloud-deploy-flow-browser__close {
    font-size: 10px;
    border: none;
    background: transparent;
    color: #f0f0f0;
    cursor: pointer;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pep-cloud-deploy-flow-browser__close:hover {
    background: #f0f0f0;
    color: #1f2329;
  }

  .pep-cloud-deploy-flow-browser__tab-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
    min-width: 0;
  }

  .pep-cloud-deploy-flow-browser__tab-item :global(.pep-tooltip) {
    min-width: 0;
    flex: 1 1 auto;
  }

  .pep-cloud-deploy-flow-browser__add-tab,
  .pep-cloud-deploy-flow-browser__tool-btn,
  .pep-cloud-deploy-flow-browser__tab-arrow {
    border: none;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;
    font-size: 11px;
    color: #4e5969;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 20px;
    min-width: 20px;
  }

  .pep-cloud-deploy-flow-browser__add-tab {
    width: 22px;
    height: 22px;
    min-width: 22px;
    color: #a8c7fa;
    border-radius: 50%;
    align-self: center;
    flex-shrink: 0;
    margin-left: 4px;
  }

  .pep-cloud-deploy-flow-browser__add-tab--pinned {
    margin-left: 6px;
    margin-right: 20px;
  }

  .pep-cloud-deploy-flow-browser__tab-arrow {
    width: 14px;
    min-width: 14px;
    height: 14px;
    padding: 0;
    border-radius: 0;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-browser__tab-arrow--left {
    margin-left: 4px;
    margin-right: 4px;
  }

  .pep-cloud-deploy-flow-browser__tab-arrow--right {
    margin-left: 4px;
    margin-right: 6px;
  }

  .pep-cloud-deploy-flow-browser__tab-arrow:disabled {
    cursor: default;
  }

  .pep-cloud-deploy-flow-browser__tab-arrow img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-browser__tool-btn {
    width: 32px;
    height: auto;
    min-width: 32px;
    padding: 0;
    padding-top: 4px;
    margin-top: -4px;
    border-radius: 0;
    align-self: stretch;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-browser__add-tab svg,
  .pep-cloud-deploy-flow-browser__add-tab img,
  .pep-cloud-deploy-flow-browser__tool-btn svg,
  .pep-cloud-deploy-flow-browser__tool-btn img {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-browser__close img {
    width: 12px;
    height: 12px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-browser__add-tab:hover {
    background: #a8c7fa;
  }

  .pep-cloud-deploy-flow-browser__tool-btn:hover {
    background: #ecf1fa;
  }

  .pep-cloud-deploy-flow-browser__address-wrap {
    display: flex;
    align-items: center;
    padding: 6px 10px;
    background: #fff;
  }

  .pep-cloud-deploy-flow-browser__logo-dot,
  .pep-cloud-deploy-flow-browser__header-logo {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-browser__logo-dot {
    border-radius: 50%;
    background: linear-gradient(180deg, #f53f3f 0%, #ff7d00 100%);
  }

  .pep-cloud-deploy-flow-browser__header-logo {
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-browser__address-bar {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid #d2d8e2;
    border-radius: 999px;
    padding: 0 12px;
    overflow: hidden;
    cursor: text;
    transition:
      border-color 0.15s ease,
      background-color 0.15s ease,
      box-shadow 0.15s ease;
  }

  .pep-cloud-deploy-flow-browser__address-bar:hover {
    background: #f8f9fb;
    border-color: #c3cad6;
  }

  .pep-cloud-deploy-flow-browser__address-bar:focus-within {
    background: #ffffff;
    border-color: #6f9df6;
    box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.16);
  }

  .pep-cloud-deploy-flow-browser__address-input {
    width: 100%;
    height: 30px;
    border: none;
    background: transparent;
    color: #30343b;
    font-size: 12px;
    outline: none;
    cursor: text;
  }

  .pep-cloud-deploy-flow-browser__address-prefix-logo {
    opacity: 0.95;
  }

  .pep-cloud-deploy-flow-browser__address-input::placeholder {
    color: #9aa2ad;
  }

  .pep-cloud-deploy-flow-browser__frame-wrap {
    flex: 1;
    min-height: 0;
    background: #f5f5f5;
    display: flex;
  }

  .pep-cloud-deploy-flow-browser__frame-host {
    flex: 1;
    min-height: 0;
    width: 100%;
    position: relative;
    display: flex;
  }

  .pep-cloud-deploy-flow-browser__frame-host--hidden {
    display: none;
  }

  .pep-cloud-deploy-flow-browser__frame-iframe {
    flex: 1;
    width: 100%;
    min-height: 0;
    border: 0;
  }

  .pep-cloud-deploy-flow-browser__frame-loading {
    position: absolute;
    inset: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #4e5969;
    font-size: 14px;
    line-height: 1.5;
  }

  .pep-cloud-deploy-flow-browser__frame-loading-text {
    font-weight: 500;
  }

  .pep-cloud-deploy-flow-browser__blank {
    flex: 1;
    min-height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 20px;
    padding: 8% 7%;
    background: #d8e9f6;
    color: #4e5969;
  }

  .pep-cloud-deploy-flow-browser__blank-title {
    width: min(100%, 760px);
    min-height: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 0;
    background: transparent;
    color: #1f2329;
    padding: 0;
  }

  .pep-cloud-deploy-flow-browser__blank-title img,
  .pep-cloud-deploy-flow-browser__blank-title-dot {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-browser__blank-title img {
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-browser__blank-title-dot {
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #165dff;
    color: #fff;
    font-size: 12px;
    font-weight: 700;
    font-style: normal;
  }

  .pep-cloud-deploy-flow-browser__blank-title h3 {
    margin: 0;
    font-size: 16px;
    line-height: 1.4;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .pep-cloud-deploy-flow-browser__shortcut-title {
    margin: 0 0 10px 0;
    font-size: 12px;
    color: #1d2129;
    font-weight: 500;
  }

  .pep-cloud-deploy-flow-browser__shortcut-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
  }

  @media (max-width: 768px) {
    .pep-cloud-deploy-flow-browser__shortcut-list {
      grid-template-columns: 1fr;
    }
  }

  /* shortcut card styles moved to QuickLinkCard.svelte */
</style>
