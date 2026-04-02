<script lang="ts">
  import { onMount } from "svelte";
  import DeploymentFinished from "./components/DeploymentFinished.svelte";
  import EndDeploymentModal from "./components/EndDeploymentModal.svelte";
  import MainPanel from "./components/MainPanel.svelte";
  import MobileFlow from "./components/MobileFlow.svelte";
  import Navbar from "./components/Navbar.svelte";
  import PseudoBrowser from "./components/PseudoBrowser.svelte";
  import SidebarPanel from "./components/SidebarPanel.svelte";
  import Tooltip from "./components/Tooltip.svelte";
  import type { PepCloudDeployFlowRuntimeProps } from "./runtime-data";
  import { resolveMobileConfig } from "./utils/mobile-config";
  import {
    resolveSidebarForPanel,
    resolveIframePagesForBrowser,
    resolveMainContent,
    resolveEndDeployment,
    resolveNavbarForBar,
    resolveSidebarHandleIcons,
  } from "./utils/props-resolver";
  import type { BrowserExternalUrl } from "./utils/phase2";
  import {
    computeMaxSidebarWidthByRightDock,
    computeSidebarWidthByRightDock,
    getRightDockFloatingX,
    shouldShowRightSnapShadow,
    shouldSnapToRightDock,
  } from "./utils/sidebar-layout";
  import { shouldOpenEmbeddedByFlowState } from "./utils/deploy-flow-link-state";

  let data: PepCloudDeployFlowRuntimeProps = $props();
  let navbar = $derived(resolveNavbarForBar(data));
  let sidebar = $derived(resolveSidebarForPanel(data));
  let mainContent = $derived(resolveMainContent(data));
  let iframePages = $derived(resolveIframePagesForBrowser(data));
  let endDeployment = $derived(resolveEndDeployment(data));
  let mobile = $derived(resolveMobileConfig(data));
  let backgroundImage = $derived(data.backgroundImage);
  let { sidebarMinimizeIcon, sideResizeIcon: sidebarResizeIcon } = $derived(
    resolveSidebarHandleIcons(data),
  );
  let isMobileViewport = $state(false);
  let showMobileFlow = $derived(isMobileViewport && !!mobile);

  let isDeploying = $state(false);
  let isDeploymentFinished = $state(false);
  let showEndModal = $state(false);
  let externalUrl = $state<BrowserExternalUrl | null>(null);
  let sidebarState = $state<"normal" | "fullscreen" | "collapsed" | "floating">(
    "normal",
  );
  let sidebarWidth = $state(420);
  let isDragging = $state(false);
  let hasManualSidebarResize = $state(false);
  let workspaceEl = $state<HTMLDivElement | null>(null);
  let previewImageSrc = $state("");
  let previewImageAlt = $state("");
  const previewCloseIconSrc =
    "https://res-static.hc-cdn.cn/aem/content/dam/cloudbu-site/archive/china/zh-cn/support/resource/framework/v3/images/modal-close-icon.svg";

  /** 悬浮窗贴右缘吸附带宽度（px，与原先左缘吸附阈值相同） */
  const FLOAT_RIGHT_SNAP_THRESHOLD_PX = 24;
  const SIDEBAR_DEFAULT_RATIO = 0.25;
  const SIDEBAR_RATIO_MIN_VIEWPORT = 768;

  // 悬浮面板状态（默认 X 在首次进入 floating 时用视口计算）
  let floatX = $state(0);
  let floatY = $state(16);
  let floatW = $state(400);
  let floatH = $state(560);
  let isFloatDragging = $state(false);
  let isFloatResizing = $state<string | null>(null); // 'e' | 's' | 'se' | 'w'
  let showRightSnapShadow = $state(false);
  let floatDragStartX = $state(0);
  let floatDragStartY = $state(0);
  let floatDragStartPosX = $state(0);
  let floatDragStartPosY = $state(0);
  let floatResizeStartW = $state(0);
  let floatResizeStartH = $state(0);

  function handleDeployStart(payload: { url: string; title: string }): void {
    isDeploying = true;
    isDeploymentFinished = false;
    externalUrl = {
      url: payload.url,
      title: payload.title,
      timestamp: Date.now(),
    };
  }

  function handleOpenExternal(url: string, title: string): void {
    const shouldOpenEmbedded = shouldOpenEmbeddedByFlowState({
      isDeploying,
      isDeploymentFinished,
    });

    if (!shouldOpenEmbedded) {
      if (typeof window !== "undefined") {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      return;
    }

    externalUrl = {
      url,
      title,
      timestamp: Date.now(),
    };
  }

  function handleEndConfirm(): void {
    showEndModal = false;
    isDeploying = false;
    isDeploymentFinished = true;
  }

  function handlePreviewImage(src: string, alt: string): void {
    previewImageSrc = src;
    previewImageAlt = alt;
  }

  function closeImagePreview(): void {
    previewImageSrc = "";
    previewImageAlt = "";
  }

  function handleRedeploy(): void {
    isDeploymentFinished = false;
    isDeploying = false;
    externalUrl = null;
  }

  function handleBrowserSwitchToSideMode(): void {
    restoreSidebarSideModeWithDefaultRatio();
  }

  function minimizeBrowserAndShowSidebar(): void {
    isDeploying = false;
    restoreSidebarSideModeWithDefaultRatio();
  }

  function handleResizeStart(event: MouseEvent): void {
    if (sidebarState !== "normal") {
      return;
    }
    event.preventDefault();
    isDragging = true;
  }

  function openFloating(): void {
    floatX = getRightDockFloatingX(window.innerWidth, floatW);
    sidebarState = "floating";
  }

  function restoreSidebarSideModeWithDefaultRatio(): void {
    hasManualSidebarResize = false;
    sidebarState = "normal";
    syncSidebarWidthToDefaultRatio();
  }

  function syncSidebarWidthToDefaultRatio(): void {
    if (typeof window === "undefined") {
      return;
    }
    if (
      sidebarState !== "normal" ||
      hasManualSidebarResize ||
      window.innerWidth < SIDEBAR_RATIO_MIN_VIEWPORT
    ) {
      return;
    }
    const workspaceWidth =
      workspaceEl?.getBoundingClientRect().width ?? window.innerWidth;
    const fallbackMinWidth = workspaceWidth * SIDEBAR_DEFAULT_RATIO;
    const maxWidth = computeMaxSidebarWidthByRightDock({
      workspaceWidth,
      minMainWidth: 240,
      fallbackMinWidth,
    });
    const nextWidth = Math.min(fallbackMinWidth, maxWidth);
    sidebarWidth = Math.round(nextWidth);
  }

  $effect(() => {
    if (sidebarState !== "normal") {
      return;
    }
    syncSidebarWidthToDefaultRatio();
  });

  $effect(() => {
    if (!isDragging) {
      return;
    }
    let hasMoved = false;

    const handleMouseMove = (event: MouseEvent) => {
      if (sidebarState !== "normal") {
        return;
      }
      const workspaceRight = workspaceEl?.getBoundingClientRect().right ?? 0;
      const workspaceWidth =
        workspaceEl?.getBoundingClientRect().width ?? window.innerWidth;
      const minWidth = window.innerWidth * 0.25;
      const maxWidth = computeMaxSidebarWidthByRightDock({
        workspaceWidth,
        minMainWidth: 240,
        fallbackMinWidth: minWidth,
      });
      sidebarWidth = computeSidebarWidthByRightDock({
        clientX: event.clientX,
        workspaceRight,
        minWidth,
        maxWidth,
      });
      hasMoved = true;
    };

    const handleMouseUp = () => {
      isDragging = false;
      if (hasMoved) {
        hasManualSidebarResize = true;
      }
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };
  });

  // 悬浮面板拖动
  function handleFloatDragStart(event: MouseEvent): void {
    isFloatDragging = true;
    floatDragStartX = event.clientX;
    floatDragStartY = event.clientY;
    floatDragStartPosX = floatX;
    floatDragStartPosY = floatY;
  }

  // 悬浮面板调整大小
  function handleFloatResizeStart(event: MouseEvent, edge: string): void {
    event.stopPropagation();
    isFloatResizing = edge;
    floatDragStartX = event.clientX;
    floatDragStartY = event.clientY;
    floatDragStartPosX = floatX;
    floatDragStartPosY = floatY;
    floatResizeStartW = floatW;
    floatResizeStartH = floatH;
  }

  $effect(() => {
    if (!isFloatDragging && !isFloatResizing) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const dx = event.clientX - floatDragStartX;
      const dy = event.clientY - floatDragStartY;
      const containerRect = workspaceEl?.getBoundingClientRect();
      const containerWidth = containerRect?.width ?? window.innerWidth;
      const containerHeight = containerRect?.height ?? window.innerHeight;

      if (isFloatDragging) {
        const maxX = Math.max(0, containerWidth - floatW);
        const maxY = Math.max(0, containerHeight - floatH);
        const nextX = Math.max(0, Math.min(floatDragStartPosX + dx, maxX));
        const nextY = Math.max(0, Math.min(floatDragStartPosY + dy, maxY));
        floatX = nextX;
        floatY = nextY;
        showRightSnapShadow = shouldShowRightSnapShadow(
          nextX,
          floatW,
          window.innerWidth,
          FLOAT_RIGHT_SNAP_THRESHOLD_PX,
        );
      } else if (isFloatResizing) {
        const minFloatW = 280;
        const minFloatH = 200;
        const maxFloatW = Math.max(
          minFloatW,
          containerWidth - floatDragStartPosX,
        );
        const maxFloatH = Math.max(
          minFloatH,
          containerHeight - floatDragStartPosY,
        );

        if (isFloatResizing.includes("w")) {
          const floatRight = floatResizeStartW + floatDragStartPosX;
          const minX = Math.max(0, floatRight - containerWidth);
          const maxX = floatRight - minFloatW;
          const nextX = Math.max(minX, Math.min(floatDragStartPosX + dx, maxX));
          floatX = nextX;
          floatW = floatRight - nextX;
        }
        if (isFloatResizing.includes("e")) {
          floatW = Math.max(
            minFloatW,
            Math.min(floatResizeStartW + dx, maxFloatW),
          );
        }
        if (isFloatResizing.includes("s")) {
          floatH = Math.max(
            minFloatH,
            Math.min(floatResizeStartH + dy, maxFloatH),
          );
        }
      }
    };

    const handleMouseUp = () => {
      if (
        isFloatDragging &&
        shouldSnapToRightDock(
          floatX,
          floatW,
          window.innerWidth,
          FLOAT_RIGHT_SNAP_THRESHOLD_PX,
        )
      ) {
        sidebarState = "normal";
      }
      isFloatDragging = false;
      isFloatResizing = null;
      showRightSnapShadow = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };

    document.body.style.userSelect = "none";
    if (isFloatResizing === "e" || isFloatResizing === "w")
      document.body.style.cursor = "ew-resize";
    else if (isFloatResizing === "s") document.body.style.cursor = "ns-resize";
    else if (isFloatResizing === "se")
      document.body.style.cursor = "nwse-resize";
    else document.body.style.cursor = "grabbing";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", handleMouseUp);
      showRightSnapShadow = false;
      document.body.style.cursor = "default";
      document.body.style.userSelect = "";
    };
  });

  onMount(() => {
    const updateViewportFlag = () => {
      isMobileViewport = window.matchMedia("(max-width: 768px)").matches;
      if (sidebarState === "normal") {
        // 侧边模式下 resize 视口时，重置到默认 25:75
        hasManualSidebarResize = false;
        syncSidebarWidthToDefaultRatio();
      }
    };
    updateViewportFlag();
    window.addEventListener("resize", updateViewportFlag);
    return () => {
      window.removeEventListener("resize", updateViewportFlag);
    };
  });

  $effect(() => {
    if (!previewImageSrc) {
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeImagePreview();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  });
</script>

<section class="pep-cloud-deploy-flow" class:is-sidebar-resizing={isDragging}>
  {#if !showMobileFlow}
    <Navbar
      {navbar}
      {isDeploying}
      onEndDeployment={() => (showEndModal = true)}
    />
  {/if}

  <div
    class="workspace"
    class:is-mobile-only={showMobileFlow}
    bind:this={workspaceEl}
  >
    {#if showMobileFlow && mobile}
      <MobileFlow
        {mobile}
        texts={sidebar.texts}
        stepCheckedIcon={sidebar.icons?.stepCheckedIcon}
        domainWhitelistPatterns={iframePages.domainWhitelistPatterns}
        onOpenExternal={handleOpenExternal}
        onPreviewImage={handlePreviewImage}
      />
    {:else}
      <div class="main-wrap" class:is-hidden={sidebarState === "fullscreen"}>
        {#if isDeploymentFinished && endDeployment}
          <DeploymentFinished
            {endDeployment}
            {backgroundImage}
            onRedeploy={handleRedeploy}
            onOpenExternal={handleOpenExternal}
          />
        {:else if isDeploying}
          <PseudoBrowser
            {externalUrl}
            {iframePages}
            {backgroundImage}
            isBrowserFullscreen={sidebarState === "collapsed" ||
              sidebarState === "floating"}
            onSwitchToSideMode={handleBrowserSwitchToSideMode}
            onFullscreen={openFloating}
            onClose={minimizeBrowserAndShowSidebar}
          />
        {:else}
          <MainPanel
            {mainContent}
            {backgroundImage}
            onDeploy={handleDeployStart}
            onOpenExternal={handleOpenExternal}
          />
        {/if}
      </div>

      {#if sidebarState !== "floating"}
        <div
          class="sidebar-wrap"
          class:is-fullscreen={sidebarState === "fullscreen"}
          class:is-collapsed={sidebarState === "collapsed"}
          class:is-resizing={isDragging}
          style={sidebarState === "normal"
            ? `width:${sidebarWidth}px;min-width:25vw`
            : undefined}
        >
          <SidebarPanel
            {sidebar}
            onOpenExternal={handleOpenExternal}
            onPreviewImage={handlePreviewImage}
            onFloat={openFloating}
            onRestoreSide={restoreSidebarSideModeWithDefaultRatio}
            onCollapse={() => (sidebarState = "collapsed")}
            isFullscreen={sidebarState === "fullscreen"}
          />
          {#if sidebarState === "normal"}
            <div
              class="sidebar-resize-hover-zone"
              aria-hidden="true"
              onmousedown={handleResizeStart}
            ></div>
            <button
              type="button"
              class="sidebar-resize-handle"
              class:is-visible={isDragging}
              aria-label="调整主区与侧栏宽度"
              title="拖拽调整侧栏宽度"
              onmousedown={handleResizeStart}
            >
              {#if sidebarResizeIcon}
                <img src={sidebarResizeIcon} alt="" />
              {:else}
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none">
                  <path
                    d="M9 6v12"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                  <path
                    d="M15 6v12"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                  />
                </svg>
              {/if}
            </button>
          {/if}
        </div>
      {/if}

      {#if sidebarState === "collapsed"}
        <Tooltip content={sidebar?.texts?.miniIconHoverText ?? ""}>
          <button
            class="restore-btn restore-btn--right"
            type="button"
            aria-label="恢复侧边栏"
            onclick={restoreSidebarSideModeWithDefaultRatio}
          >
            {#if sidebarMinimizeIcon}
              <img src={sidebarMinimizeIcon} alt="" />
            {:else}
              &lt;
            {/if}
          </button>
        </Tooltip>
      {/if}

      {#if sidebarState === "floating"}
        <div
          class="float-panel"
          style="left:{floatX}px; top:{floatY}px; width:{floatW}px; height:{floatH}px;"
        >
          <div
            class="float-panel__drag-handle"
            role="button"
            tabindex="0"
            aria-label="拖动悬浮面板"
            onmousedown={handleFloatDragStart}
            onkeydown={() => {}}
          ></div>
          <SidebarPanel
            {sidebar}
            onOpenExternal={handleOpenExternal}
            onPreviewImage={handlePreviewImage}
            onFloat={restoreSidebarSideModeWithDefaultRatio}
            onRestoreSide={restoreSidebarSideModeWithDefaultRatio}
            onCollapse={() => (sidebarState = "collapsed")}
            isFloating={true}
          />
          <button
            type="button"
            class="float-panel__resize float-panel__resize--w"
            aria-label="调整左侧宽度"
            onmousedown={(e) => handleFloatResizeStart(e, "w")}
          ></button>
          <button
            type="button"
            class="float-panel__resize float-panel__resize--e"
            aria-label="调整宽度"
            onmousedown={(e) => handleFloatResizeStart(e, "e")}
          ></button>
          <button
            type="button"
            class="float-panel__resize float-panel__resize--s"
            aria-label="调整高度"
            onmousedown={(e) => handleFloatResizeStart(e, "s")}
          ></button>
          <button
            type="button"
            class="float-panel__resize float-panel__resize--se"
            aria-label="调整大小"
            onmousedown={(e) => handleFloatResizeStart(e, "se")}
          ></button>
        </div>
      {/if}
    {/if}
  </div>
</section>

{#if previewImageSrc}
  <div
    class="pep-cloud-deploy-flow-image-preview-mask"
    role="dialog"
    aria-modal="true"
    aria-label="图片预览"
    tabindex="-1"
  >
    <button
      type="button"
      class="pep-cloud-deploy-flow-image-preview-backdrop"
      aria-label="关闭图片预览"
      onclick={closeImagePreview}
    ></button>
    <button
      type="button"
      class="pep-cloud-deploy-flow-image-preview-close"
      aria-label="关闭图片预览"
      onclick={closeImagePreview}
    >
      <img src={previewCloseIconSrc} alt="" />
    </button>
    <img
      class="pep-cloud-deploy-flow-image-preview-image"
      src={previewImageSrc}
      alt={previewImageAlt}
    />
  </div>
{/if}

<div
  class="right-snap-shadow"
  class:is-visible={sidebarState === "floating" && showRightSnapShadow}
  aria-hidden="true"
></div>

{#if showEndModal && endDeployment}
  <EndDeploymentModal
    {endDeployment}
    onCancel={() => (showEndModal = false)}
    onConfirm={handleEndConfirm}
  />
{/if}

<style>
  .pep-cloud-deploy-flow {
    width: 100%;
    background: var(--bg-secondary);
    color: #1f2329;
    font-family: Arial, sans-serif;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  :global(.pep-cloud-deploy-flow.is-sidebar-resizing iframe) {
    pointer-events: none !important;
  }

  :global(.pep-cloud-deploy-flow) ::-webkit-scrollbar {
    width: 2px;
    height: 2px;
    background: transparent;
  }

  :global(.pep-cloud-deploy-flow) ::-webkit-scrollbar-track {
    background: transparent;
  }

  :global(.pep-cloud-deploy-flow) ::-webkit-scrollbar-thumb {
    background-clip: border-box;
    border-radius: 999px;
    background-color: rgba(255, 255, 255, 0.15);
  }

  :global(.pep-cloud-deploy-flow) ::-webkit-scrollbar-thumb :hover {
    background-color: #808080;
  }

  .workspace {
    display: flex;
    align-items: stretch;
    gap: 0;
    padding: 0;
    box-sizing: border-box;
    position: relative;
    flex: 1;
  }

  .sidebar-wrap {
    width: 420px;
    flex-shrink: 0;
    position: relative;
    transition:
      width 0.25s ease,
      opacity 0.25s ease;
    box-shadow: -1px 0px 4px 0 rgba(0, 0, 0, 0.08);
    z-index: 1;
    position: relative;
  }

  .sidebar-wrap.is-resizing {
    transition: opacity 0.25s ease;
  }

  .sidebar-wrap:not(.is-fullscreen):not(.is-collapsed) {
    min-width: 25vw;
  }

  .sidebar-wrap.is-fullscreen {
    width: 100%;
  }

  .sidebar-wrap.is-collapsed {
    width: 0;
    opacity: 0;
    overflow: hidden;
  }

  .main-wrap {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: 1280px) {
    .sidebar-wrap {
      width: 360px;
    }
  }

  .sidebar-resize-handle {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 12px;
    height: 24px;
    border: none;
    margin-left: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    color: #4e5969;
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.15s ease,
      color 0.15s ease;
    cursor: col-resize;
    z-index: 15;
  }

  .sidebar-resize-hover-zone {
    position: absolute;
    left: 0;
    top: 0;
    width: 12px;
    height: 100%;
    z-index: 14;
    cursor: col-resize;
    box-sizing: border-box;
  }

  .sidebar-resize-hover-zone:hover + .sidebar-resize-handle,
  .sidebar-resize-handle.is-visible,
  .sidebar-resize-handle:hover,
  .sidebar-resize-handle:focus-visible {
    opacity: 1;
    pointer-events: auto;
  }

  .sidebar-resize-handle svg,
  .sidebar-resize-handle img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .main-wrap.is-hidden {
    display: none;
  }

  .restore-btn {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
    z-index: 30;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  }

  .restore-btn--right {
    right: 24px;
  }

  .restore-btn img {
    width: 16px;
    height: 16px;
  }

  .float-panel {
    position: absolute;
    z-index: 50;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 280px;
    min-height: 200px;
  }

  .float-panel__drag-handle {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 16px;
    cursor: grab;
    z-index: 10;
  }

  .float-panel__drag-handle:active {
    cursor: grabbing;
  }

  .float-panel__resize {
    position: absolute;
    z-index: 20;
    border: none;
    background: transparent;
    padding: 0;
  }

  .float-panel__resize--e {
    top: 0;
    right: 0;
    width: 5px;
    bottom: 10px;
    cursor: ew-resize;
  }

  .float-panel__resize--w {
    top: 0;
    left: 0;
    width: 5px;
    bottom: 10px;
    cursor: ew-resize;
  }

  .float-panel__resize--s {
    bottom: 0;
    left: 0;
    right: 10px;
    height: 5px;
    cursor: ns-resize;
  }

  .float-panel__resize--se {
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    cursor: nwse-resize;
  }

  .right-snap-shadow {
    position: fixed;
    right: 0;
    top: 0;
    width: 20px;
    height: 100%;
    background-image: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 0.1)
    );
    opacity: 0;
    transition: opacity 0.5s;
    pointer-events: none;
    z-index: 40;
  }

  .right-snap-shadow.is-visible {
    opacity: 1;
  }

  @media (max-width: 768px) {
    .workspace {
      flex-direction: column;
      min-height: auto;
    }

    .workspace.is-mobile-only {
      min-height: 100vh;
      height: 100vh;
      overflow: hidden;
    }

    .sidebar-resize-handle {
      display: none;
    }

    .sidebar-wrap,
    .sidebar-wrap.is-fullscreen,
    .sidebar-wrap.is-collapsed {
      width: 100%;
      opacity: 1;
      overflow: visible;
    }

    .main-wrap.is-hidden {
      display: block;
    }
  }
</style>
