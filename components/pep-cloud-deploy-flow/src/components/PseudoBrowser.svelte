<script lang="ts">
  import { injectExternalTab } from "../utils/phase2";
  import type { BrowserExternalUrl, BrowserTab } from "../utils/phase2";
  import type { IframePagesConfig } from "../types";
  import QuickLinkCard from "./QuickLinkCard.svelte";

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
  let frameVersion = $state(0);
  let frameLoading = $state(false);

  $effect(() => {
    if (externalUrl && externalUrl.timestamp !== handledTimestamp) {
      const normalized = normalizeUrl(externalUrl.url);
      if (normalized && isUrlAllowed(normalized)) {
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

  let frameInstanceKey = $derived(
    activeTab.url ? `${activeTab.id}:${activeTab.url}:${frameVersion}` : "",
  );

  $effect(() => {
    if (!frameInstanceKey) {
      frameLoading = false;
      return;
    }
    void frameInstanceKey;
    frameLoading = true;
  });

  function selectTab(id: string): void {
    tabs = tabs.map((item) => ({ ...item, active: item.id === id }));
  }

  function addTab(): void {
    const id = String(Date.now());
    tabs = tabs
      .map((item) => ({ ...item, active: false }))
      .concat([{ id, title: defaultTabTitle, url: "", active: true }]);
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

  function toTabTitle(url: string): string {
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

  function openUrlFromShortcut(rawUrl: string): void {
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
        ? { ...item, url: nextUrl, title: toTabTitle(nextUrl) }
        : item,
    );
    frameVersion += 1;
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
        ? { ...item, url: nextUrl, title: toTabTitle(nextUrl) }
        : item,
    );
    frameVersion += 1;
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
    mountedVer: number,
  ): void {
    if (
      activeTab.id !== mountedTabId ||
      activeTab.url !== mountedTabUrl ||
      frameVersion !== mountedVer
    ) {
      return;
    }
    frameLoading = false;
    const iframe = event.currentTarget as HTMLIFrameElement;
    const docTitle = tryReadIframeDocumentTitle(iframe);
    if (!docTitle) {
      return;
    }
    tabs = tabs.map((item) =>
      item.id === mountedTabId && item.url === mountedTabUrl
        ? { ...item, title: docTitle }
        : item,
    );
  }

  $effect(() => {
    addressInput = activeTab.url || "";
  });
</script>

<section class="pep-cloud-deploy-flow-browser">
  <div class="pep-cloud-deploy-flow-browser__tabs-bar">
    <div class="pep-cloud-deploy-flow-browser__tabs">
      {#each tabs as tab}
        <div
          class:active={tab.active}
          class="pep-cloud-deploy-flow-browser__tab-item"
          role="button"
          tabindex="0"
          onclick={() => selectTab(tab.id)}
          onkeydown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              selectTab(tab.id);
            }
          }}
        >
          <span class="pep-cloud-deploy-flow-browser__tab-title"
            >{tab.title}</span
          >
          <button
            type="button"
            class="pep-cloud-deploy-flow-browser__close"
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
      <button
        type="button"
        class="pep-cloud-deploy-flow-browser__add-tab"
        onclick={addTab}
        aria-label="新建标签页"
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
    </div>

    <div class="pep-cloud-deploy-flow-browser__tabs-spacer"></div>
    {#if isBrowserFullscreen}
      <button
        type="button"
        class="pep-cloud-deploy-flow-browser__tool-btn"
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
    {#if activeTab.url}
      {#key frameInstanceKey}
        {@const mountedTabId = activeTab.id}
        {@const mountedTabUrl = activeTab.url}
        {@const mountedVer = frameVersion}
        <div class="pep-cloud-deploy-flow-browser__frame-host">
          {#if frameLoading}
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
            src={activeTab.url}
            title={activeTab.title}
            class="pep-cloud-deploy-flow-browser__frame-iframe"
            onload={(e) =>
              applyLoadedIframeTitle(
                e,
                mountedTabId,
                mountedTabUrl,
                mountedVer,
              )}
          ></iframe>
        </div>
      {/key}
    {:else}
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
                  onClick={() => openUrlFromShortcut(item.url)}
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
    gap: 4px;
    padding: 4px 4px 0;
    min-height: 32px;
    background: #d3e3fd;
    border-bottom: 1px solid #fff;
  }

  .pep-cloud-deploy-flow-browser__tabs {
    display: flex;
    gap: 2px;
    flex-shrink: 0;
    overflow: visible;
    align-items: flex-end;
  }

  .pep-cloud-deploy-flow-browser__tabs-spacer {
    flex: 1;
  }

  .pep-cloud-deploy-flow-browser__tab-item {
    border: none;
    border-radius: 8px 8px 0 0;
    background: transparent;
    color: #4e5969;
    padding: 0 12px;
    height: 32px;
    min-width: 124px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    cursor: pointer;
    font-size: 12px;
    line-height: 16px;
    max-width: 220px;
    position: relative;
    transition: background-color 0.15s;
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
    opacity: 0;
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

  .pep-cloud-deploy-flow-browser__tab-item:hover
    .pep-cloud-deploy-flow-browser__close {
    opacity: 1;
  }

  .pep-cloud-deploy-flow-browser__close:hover {
    background: #f0f0f0;
    color: #1f2329;
  }

  .pep-cloud-deploy-flow-browser__tab-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pep-cloud-deploy-flow-browser__add-tab,
  .pep-cloud-deploy-flow-browser__tool-btn {
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
    margin-left: 12px;
  }

  .pep-cloud-deploy-flow-browser__tool-btn {
    width: 32px;
    height: 32px;
    min-width: 32px;
    padding: 0;
    border-radius: 0;
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

  .pep-cloud-deploy-flow-browser__shortcut-group {
    width: min(100%, 760px);
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

  @media (max-width: 980px) {
    .pep-cloud-deploy-flow-browser__shortcut-list {
      grid-template-columns: 1fr;
    }
  }

  /* shortcut card styles moved to QuickLinkCard.svelte */
</style>
