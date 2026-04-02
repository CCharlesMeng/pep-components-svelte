<script lang="ts">
  type AlertVariant = "warning" | "waring";

  interface Props {
    variant?: AlertVariant;
    title: string;
    description: string;
    visible?: boolean;
    onClose?: () => void;
  }

  let {
    variant = "warning",
    title,
    description,
    visible = false,
    onClose,
  }: Props = $props();

  const WARNING_ICON =
    "https://res-static.hc-cdn.cn/cloudbu-site/intl/zh-cn/pep-component-svelte/pep-cloud-deploy-flow/commonIcon/warningIcon.svg";

  let normalizedVariant = $derived(variant === "waring" ? "warning" : variant);
</script>

{#if visible}
  <div
    class="pep-cloud-deploy-flow-alert-toast"
    class:pep-cloud-deploy-flow-alert-toast--warning={normalizedVariant ===
      "warning"}
    role="alert"
    aria-live="assertive"
  >
    <div class="pep-cloud-deploy-flow-alert-toast__content">
      <div class="pep-cloud-deploy-flow-alert-toast__title-row">
        <img
          class="pep-cloud-deploy-flow-alert-toast__icon"
          src={WARNING_ICON}
          alt=""
        />
        <h4>{title}</h4>
      </div>
      <p>{description}</p>
    </div>
    <button
      type="button"
      class="pep-cloud-deploy-flow-modal__close-btn"
      aria-label="关闭告警"
      onclick={onClose}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 6l12 12M18 6L6 18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </button>
  </div>
{/if}

<style>
  .pep-cloud-deploy-flow-alert-toast {
    position: fixed;
    top: 16px;
    right: 16px;
    width: 400px;
    border-radius: 8px;
    box-sizing: border-box;
    z-index: 11000;
    overflow: hidden;
  }

  .pep-cloud-deploy-flow-alert-toast--warning {
    background: #ffebd1;
  }

  .pep-cloud-deploy-flow-alert-toast__content {
    padding: 16px;
  }

  .pep-cloud-deploy-flow-alert-toast__title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-right: 32px;
  }

  .pep-cloud-deploy-flow-alert-toast__icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  .pep-cloud-deploy-flow-alert-toast__title-row h4 {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
    font-weight: 600;
    color: #191919;
  }

  .pep-cloud-deploy-flow-alert-toast__content p {
    margin: 4px 0 0 24px;
    font-size: 12px;
    line-height: 18px;
    color: #595959;
  }

  .pep-cloud-deploy-flow-modal__close-btn {
    border: none;
    background: transparent;
    cursor: pointer;
    color: #808080;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 2px;
    position: absolute;
    right: 16px;
    top: 16px;
    width: 16px;
    height: 16px;
  }

  .pep-cloud-deploy-flow-modal__close-btn svg {
    width: 24px;
    height: 24px;
  }
</style>
