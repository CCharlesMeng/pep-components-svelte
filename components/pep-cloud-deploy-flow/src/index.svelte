<script lang="ts">
    import DeploymentFinished from "./components/DeploymentFinished.svelte";
    import EndDeploymentModal from "./components/EndDeploymentModal.svelte";
    import MainPanel from "./components/MainPanel.svelte";
    import Navbar from "./components/Navbar.svelte";
    import PseudoBrowser from "./components/PseudoBrowser.svelte";
    import SidebarPanel from "./components/SidebarPanel.svelte";
    import type { PepCloudDeployFlowProps } from "./types";
    import type { BrowserExternalUrl } from "./utils/phase2";

    let data: PepCloudDeployFlowProps = $props();
    let navbar = $derived(data.navbar);
    let sidebar = $derived(data.sidebar);
    let mainContent = $derived(data.mainContent);
    let backgroundImage = $derived(data.backgroundImage);
    let sidebarMinimizeIcon = $derived(data.commonConfig?.icons?.sidebarMinimizeIcon);

    let isDeploying = $state(false);
    let isDeploymentFinished = $state(false);
    let showEndModal = $state(false);
    let externalUrl = $state<BrowserExternalUrl | null>(null);
    let sidebarState = $state<
        "normal" | "fullscreen" | "collapsed" | "floating"
    >("normal");
    let sidebarWidth = $state(420);
    let isDragging = $state(false);
    let workspaceEl = $state<HTMLDivElement | null>(null);

    // 悬浮面板状态
    let floatX = $state(16);
    let floatY = $state(16);
    let floatW = $state(400);
    let floatH = $state(560);
    let isFloatDragging = $state(false);
    let isFloatResizing = $state<string | null>(null); // 'e' | 's' | 'se'
    let showLeftSnapShadow = $state(false);
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
        // 从结束页/引导页点击卡片时，需先退出“结束部署态”再进入伪浏览器态
        isDeploymentFinished = false;
        isDeploying = true;
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

    function handleRedeploy(): void {
        isDeploymentFinished = false;
        isDeploying = false;
        externalUrl = null;
    }

    function handleBrowserSwitchToSideMode(): void {
        sidebarState = "normal";
    }

    function handleResizeStart(): void {
        if (sidebarState !== "normal") {
            return;
        }
        isDragging = true;
    }

    $effect(() => {
        if (!isDragging) {
            return;
        }

        const handleMouseMove = (event: MouseEvent) => {
            if (sidebarState !== "normal") {
                return;
            }
            const left = workspaceEl?.getBoundingClientRect().left ?? 0;
            const minWidth = window.innerWidth * 0.25;
            const nextWidth = Math.min(
                640,
                Math.max(minWidth, event.clientX - left),
            );
            sidebarWidth = nextWidth;
        };

        const handleMouseUp = () => {
            isDragging = false;
            document.body.style.cursor = "default";
            document.body.style.userSelect = "";
        };

        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
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

            if (isFloatDragging) {
                const nextX = Math.max(0, floatDragStartPosX + dx);
                floatX = nextX;
                floatY = Math.max(0, floatDragStartPosY + dy);
                showLeftSnapShadow = nextX <= 24;
            } else if (isFloatResizing) {
                if (isFloatResizing.includes("e")) {
                    floatW = Math.max(280, floatResizeStartW + dx);
                }
                if (isFloatResizing.includes("s")) {
                    floatH = Math.max(200, floatResizeStartH + dy);
                }
            }
        };

        const handleMouseUp = () => {
            if (isFloatDragging && floatX <= 24) {
                sidebarState = "normal";
            }
            isFloatDragging = false;
            isFloatResizing = null;
            showLeftSnapShadow = false;
            document.body.style.cursor = "default";
            document.body.style.userSelect = "";
        };

        document.body.style.userSelect = "none";
        if (isFloatResizing === "e") document.body.style.cursor = "ew-resize";
        else if (isFloatResizing === "s")
            document.body.style.cursor = "ns-resize";
        else if (isFloatResizing === "se")
            document.body.style.cursor = "nwse-resize";
        else document.body.style.cursor = "grabbing";

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            showLeftSnapShadow = false;
            document.body.style.cursor = "default";
            document.body.style.userSelect = "";
        };
    });
</script>

