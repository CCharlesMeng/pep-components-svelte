<script lang="ts">
  import type { EndDeploymentConfig } from "../types";
  import QuickLinkCard from "./QuickLinkCard.svelte";

  interface Props {
    endDeployment: EndDeploymentConfig;
    backgroundImage?: string;
    onRedeploy?: () => void;
    onOpenExternal?: (url: string, title: string) => void;
  }

  let { endDeployment, backgroundImage, onRedeploy, onOpenExternal }: Props =
    $props();
  let successPage = $derived(endDeployment.successPage);
</script>

<section
  class="pep-cloud-deploy-flow-success"
  style={backgroundImage
    ? `background-image: url('${backgroundImage}'); background-size: cover; background-position: center;`
    : undefined}
>
  <div class="pep-cloud-deploy-flow-success__main">
    <h2>{successPage.title}</h2>
    {#if successPage.description}
      <p class="pep-cloud-deploy-flow-success__desc">
        {successPage.description}
      </p>
    {/if}

    <div class="pep-cloud-deploy-flow-success__recommendation">
      <ul>
        {#each successPage.items as item}
          <li>
            <QuickLinkCard
              icon={item.icon}
              label={item.text}
              href={item.url}
              onClick={() => {
                if (onOpenExternal) {
                  onOpenExternal(item.url, item.text);
                } else {
                  window.open(item.url, "_blank", "noopener,noreferrer");
                }
              }}
            />
          </li>
        {/each}
      </ul>
    </div>

    <button
      type="button"
      class="pep-cloud-deploy-flow-success__redeploy"
      onclick={onRedeploy}
    >
      {successPage.redeployText}
    </button>
  </div>
</section>

<style>
  .pep-cloud-deploy-flow-success {
    background: #ffffff;
    border: 1px solid #e5e6eb;
    border-radius: 4px;
    min-height: 760px;
    display: flex;
    justify-content: flex-start;
    padding: 24px;
  }

  .pep-cloud-deploy-flow-success__main {
    margin: 8% 7%;
  }

  .pep-cloud-deploy-flow-success h2 {
    margin: 0;
    font-size: 20px;
    line-height: 1.4;
    color: #1f2329;
    font-weight: 700;
  }

  .pep-cloud-deploy-flow-success__desc {
    margin: 14px 0 0;
    font-size: 14px;
    line-height: 1.6;
    color: #4e5969;
  }

  .pep-cloud-deploy-flow-success__recommendation {
    margin-top: 16px;
  }

  .pep-cloud-deploy-flow-success__recommendation ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: start;
  }

  .pep-cloud-deploy-flow-success__recommendation li {
    list-style: none;
  }

  .pep-cloud-deploy-flow-success__redeploy {
    margin-top: 20px;
    border: none;
    border-radius: 999px;
    background: #1f2329;
    color: #fff;
    padding: 10px 20px;
    cursor: pointer;
  }

  @media (max-width: 980px) {
    .pep-cloud-deploy-flow-success__main {
      padding: 32px 0 0 16px;
      max-width: none;
    }

    .pep-cloud-deploy-flow-success__recommendation ul {
      grid-template-columns: 1fr;
    }
  }
</style>
