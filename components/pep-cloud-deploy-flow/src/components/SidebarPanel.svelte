<script lang="ts">
  import {
    getNextStepIndex,
    getPrevStepIndex,
    shouldHijackLink,
  } from "../utils/phase2";
  import { fetchWithCache } from "../utils/remoteContentCache";
  import type { RemoteContentData } from "../utils/phase2";
  import type { SidebarConfig } from "../types";
  import { loadRemoteContentForStep } from "../utils/remote-content-loader";
  import { buildRemoteIframeSrcdoc } from "../utils/remoteShadowSandbox";
  import Tooltip from "./Tooltip.svelte";
  import StepStatusDot from "./StepStatusDot.svelte";

  interface Props {
    sidebar: SidebarConfig;
    onOpenExternal?: (url: string, title: string) => void;
    onFloat?: () => void;
    onRestoreSide?: () => void;
    onCollapse?: () => void;
    isFloating?: boolean;
    isFullscreen?: boolean;
  }

  let {
    sidebar,
    onOpenExternal,
    onFloat,
    onRestoreSide,
    onCollapse,
    isFloating = false,
    isFullscreen = false,
  }: Props = $props();
  let activeTabIndex = $state(0);
  let activeApplicationIndex = $state(0);
  let activeStepIndex = $state(0);
  let appDropdownOpen = $state(false);
  let appDropdownEl = $state<HTMLDivElement | null>(null);
  let stepsRowEl = $state<HTMLDivElement | null>(null);
  let stepsListEl = $state<HTMLOListElement | null>(null);
  let isCompactSteps = $state(false);
  let isLoading = $state(false);
  let remoteContentData = $state<RemoteContentData | null>(null);
  let remoteIframeEl = $state<HTMLIFrameElement | null>(null);

  let activeTab = $derived(sidebar.tabs[activeTabIndex] ?? sidebar.tabs[0]);
  let hasApplications = $derived((activeTab?.applications?.length ?? 0) > 0);
  // Only show app selector when at least one application has a visible title.
  let showAppDropdown = $derived(
    hasApplications &&
      (activeTab?.applications?.some(
        (app) => (app.title ?? "").trim().length > 0,
      ) ??
        false),
  );
  let currentSteps = $derived(
    hasApplications && activeTab?.applications
      ? (activeTab.applications[activeApplicationIndex]?.steps ?? [])
      : (activeTab?.steps ?? []),
  );
  let activeStep = $derived(currentSteps[activeStepIndex] ?? currentSteps[0]);
  let canPrev = $derived(activeStepIndex > 0);
  let canNext = $derived(activeStepIndex < currentSteps.length - 1);

  async function loadRemoteContent(): Promise<void> {
    if (!activeTab || !activeStep) {
      remoteContentData = null;
      return;
    }
    isLoading = true;
    try {
      remoteContentData = await loadRemoteContentForStep({
        tabTitle: activeTab.title,
        step: activeStep,
        stepIndex: activeStepIndex,
        texts: {
          messageTemplate: sidebar.texts.remoteFallbackMessageTemplate,
          linkText: sidebar.texts.remoteFallbackLinkText,
        },
        fetchText: fetchWithCache,
      });
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    void activeTabIndex;
    void activeStepIndex;
    void loadRemoteContent();
  });

  $effect(() => {
    const iframe = remoteIframeEl;
    const data = remoteContentData;
    const loading = isLoading;
    if (!iframe || loading || !data) {
      return;
    }
    const srcdoc = buildRemoteIframeSrcdoc(data.css ?? "", data.html);
    iframe.srcdoc = srcdoc;

    let resizeObserver: ResizeObserver | undefined;
    const onClick = (event: MouseEvent) => {
      const t = event.target;
      if (!(t instanceof HTMLElement)) {
        return;
      }
      const anchor = t.closest("a");
      if (!anchor) {
        return;
      }
      const href = anchor.getAttribute("href");
      if (shouldHijackLink(href) && onOpenExternal) {
        event.preventDefault();
        onOpenExternal(
          href ?? "",
          anchor.innerText || sidebar.texts.openExternalDefaultTitle,
        );
      }
    };

    const adjustHeight = () => {
      const doc = iframe.contentDocument;
      if (!doc?.documentElement) {
        return;
      }
      const h = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight ?? 0,
        120,
      );
      iframe.style.height = `${h}px`;
    };

    const onLoad = () => {
      if (iframe.srcdoc !== srcdoc) {
        return;
      }
      const doc = iframe.contentDocument;
      if (!doc) {
        return;
      }
      doc.addEventListener("click", onClick, true);
      adjustHeight();
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(() => {
          adjustHeight();
        });
        resizeObserver.observe(doc.documentElement);
        if (doc.body) {
          resizeObserver.observe(doc.body);
        }
      }
    };

    iframe.addEventListener("load", onLoad);
    return () => {
      iframe.removeEventListener("load", onLoad);
      resizeObserver?.disconnect();
      const doc = iframe.contentDocument;
      if (doc) {
        doc.removeEventListener("click", onClick, true);
      }
    };
  });

  $effect(() => {
    if (!appDropdownOpen) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (appDropdownEl?.contains(target)) {
        return;
      }
      appDropdownOpen = false;
    };
    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  });

  $effect(() => {
    const rowEl = stepsRowEl;
    if (!rowEl || typeof ResizeObserver === "undefined") {
      return;
    }

    const updateCompact = () => {
      const styles = window.getComputedStyle(rowEl);
      const gapValue = styles.columnGap || styles.gap || "0";
      const gap = Number.parseFloat(gapValue) || 0;
      const appWidth = showAppDropdown ? (appDropdownEl?.offsetWidth ?? 0) : 0;
      const availableWidth = Math.max(
        0,
        rowEl.clientWidth - appWidth - (showAppDropdown ? gap : 0),
      );
      isCompactSteps = availableWidth < 340;
    };

    updateCompact();

    const observer = new ResizeObserver(() => {
      updateCompact();
    });

    observer.observe(rowEl);
    if (appDropdownEl) {
      observer.observe(appDropdownEl);
    }
    return () => observer.disconnect();
  });

  function handleTabClick(index: number): void {
    activeTabIndex = index;
    activeApplicationIndex = 0;
    activeStepIndex = 0;
  }

  function handleApplicationChange(index: number): void {
    activeApplicationIndex = index;
    activeStepIndex = 0;
    appDropdownOpen = false;
  }

  function handleStepClick(index: number): void {
    activeStepIndex = index;
  }

  function handleStepButtonClick(event: MouseEvent, index: number): void {
    const target = event.target as HTMLElement | null;
    if (target?.closest(".pep-cloud-deploy-flow-sidebar__step-dot-hitbox")) {
      return;
    }
    handleStepClick(index);
  }

  function handlePrevClick(): void {
    activeStepIndex = getPrevStepIndex(activeStepIndex);
  }

  function handleNextClick(): void {
    activeStepIndex = getNextStepIndex(activeStepIndex, currentSteps.length);
  }