<section class="pep-cloud-deploy-flow">
    <Navbar
        {navbar}
        {isDeploying}
        onEndDeployment={() => (showEndModal = true)}
    />

    <div class="workspace" bind:this={workspaceEl}>
        {#if sidebarState !== "floating"}
            <div
                class="sidebar-wrap"
                class:is-fullscreen={sidebarState === "fullscreen"}
                class:is-collapsed={sidebarState === "collapsed"}
                style={sidebarState === "normal"
                    ? `width:${sidebarWidth}px;min-width:25vw`
                    : undefined}
            >
                <SidebarPanel
                    {sidebar}
                    onOpenExternal={handleOpenExternal}
                    onFloat={() => (sidebarState = "floating")}
                    onFullscreen={() => (sidebarState = "fullscreen")}
                    onRestoreSide={() => (sidebarState = "normal")}
                    onCollapse={() => (sidebarState = "collapsed")}
                    isFullscreen={sidebarState === "fullscreen"}
                />
            </div>
        {/if}

        {#if sidebarState === "normal"}
            <button
                type="button"
                class="resize-handle"
                aria-label="调整左右面板宽度"
                onmousedown={handleResizeStart}
            ></button>
        {/if}

        <div class="main-wrap" class:is-hidden={sidebarState === "fullscreen"}>
            {#if isDeploymentFinished && navbar.endDeployment}
                <DeploymentFinished
                    endDeployment={navbar.endDeployment}
                    {backgroundImage}
                    onRedeploy={handleRedeploy}
                    onOpenExternal={handleOpenExternal}
                />
            {:else if isDeploying}
                <PseudoBrowser
                    {externalUrl}
                    iframePages={data.iframePages}
                    {backgroundImage}
                    isBrowserFullscreen={sidebarState === "collapsed"}
                    onSwitchToSideMode={handleBrowserSwitchToSideMode}
                    onCollapse={() => (sidebarState = "fullscreen")}
                    onFullscreen={() => (sidebarState = "collapsed")}
                    onClose={() => (isDeploying = false)}
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

        {#if sidebarState === "collapsed"}
            <button
                class="restore-btn restore-btn--left"
                type="button"
                aria-label="恢复侧边栏"
                onclick={() => (sidebarState = "normal")}
            >
                {#if sidebarMinimizeIcon}
                    <img src={sidebarMinimizeIcon} alt="" />
                {:else}
                    &gt;
                {/if}
            </button>
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
                    onFloat={() => (sidebarState = "normal")}
                    onFullscreen={() => (sidebarState = "fullscreen")}
                    onRestoreSide={() => (sidebarState = "normal")}
                    onCollapse={() => (sidebarState = "collapsed")}
                    isFloating={true}
                />
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
    </div>
</section>

<div
    class="left-snap-shadow"
    class:is-visible={sidebarState === "floating" && showLeftSnapShadow}
    aria-hidden="true"
></div>

{#if showEndModal && navbar.endDeployment}
    <EndDeploymentModal
        endDeployment={navbar.endDeployment}
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
        background-color: rgba(255,255,255,.15);
    }

    :global(.pep-cloud-deploy-flow) ::-webkit-scrollbar-thumb :hover{
        background-color: #808080;
    }

    .workspace {
        display: flex;
        align-items: stretch;
        gap: 0;
        padding: 0;
        box-sizing: border-box;
        min-height: calc(100vh - 48px);
        position: relative;
    }

    .sidebar-wrap {
        width: 420px;
        flex-shrink: 0;
        transition:
            width 0.25s ease,
            opacity 0.25s ease;
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
        border-left: 1px solid #e5e6eb;
    }

    .resize-handle {
        width: 1px;
        margin-left: -1px;
        cursor: col-resize;
        background: transparent;
        z-index: 10;
        border: none;
        padding:0 2px;
    }

    .resize-handle:hover,
    .resize-handle:active {
        cursor: col-resize;
    }

    .main-wrap.is-hidden {
        display: none;
    }

    .restore-btn {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border: none;
        background: transparent;
        color: #1f2329;
        cursor: pointer;
        z-index: 30;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .restore-btn--left {
        left: 16px;
        border-radius: 0;
    }

    .restore-btn img {
        width: 24px;
        height: 24px;
        filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.15));
        display: block;
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
        height: 4px;
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

    .left-snap-shadow {
        position: fixed;
        left: 0;
        top: 0;
        width: 20px;
        height: 100%;
        background-image: linear-gradient(
            270deg,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.1)
        );
        opacity: 0;
        transition: opacity 0.5s;
        pointer-events: none;
        z-index: 40;
    }

    .left-snap-shadow.is-visible {
        opacity: 1;
    }

    @media (max-width: 1280px) {
        .sidebar-wrap {
            width: 360px;
        }
    }

    @media (max-width: 980px) {
        .workspace {
            flex-direction: column;
            min-height: auto;
        }

        .resize-handle {
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

    :global(.pep-cloud-deploy-flow .rich-text a) {
        color: #165dff;
        text-decoration: none;
    }

    :global(.pep-cloud-deploy-flow .rich-text a:hover) {
        text-decoration: underline;
    }

    :global(.pep-cloud-deploy-flow .rich-text ol) {
        margin: 0;
        padding-left: 20px;
    }

    :global(.pep-cloud-deploy-flow .rich-text li) {
        margin: 8px 0;
    }
</style>
