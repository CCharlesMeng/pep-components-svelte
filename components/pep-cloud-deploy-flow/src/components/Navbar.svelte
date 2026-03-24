<script lang="ts">
  import type { NavbarConfig } from "../types";

  interface Props {
    navbar: NavbarConfig;
    isDeploying?: boolean;
    onEndDeployment?: () => void;
  }

  let { navbar, isDeploying = false, onEndDeployment }: Props = $props();

  const ICONS: Record<string, string> = {
    monitor: `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="2" width="14" height="10" rx="1.2" stroke="currentColor" stroke-width="1.3"/>
            <path d="M5.5 14h5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <path d="M8 12v2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
        </svg>`,
    "log-out": `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10.667 11.333 14 8l-3.333-3.333" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 8H6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`,
    "stop-circle": `<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.3"/>
            <rect x="5.5" y="5.5" width="5" height="5" rx="0.5" fill="currentColor"/>
        </svg>`,
  };

  function getIcon(name: string): string {
    return ICONS[name?.toLowerCase()] ?? "";
  }

  function isIconUrl(s: string | undefined): boolean {
    return typeof s === "string" && /^https?:\/\//i.test(s.trim());
  }
</script>

<header class="pep-cloud-deploy-flow-navbar">
  {#if navbar.logo.url}
    <a
      href={navbar.logo.url}
      class="pep-cloud-deploy-flow-navbar__logo"
      target="_self"
      rel="noreferrer"
    >
      <img src={navbar.logo.img} alt="logo" />
    </a>
  {:else}
    <div class="pep-cloud-deploy-flow-navbar__logo">
      <img src={navbar.logo.img} alt="logo" />
    </div>
  {/if}

  <nav class="pep-cloud-deploy-flow-navbar__breadcrumbs">
    {#each navbar.breadcrumbs as breadcrumb, idx}
      <a
        href={breadcrumb.url ?? "#"}
        class:bold={idx === navbar.breadcrumbs.length - 1}
        target="_self"
        rel="noreferrer"
      >
        {breadcrumb.text}
      </a>
      {#if idx < navbar.breadcrumbs.length - 1}
        <span class="pep-cloud-deploy-flow-navbar__sep">/</span>
      {/if}
    {/each}
  </nav>

  <div class="pep-cloud-deploy-flow-navbar__actions">
    {#each navbar.rightActions as action}
      <a
        href={action.url ?? "#"}
        target="_self"
        rel="noreferrer"
        class="pep-cloud-deploy-flow-navbar__action-link"
      >
        {#if action.icon}
          <span class="pep-cloud-deploy-flow-navbar__btn-icon">
            {#if isIconUrl(action.icon)}
              <img src={action.icon} alt="" />
            {:else if getIcon(action.icon)}
              {@html getIcon(action.icon)}
            {/if}
          </span>
        {/if}
        {action.text}
      </a>
    {/each}

    {#if isDeploying && navbar.endDeployment}
      <span class="pep-cloud-deploy-flow-navbar__divider"></span>
      <button
        type="button"
        class="pep-cloud-deploy-flow-navbar__action-link pep-cloud-deploy-flow-navbar__end-btn"
        onclick={onEndDeployment}
      >
        {#if navbar.endDeployment.icon}
          <span class="pep-cloud-deploy-flow-navbar__btn-icon">
            {#if isIconUrl(navbar.endDeployment.icon)}
              <img src={navbar.endDeployment.icon} alt="" />
            {:else if getIcon(navbar.endDeployment.icon)}
              {@html getIcon(navbar.endDeployment.icon)}
            {/if}
          </span>
        {/if}
        {navbar.endDeployment.buttonText}
      </button>
    {/if}
  </div>
</header>

<style>
  .pep-cloud-deploy-flow-navbar {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 16px;
    align-items: center;
    min-height: 32px;
    box-sizing: border-box;
    padding: 0 var(--primitive-space-4);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--primitive-gray-200);
    box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.08);
    z-index: 2;
    position: relative;
  }
  :global(.pep-cloud-deploy-flow-navbar a:visited) {
    color: #191919;
  }

  .pep-cloud-deploy-flow-navbar__logo {
    display: flex;
    align-items: center;
    gap: var(--primitive-space-2);
    font-weight: 700;
    color: var(--text-primary);
    font-size: 18px;
  }

  a.pep-cloud-deploy-flow-navbar__logo {
    text-decoration: none;
    color: inherit;
  }

  .pep-cloud-deploy-flow-navbar__logo img {
    width: 94px;
    height: 28px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-navbar__breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    font-size: 14px;
    line-height: 22px;
  }

  .pep-cloud-deploy-flow-navbar__breadcrumbs a {
    color: #191919;
    text-decoration: none;
  }

  .pep-cloud-deploy-flow-navbar__breadcrumbs a.bold {
    font-weight: 700;
    color: #191919;
  }

  .pep-cloud-deploy-flow-navbar__sep {
    color: #808080;
    width: 16px;
    display: flex;
    justify-content: center;
  }

  .pep-cloud-deploy-flow-navbar__actions {
    justify-self: end;
    display: flex;
    align-items: center;
    gap: 8px;
    line-height: 22px;
    font-size: 14px;
    color: #191919;
  }

  .pep-cloud-deploy-flow-navbar__action-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-decoration: none;
    padding: 5px 0px;
  }

  .pep-cloud-deploy-flow-navbar__divider {
    width: 1px;
    height: 16px;
    background: #f0f0f0;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-navbar__end-btn {
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .pep-cloud-deploy-flow-navbar__btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }

  .pep-cloud-deploy-flow-navbar__btn-icon :global(svg),
  .pep-cloud-deploy-flow-navbar__btn-icon img {
    width: 16px;
    height: 16px;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    .pep-cloud-deploy-flow-navbar {
      grid-template-columns: 1fr;
      row-gap: 8px;
      padding: var(--primitive-space-2) var(--primitive-space-4);
    }

    .pep-cloud-deploy-flow-navbar__actions {
      justify-self: start;
    }
  }
</style>
