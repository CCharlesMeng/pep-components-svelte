<script lang="ts">
  import type { MainContentConfig } from "../types";
  import DeployFlowButton from "./DeployFlowButton.svelte";
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
  bi_parent_name="MainPanel"
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
      <DeployFlowButton
        variant="primary"
        class="pep-cloud-deploy-flow-main__deploy-btn"
        disabled={!isAgreementChecked}
        onclick={handleDeployClick}
      >
        {mainContent.action.buttonText}
      </DeployFlowButton>
    </section>

    <label
      class="pep-cloud-deploy-flow-main__agreement-row"
      bi_name="MainPanelAgreementCheckbox"
    >
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
  :global(.pep-cloud-deploy-flow-main__block h3) {
    margin: 0 0 16px 0;
    font-size: 18px;
    line-height: 22px;
    font-weight: 700;
    color: #191919;
  }
  :global(.pep-cloud-deploy-flow-main__block p) {
    margin: 0 0 8px 0;
  }
  .pep-cloud-deploy-flow-main__title {
    font-size: 28px;
    line-height: 1.35;
    font-weight: 700;
    margin: 0;
    margin-bottom: 32px;
    margin-left: -16px;
    color: #191919;
  }

  .pep-cloud-deploy-flow-main__block {
    margin-bottom: 32px;
  }

  .pep-cloud-deploy-flow-main__block h3 {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 700;
    color: #191919;
  }

  .pep-cloud-deploy-flow-main__rich-text {
    color: #191919;
    font-size: 14px;
    line-height: 1.7;
  }

  :global(.pep-cloud-deploy-flow-main .rich-text a) {
    color: #165dff;
    text-decoration: none;
  }

  :global(.pep-cloud-deploy-flow-main .rich-text a:hover) {
    text-decoration: underline;
  }

  :global(.pep-cloud-deploy-flow-main .rich-text ol) {
    margin: 0;
    padding-left: 20px;
  }

  :global(.pep-cloud-deploy-flow-main .rich-text li) {
    font-size: 14px;
    line-height: 22px;
    margin: 8px 0;
  }

  .pep-cloud-deploy-flow-main__products {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: flex-start;
    gap: 16px;
  }

  :global(.pep-cloud-deploy-flow-main__deploy-btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 10px 32px;
    font-size: 14px;
    font-weight: 500;
    line-height: 1.2;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
    margin-bottom: -16px;
  }

  .pep-cloud-deploy-flow-main__agreement-row {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    color: #4b5563;
  }
  .pep-cloud-deploy-flow-main__agreement-row input[type="checkbox"] {
    border: 1px solid #c2c2c2;
    border-radius: 4px;
    width: 16px;
    height: 16px;
    background: #fff;
    cursor: pointer;
    transition: background-color 0.2s;
    margin: 0;
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
