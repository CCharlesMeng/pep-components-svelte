<script lang="ts">
  interface Props {
    icon: string;
    label: string;
    onClick?: () => void;
    href?: string;
  }

  let { icon, label, onClick, href }: Props = $props();
</script>

{#if href}
  <a
    class="pep-cloud-deploy-flow-quick-link-card"
    {href}
    target="_blank"
    rel="noreferrer"
    onclick={(event) => {
      if (onClick) {
        event.preventDefault();
        onClick();
      }
    }}
  >
    <span class="pep-cloud-deploy-flow-quick-link-card__icon">
      <img src={icon} alt={label} />
    </span>
    <span class="pep-cloud-deploy-flow-quick-link-card__label">{label}</span>
  </a>
{:else}
  <button
    type="button"
    class="pep-cloud-deploy-flow-quick-link-card"
    onclick={onClick}
  >
    <span class="pep-cloud-deploy-flow-quick-link-card__icon">
      <img src={icon} alt={label} />
    </span>
    <span class="pep-cloud-deploy-flow-quick-link-card__label">{label}</span>
  </button>
{/if}

<style>
  .pep-cloud-deploy-flow-quick-link-card {
    width: 260px;
    min-height: 72px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 8px;
    background: #fff;
    color: #1f2937;
    text-decoration: none;
    padding: 16px;
    cursor: pointer;
    text-align: left;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    box-sizing: border-box;
  }

  .pep-cloud-deploy-flow-quick-link-card:hover {
    border-color: #b8d3ff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .pep-cloud-deploy-flow-quick-link-card__icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #edf3ff;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-quick-link-card__icon img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-quick-link-card__label {
    font-size: 14px;
    line-height: 22px;
    color: #191919;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
</style>
