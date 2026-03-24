<script lang="ts">
  import type { MainContentConfig } from "../types";
  import QuickLinkCard from "./QuickLinkCard.svelte";

  interface DeployLaunchPayload {
    url: string;
    title: string;
  }

  interface Props {
    mainContent: MainContentConfig;
    backgroundImage?: string;
    onDeploy?: (payload: DeployLaunchPayload) => void;
    onOpenExternal?: (url: string, title: string) => void;
  }

  let { mainContent, backgroundImage, onDeploy, onOpenExternal }: Props =
    $props();
  let isAgreementChecked = $state(false);

  function handleDeployClick(): void {
    const rawUrl = mainContent.action.url?.trim();
    const launchUrl = rawUrl ?? "";

    onDeploy?.({
      url: launchUrl,
      title: mainContent.action.launchTitle,
    });
  }
</script>

<main
  class="pep-cloud-deploy-flow-main"
  style={backgroundImage
    ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center;`
    : undefined}
>
  <div class="pep-cloud-deploy-flow-main__container">
    <h2 class="pep-cloud-deploy-flow-main__title">{mainContent.title}</h2>

    <section class="pep-cloud-deploy-flow-main__block">
      <div class="pep-cloud-deploy-flow-main__rich-text rich-text">
        {@html mainContent.notice.contentHtml}
      </div>
    </section>

    <section class="pep-cloud-deploy-flow-main__block">
      <h3>{mainContent.cloudProducts.title}</h3>
      <div class="pep-cloud-deploy-flow-main__products">
        {#each mainContent.cloudProducts.products as product}
          <QuickLinkCard
            icon={product.icon}
            label={product.text}
            href={product.url}
            onClick={() => {
              if (onOpenExternal) {
                onOpenExternal(product.url, product.text);
              } else {
                window.open(product.url, "_blank", "noopener,noreferrer");
              }
            }}
          />
        {/each}
      </div>
    </section>

    <section class="pep-cloud-deploy-flow-main__block">
      <div class="pep-cloud-deploy-flow-main__rich-text rich-text">
        {@html mainContent.deploymentEstimate.contentHtml}
      </div>
    </section>

    <section class="pep-cloud-deploy-flow-main__block">
      <button
        type="button"
        disabled={!isAgreementChecked}
        onclick={handleDeployClick}
      >
        {mainContent.action.buttonText}
      </button>
    </section>

    <label class="pep-cloud-deploy-flow-main__agreement-row">
      <input type="checkbox" bind:checked={isAgreementChecked} />
      <span class="pep-cloud-deploy-flow-main__agreement rich-text">
        {@html mainContent.agreement.contentHtml}
      </span>
    </label>
  </div>
</main>

<style>
  .pep-cloud-deploy-flow-main {
    flex: 1;
    overflow-y: auto;
    background: linear-gradient(180deg, #eaf2fa 0%, #f5f7fa 100%);
    min-height: 760px;
    height: 100%;
  }

  .pep-cloud-deploy-flow-main__container {
    margin: 8% 7%;
  }

  .pep-cloud-deploy-flow-main__title {
    font-size: 28px;
    line-height: 1.35;
    font-weight: 700;
    margin: 0;
    margin-bottom: 32px;
    color: #191919;
  }

  .pep-cloud-deploy-flow-main__block {
    margin-bottom: 36px;
  }

  .pep-cloud-deploy-flow-main__block h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 700;
    color: #191919;
  }

  .pep-cloud-deploy-flow-main__rich-text {
    color: #374151;
    font-size: 14px;
    line-height: 1.7;
  }

  .pep-cloud-deploy-flow-main__products {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-start;
    gap: 16px;
  }

  .pep-cloud-deploy-flow-main__block button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 32px;
    border: none;
    border-radius: 999px;
    color: #fff;
    background: #191919;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background-color 0.2s;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  }

  .pep-cloud-deploy-flow-main__block button:hover:not(:disabled) {
    background: #1f2937;
  }

  .pep-cloud-deploy-flow-main__block button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pep-cloud-deploy-flow-main__agreement-row {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #4b5563;
  }

  .pep-cloud-deploy-flow-main__agreement {
    color: #4b5563;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .pep-cloud-deploy-flow-main {
      padding: 20px 16px;
    }

    .pep-cloud-deploy-flow-main__products {
      flex-direction: column;
    }
  }
</style>