</script>

<aside class="pep-cloud-deploy-flow-sidebar" class:is-floating={isFloating}>
  <div class="pep-cloud-deploy-flow-sidebar__header">
    <div class="pep-cloud-deploy-flow-sidebar__tabs">
      {#each sidebar.tabs as tab, index (`${tab.title}-${index}`)}
        <button
          type="button"
          class:active={activeTabIndex === index}
          onclick={() => handleTabClick(index)}
          title={tab.title}
        >
          <span class="pep-cloud-deploy-flow-sidebar__tab-text"
            >{tab.title}</span
          >
        </button>
      {/each}
    </div>
    <div class="pep-cloud-deploy-flow-sidebar__tools">
      {#if isFullscreen}
        <button
          type="button"
          aria-label="切换到悬浮"
          title="切换到悬浮"
          onclick={onFloat}
        >
          {#if sidebar.icons?.floatIcon}
            <img src={sidebar.icons.floatIcon} alt="" />
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <rect
                x="2"
                y="5"
                width="14"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M8 5V3h13a2 2 0 0 1 2 2v13h-2"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </button>
        <button
          type="button"
          aria-label="恢复原状/切换到侧边模式"
          title="恢复原状/切换到侧边模式"
          onclick={onRestoreSide}
        >
          {#if sidebar.icons?.minimizeToSideIcon}
            <img src={sidebar.icons.minimizeToSideIcon} alt="" />
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <path
                d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M11 8l-4 4 4 4"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </button>
      {:else}
        <button
          type="button"
          aria-label={isFloating ? "切换为侧边栏" : "切换为悬浮窗"}
          title={isFloating ? "切换为侧边栏" : "切换为悬浮窗"}
          onclick={onFloat}
        >
          {#if isFloating && sidebar.icons?.switchToSideModeIcon}
            <img src={sidebar.icons.switchToSideModeIcon} alt="" />
          {:else if sidebar.icons?.floatIcon}
            <img src={sidebar.icons.floatIcon} alt="" />
          {:else if isFloating}
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M9 3v18"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
              />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
              <rect
                x="2"
                y="5"
                width="14"
                height="14"
                rx="2"
                stroke="currentColor"
                stroke-width="1.8"
              />
              <path
                d="M8 5V3h13a2 2 0 0 1 2 2v13h-2"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          {/if}
        </button>
        <button
          type="button"
          aria-label="折叠"
          title="折叠"
          onclick={onCollapse}
        >
          {#if sidebar.icons?.collapseIcon}
            <img src={sidebar.icons.collapseIcon} alt="" />
          {:else}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h14"
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

  {#if currentSteps.length > 0}
    <div
      class="pep-cloud-deploy-flow-sidebar__steps-row"
      class:has-app-select={showAppDropdown}
      bind:this={stepsRowEl}
    >
      {#if showAppDropdown && activeTab?.applications}
        <div
          class="pep-cloud-deploy-flow-sidebar__app-select-wrap"
          bind:this={appDropdownEl}
        >
          <button
            type="button"
            class="pep-cloud-deploy-flow-sidebar__app-trigger"
            aria-label="选择应用"
            aria-expanded={appDropdownOpen}
            aria-haspopup="listbox"
            title={activeTab.applications[activeApplicationIndex]?.title ?? ""}
            onclick={() => (appDropdownOpen = !appDropdownOpen)}
          >
            <span class="pep-cloud-deploy-flow-sidebar__app-trigger-text">
              {activeTab.applications[activeApplicationIndex]?.title ?? ""}
            </span>
            <span
              class="pep-cloud-deploy-flow-sidebar__app-trigger-arrow"
              aria-hidden="true"
            >
              <svg viewBox="0 0 16 16" width="16" height="16">
                <path
                  d="M4 6l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
          {#if appDropdownOpen}
            <div
              class="pep-cloud-deploy-flow-sidebar__app-dropdown"
              role="listbox"
            >
              {#each activeTab.applications as app, idx (`${app.title}-${idx}`)}
                <button
                  type="button"
                  role="option"
                  aria-selected={activeApplicationIndex === idx}
                  class="pep-cloud-deploy-flow-sidebar__app-option"
                  class:active={activeApplicationIndex === idx}
                  onclick={() => handleApplicationChange(idx)}
                >
                  {app.title}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
      <ol
        class="pep-cloud-deploy-flow-sidebar__steps"
        class:is-compact={isCompactSteps}
        bind:this={stepsListEl}
      >
        {#each currentSteps as step, index (`${step.title}-${index}`)}
          <li class:active={activeStepIndex === index}>
            <button
              type="button"
              onclick={(event) => handleStepButtonClick(event, index)}
            >
              <span class="pep-cloud-deploy-flow-sidebar__step-dot-hitbox">
                <Tooltip content={step.title}>
                  <StepStatusDot
                    completed={index < activeStepIndex}
                    {index}
                    checkedIcon={sidebar.icons?.stepCheckedIcon}
                    dotClass="dot"
                    fallbackClass="check-fallback"
                  />
                </Tooltip>
              </span>
              <span
                class="pep-cloud-deploy-flow-sidebar__step-label"
                title={step.title}
              >
                {step.title}
              </span>
            </button>
            {#if index < currentSteps.length - 1}
              <span class="line" class:is-completed={index < activeStepIndex}
              ></span>
            {/if}
          </li>
        {/each}
      </ol>
    </div>
  {/if}

  <div class="pep-cloud-deploy-flow-sidebar__remote-content remote-content">
    {#if isLoading}
      <p class="loading">{sidebar.texts.remoteLoadingText}</p>
    {:else if remoteContentData}
      <iframe
        class="pep-cloud-deploy-flow-remote-iframe"
        bind:this={remoteIframeEl}
        title={activeStep?.title ?? "文档内容"}
        scrolling="no"
      ></iframe>
    {:else}
      <p class="loading">{sidebar.texts.remoteLoadFailedText}</p>
    {/if}
  </div>

  <div class="pep-cloud-deploy-flow-sidebar__footer">
    {#if canPrev}
      <button type="button" class="is-secondary" onclick={handlePrevClick}>
        {sidebar.footer.prevText}
      </button>
    {/if}
    {#if canNext}
      <button type="button" class="is-primary" onclick={handleNextClick}>
        {sidebar.footer.nextText}
      </button>
    {/if}
  </div>
</aside>

<style>
  .pep-cloud-deploy-flow-sidebar {
    background: #ffffff;
    border: 1px solid #e5e6eb;
    border-radius: 2px;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 760px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .pep-cloud-deploy-flow-sidebar.is-floating {
    min-height: 0;
    height: 100%;
  }

  .pep-cloud-deploy-flow-sidebar__header {
    display: flex;
    align-items: center;
    gap: 6px;
    border-bottom: 1px solid var(--primitive-gray-200);
    padding: 10px 14px 0;
    min-height: 42px;
    box-sizing: border-box;
  }

  .pep-cloud-deploy-flow-sidebar__tabs {
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    gap: 6px;
    flex: 1;
    min-width: 0;
    overflow: hidden;
  }

  .pep-cloud-deploy-flow-sidebar__tools {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .pep-cloud-deploy-flow-sidebar__tools button {
    width: 20px;
    height: 20px;
    border: none;
    background: transparent;
    color: #86909c;
    font-size: 11px;
    cursor: pointer;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-bottom: 4px;
  }

  .pep-cloud-deploy-flow-sidebar__tools button:hover {
    background: #f0f0f0;
    border-radius: 4px;
    color: #4e5969;
  }

  .pep-cloud-deploy-flow-sidebar__tools svg,
  .pep-cloud-deploy-flow-sidebar__tools img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-sidebar__tabs button,
  .pep-cloud-deploy-flow-sidebar__footer button {
    border: none;
    background: transparent;
    color: #4e5969;
    border-radius: 0;
    padding: 8px 12px;
    text-align: left;
    cursor: pointer;
    font-size: 14px;
    white-space: nowrap;
    min-width: 0;
  }

  .pep-cloud-deploy-flow-sidebar__tabs button {
    flex: 0 1 auto;
    max-width: 140px;
    overflow: hidden;
  }

  .pep-cloud-deploy-flow-sidebar__tabs button.active {
    color: #1f2329;
    font-weight: 700;
    border-bottom: 2px solid #1f2329;
  }

  .pep-cloud-deploy-flow-sidebar__tab-text {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pep-cloud-deploy-flow-sidebar__steps-row {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid var(--primitive-gray-200);
    padding: 12px 16px 14px;
    min-height: 0;
  }

  .pep-cloud-deploy-flow-sidebar__steps-row.has-app-select {
    justify-content: space-between;
  }

  .pep-cloud-deploy-flow-sidebar__app-select-wrap {
    position: relative;
    flex-shrink: 0;
    min-width: 0;
  }

  .pep-cloud-deploy-flow-sidebar__app-trigger {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    font-size: 12px;
    color: #165dff;
    outline: none;
  }

  .pep-cloud-deploy-flow-sidebar__app-trigger:hover {
    color: #4080ff;
  }

  .pep-cloud-deploy-flow-sidebar__app-trigger-text {
    max-width: 107px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pep-cloud-deploy-flow-sidebar__app-trigger-arrow {
    width: 16px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #4e5969;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-sidebar__app-trigger-arrow svg {
    width: 16px;
    height: 16px;
  }

  .pep-cloud-deploy-flow-sidebar__app-dropdown {
    position: absolute;
    left: 0;
    top: 100%;
    margin-top: 6px;
    background: #fff;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    min-width: 140px;
    max-height: 280px;
    overflow-y: auto;
    z-index: 20;
  }

  .pep-cloud-deploy-flow-sidebar__app-option {
    display: block;
    width: 100%;
    border: none;
    background: transparent;
    padding: 8px 12px;
    font-size: 12px;
    color: #1f2329;
    text-align: left;
    cursor: pointer;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pep-cloud-deploy-flow-sidebar__app-option:hover {
    background: #f5f7fa;
  }

  .pep-cloud-deploy-flow-sidebar__app-option.active {
    color: #165dff;
    font-weight: 500;
  }

  .pep-cloud-deploy-flow-sidebar__steps {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    margin: 0;
    padding-left: 0;
    list-style: none;
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    flex-wrap: nowrap;
  }

  .pep-cloud-deploy-flow-sidebar__steps-row.has-app-select
    .pep-cloud-deploy-flow-sidebar__steps {
    justify-content: flex-end;
  }

  .pep-cloud-deploy-flow-sidebar__steps-row.has-app-select
    .pep-cloud-deploy-flow-sidebar__steps
    li {
    flex: 0 1 auto;
  }

  .pep-cloud-deploy-flow-sidebar__steps li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  .pep-cloud-deploy-flow-sidebar__steps li button {
    border: none;
    background: transparent;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #4e5969;
    font-size: 11px;
    padding: 0;
    cursor: pointer;
    min-width: 0;
    max-width: 100%;
  }

  .pep-cloud-deploy-flow-sidebar__step-dot-hitbox {
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    cursor: default;
  }

  .pep-cloud-deploy-flow-sidebar__step-label {
    display: inline-block;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pep-cloud-deploy-flow-sidebar__steps li.active button {
    color: var(--text-primary);
    font-weight: 600;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps .dot) {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #86909c;
    background: #fff;
    border: 1px solid #c9cdd4;
  }
  :global(.pep-cloud-deploy-flow-sidebar__steps .dot.is-completed) {
    border: unset;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps .dot img) {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps .dot .check-fallback) {
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps li.active .dot) {
    background: #1f2329;
    border-color: #1f2329;
    color: #fff;
  }

  .pep-cloud-deploy-flow-sidebar__steps .line {
    width: 24px;
    height: 1px;
    background: #c9cdd4;
  }

  .pep-cloud-deploy-flow-sidebar__steps .line.is-completed {
    height: 2px;
  }

  .pep-cloud-deploy-flow-sidebar__remote-content {
    border: none;
    padding: 16px;
    flex: 1 1 0;
    min-height: 0;
    overflow-x: hidden;
    overflow-y: auto;
    background: #fff;
    padding-right: 12px;
  }

  .pep-cloud-deploy-flow-sidebar.is-floating
    .pep-cloud-deploy-flow-sidebar__remote-content {
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .pep-cloud-deploy-flow-remote-iframe {
    width: 100%;
    border: none;
    display: block;
    min-height: 120px;
    min-width: 0;
  }

  .loading {
    margin: 0;
    color: #86909c;
    font-size: 12px;
  }

  .pep-cloud-deploy-flow-sidebar__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 14px 16px;
    border-top: 1px solid var(--primitive-gray-200);
    background: #fff;
  }

  .pep-cloud-deploy-flow-sidebar__footer button {
    text-align: center;
    border-radius: 999px;
    border: 1px solid #c9cdd4;
    font-size: 14px;
    padding: 8px 24px;
    cursor: pointer;
    transition: background-color 0.15s;
  }

  .pep-cloud-deploy-flow-sidebar__footer button.is-secondary {
    background: #fff;
    color: #4e5969;
  }

  .pep-cloud-deploy-flow-sidebar__footer button.is-secondary:hover {
    background: #f5f7fa;
  }

  .pep-cloud-deploy-flow-sidebar__footer button.is-primary {
    background: #111827;
    border-color: #111827;
    color: #fff;
  }

  .pep-cloud-deploy-flow-sidebar__footer button.is-primary:hover {
    background: #1f2937;
    border-color: #1f2937;
  }

  :global(.pep-cloud-deploy-flow-sidebar__remote-content .rich-text h2) {
    font-size: 20px;
    line-height: 1.4;
    margin: 0 0 16px;
    color: var(--text-primary);
  }

  :global(.pep-cloud-deploy-flow-sidebar__remote-content .rich-text h3) {
    font-size: var(--primitive-font-base);
    line-height: 1.5;
    margin: 0 0 10px;
    color: var(--text-primary);
  }

  :global(.pep-cloud-deploy-flow-sidebar__remote-content .rich-text p),
  :global(.pep-cloud-deploy-flow-sidebar__remote-content .rich-text li) {
    font-size: var(--primitive-font-sm);
    line-height: 1.7;
    color: #4e5969;
  }

  :global(.pep-cloud-deploy-flow-sidebar__remote-content .rich-text a) {
    color: #165dff;
    text-decoration: none;
  }

  :global(.pep-cloud-deploy-flow-sidebar__remote-content .rich-text a:hover) {
    text-decoration: underline;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact {
    flex: 0 0 auto;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact li {
    gap: 2px;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact li button {
    gap: 0;
    line-height: 1;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact
    .pep-cloud-deploy-flow-sidebar__step-dot-hitbox {
    width: 16px;
    height: 16px;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact
    .pep-cloud-deploy-flow-sidebar__step-label {
    display: none;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps.is-compact .dot) {
    width: 8px;
    height: 8px;
    min-width: 8px;
    border-width: 1px;
    border-color: #d5d9e0;
    color: transparent;
    font-size: 0;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps.is-compact .dot.is-completed) {
    border: 1px solid #5cb300;
    background: #ffffff;
    color: transparent;
  }

  :global(
    .pep-cloud-deploy-flow-sidebar__steps.is-compact .dot.is-completed img
  ),
  :global(
    .pep-cloud-deploy-flow-sidebar__steps.is-compact
      .dot.is-completed
      .check-fallback
  ) {
    display: none;
  }

  :global(.pep-cloud-deploy-flow-sidebar__steps.is-compact li.active .dot) {
    border-color: #2375f3;
    background: #2375f3;
    box-shadow: none;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact .line {
    width: 8px;
    height: 1px;
    border-radius: 999px;
    background: #d5d9e0;
    margin: 0 1px;
  }

  .pep-cloud-deploy-flow-sidebar__steps.is-compact .line.is-completed {
    height: 2px;
  }
</style>
