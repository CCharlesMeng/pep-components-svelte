<script lang="ts">
  import type { ResolvedMobileConfig } from "../utils/mobile-config";
  import type { SidebarTexts } from "../types";
  import type { RemoteContentData } from "../utils/phase2";
  import {
    getNextStepIndex,
    getPrevStepIndex,
    shouldHijackLink,
  } from "../utils/phase2";
  import { fetchWithCache } from "../utils/remoteContentCache";
  import { loadRemoteContentForStep } from "../utils/remote-content-loader";
  import { buildRemoteIframeSrcdoc } from "../utils/remoteShadowSandbox";
  import StepStatusDot from "./StepStatusDot.svelte";

  interface Props {
    mobile: ResolvedMobileConfig;
    texts: SidebarTexts;
    stepCheckedIcon?: string;
    onOpenExternal?: (url: string, title: string) => void;
  }

  let { mobile, texts, stepCheckedIcon, onOpenExternal }: Props = $props();

  let activeStepIndex = $state(0);
  let isLoading = $state(false);
  let remoteContentData = $state<RemoteContentData | null>(null);
  let remoteIframeEl = $state<HTMLIFrameElement | null>(null);
  let canPrev = $derived(activeStepIndex > 0);
  let canNext = $derived(activeStepIndex < mobile.steps.length - 1);
  let activeStep = $derived(mobile.steps[activeStepIndex] ?? mobile.steps[0]);
  async function loadRemoteContent(): Promise<void> {
    if (!activeStep) {
      remoteContentData = null;
      return;
    }
    isLoading = true;
    try {
      remoteContentData = await loadRemoteContentForStep({
        tabTitle: mobile.title,
        step: activeStep,
        stepIndex: activeStepIndex,
        texts: {
          messageTemplate: texts.remoteFallbackMessageTemplate,
          linkText: texts.remoteFallbackLinkText,
        },
        fetchText: fetchWithCache,
      });
    } finally {
      isLoading = false;
    }
  }

  function openLinkImage(): void {
    if (typeof window === "undefined") {
      return;
    }
    window.open(mobile.linkImage.url, "_blank", "noopener,noreferrer");
  }

  function handlePrevClick(): void {
    activeStepIndex = getPrevStepIndex(activeStepIndex);
  }

  function handleNextClick(): void {
    activeStepIndex = getNextStepIndex(activeStepIndex, mobile.steps.length);
  }

  $effect(() => {
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
      if (!shouldHijackLink(href)) {
        return;
      }
      event.preventDefault();
      if (onOpenExternal) {
        onOpenExternal(
          href ?? "",
          anchor.innerText || texts.openExternalDefaultTitle,
        );
        return;
      }
      if (typeof window !== "undefined") {
        window.open(href ?? "", "_blank", "noopener,noreferrer");
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
</script>

<section class="pep-cloud-deploy-flow-mobile">
  <header class="pep-cloud-deploy-flow-mobile__header">
    <nav class="pep-cloud-deploy-flow-mobile__breadcrumbs" aria-label="面包屑">
      <span class="pep-cloud-deploy-flow-mobile__logo">
        <img
          src={mobile.navbar.logo.img}
          alt="品牌 Logo"
        />
      </span>
      {#if mobile.navbar.breadcrumbs.length > 0}
        <span class="pep-cloud-deploy-flow-mobile__logo-separator">/</span>
      {/if}
      {#each mobile.navbar.breadcrumbs as breadcrumb, index}
        <a href={breadcrumb.url || "#"}>{breadcrumb.text}</a>
        {#if index < mobile.navbar.breadcrumbs.length - 1}
          <span class="pep-cloud-deploy-flow-mobile__logo-separator">/</span>
        {/if}
      {/each}
    </nav>
  </header>

  <div class="pep-cloud-deploy-flow-mobile__steps-wrap">
    <ol class="pep-cloud-deploy-flow-mobile__steps">
      {#each mobile.steps as step, index (`${step.title}-${index}`)}
        <li class:active={index === activeStepIndex}>
          <button type="button" onclick={() => (activeStepIndex = index)}>
            <StepStatusDot
              completed={index < activeStepIndex}
              {index}
              checkedIcon={stepCheckedIcon}
              dotClass="dot"
              iconClass="pep-cloud-deploy-flow-mobile__step-check"
              fallbackClass="check-fallback"
            />
            <span class="pep-cloud-deploy-flow-mobile__step-label"
              >{step.title}</span
            >
          </button>
          {#if index < mobile.steps.length - 1}
            <span class="line" class:is-completed={index < activeStepIndex}
            ></span>
          {/if}
        </li>
      {/each}
    </ol>
  </div>
  <h1 class="pep-cloud-deploy-flow-mobile__title">{mobile.title}</h1>
  <button
    type="button"
    class="pep-cloud-deploy-flow-mobile__link-image"
    onclick={openLinkImage}
    aria-label="打开相关页面"
  >
    <img src={mobile.linkImage.image} alt={mobile.title} />
  </button>

  <section class="pep-cloud-deploy-flow-mobile__remote-content">
    {#if isLoading}
      <p class="pep-cloud-deploy-flow-mobile__loading">
        {texts.remoteLoadingText}
      </p>
    {:else if remoteContentData}
      <iframe
        class="pep-cloud-deploy-flow-mobile__remote-iframe"
        bind:this={remoteIframeEl}
        title={activeStep?.title ?? "文档内容"}
        scrolling="no"
      ></iframe>
    {/if}
  </section>

  <footer class="pep-cloud-deploy-flow-mobile__footer" class:has-prev={canPrev}>
    {#if canPrev}
      <button
        type="button"
        class="pep-cloud-deploy-flow-mobile__footer-prev"
        onclick={handlePrevClick}
      >
        {mobile.footer.prevText}
      </button>
    {/if}
    {#if canNext}
      <button
        type="button"
        class="pep-cloud-deploy-flow-mobile__footer-next"
        onclick={handleNextClick}
      >
        {mobile.footer.nextText}
      </button>
    {/if}
  </footer>
</section>

<style>
  .pep-cloud-deploy-flow-mobile {
    padding: 12px 16px 8px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .pep-cloud-deploy-flow-mobile__header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 8px;
    row-gap: 2px;
    margin-inline: -4px;
  }

  .pep-cloud-deploy-flow-mobile__logo {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .pep-cloud-deploy-flow-mobile__logo img {
    height: 18px;
  }

  .pep-cloud-deploy-flow-mobile__logo-separator {
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    width: 16px;
    display: flex;
    justify-content: center;
  }

  .pep-cloud-deploy-flow-mobile__breadcrumbs {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    font-size: 12px;
    line-height: 18px;
    color: #86909c;
    min-width: 0;
  }

  .pep-cloud-deploy-flow-mobile__breadcrumbs a {
    color: inherit;
    text-decoration: none;
  }

  .pep-cloud-deploy-flow-mobile__breadcrumbs a:last-child {
    color: #191919;
    font-weight: 600;
  }

  .pep-cloud-deploy-flow-mobile__title {
    margin-top: 8px;
    font-size: 18px;
    line-height: 28px;
    font-weight: 600;
    color: #191919;
  }

  .pep-cloud-deploy-flow-mobile__link-image {
    border: 0;
    background: transparent;
    padding: 0;
    width: 100%;
    cursor: pointer;
  }

  .pep-cloud-deploy-flow-mobile__link-image img {
    width: 100%;
    display: block;
    border-radius: 0;
  }

  .pep-cloud-deploy-flow-mobile__steps-wrap {
    padding: 10px 0 6px;
  }

  .pep-cloud-deploy-flow-mobile__steps {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .pep-cloud-deploy-flow-mobile__steps li {
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 4px;
  }

  .pep-cloud-deploy-flow-mobile__steps li button {
    border: none;
    background: transparent;
    padding: 0;
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    cursor: pointer;
  }

  :global(.pep-cloud-deploy-flow-mobile__steps .dot) {
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 1px solid #c9cdd4;
    background: #fff;
    color: #4e5969;
    font-size: 10px;
    font-weight: 500;
    line-height: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-mobile__step-label {
    max-width: 100%;
    text-align: left;
    font-size: 10px;
    line-height: 18px;
    color: #191919;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  :global(.pep-cloud-deploy-flow-mobile__steps li.active .dot) {
    border-color: #1d2129;
    background: #1d2129;
    color: #fff;
  }

  .pep-cloud-deploy-flow-mobile__steps
    li.active
    .pep-cloud-deploy-flow-mobile__step-label {
    font-weight: 600;
  }

  .pep-cloud-deploy-flow-mobile__steps .line {
    width: 16px;
    height: 1px;
    background: #c4c4c4;
    flex-shrink: 0;
  }

  :global(.pep-cloud-deploy-flow-mobile__steps .check-fallback) {
    font-size: 11px;
    line-height: 1;
  }

  :global(
    .pep-cloud-deploy-flow-mobile__steps
      .pep-cloud-deploy-flow-mobile__step-check
  ) {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-mobile__steps button:disabled {
    cursor: pointer;
  }

  .pep-cloud-deploy-flow-mobile__remote-content {
    min-height: 0;
    flex: 1;
    border: 0;
    border-radius: 0;
    background: transparent;
    padding: 2px 0 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .pep-cloud-deploy-flow-mobile__remote-iframe {
    width: 100%;
    border: none;
    display: block;
    min-height: 120px;
    min-width: 0;
  }

  .pep-cloud-deploy-flow-mobile__loading {
    margin: 0;
    color: #4e5969;
    font-size: 13px;
  }

  .pep-cloud-deploy-flow-mobile__footer {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 0;
    padding: 16px 0 8px 0;
    border-top: 1px solid #f0f0f0;
  }

  .pep-cloud-deploy-flow-mobile__footer button {
    height: 36px;
    min-width: 114px;
    border: 1px solid #191919;
    border-radius: 18px;
    background: #191919;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
    line-height: 22px;
    cursor: pointer;
    padding: 0 18px;
    max-width: 96px;
  }

  .pep-cloud-deploy-flow-mobile__footer
    button.pep-cloud-deploy-flow-mobile__footer-prev {
    border-color: #595959;
    background: #fff;
    color: #191919;
  }

  .pep-cloud-deploy-flow-mobile__footer button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
</style>
