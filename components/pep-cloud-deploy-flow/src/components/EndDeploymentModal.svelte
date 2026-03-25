<script lang="ts">
  import type { EndDeploymentConfig } from "../types";
  import DeployFlowButton from "./DeployFlowButton.svelte";

  interface Props {
    endDeployment: EndDeploymentConfig;
    onConfirm?: () => void;
    onCancel?: () => void;
  }

  let { endDeployment, onConfirm, onCancel }: Props = $props();
</script>

<div
  class="pep-cloud-deploy-flow-modal-backdrop"
  role="dialog"
  aria-modal="true"
>
  <div class="pep-cloud-deploy-flow-modal">
    <div class="pep-cloud-deploy-flow-modal__head">
      <div class="pep-cloud-deploy-flow-modal__head-title">
        {#if endDeployment.modal.icon}
          <img
            class="pep-cloud-deploy-flow-modal__info-icon"
            src={endDeployment.modal.icon}
            alt=""
          />
        {/if}
        <h3>{endDeployment.modal.title}</h3>
      </div>
    </div>
    <div class="pep-cloud-deploy-flow-modal__body">
      <p>{endDeployment.modal.content}</p>
      <div class="pep-cloud-deploy-flow-modal__actions">
        <DeployFlowButton
          variant="primary"
          class="pep-cloud-deploy-flow-modal__confirm"
          onclick={onConfirm}
        >
          {endDeployment.modal.confirmText}
        </DeployFlowButton>
      </div>
    </div>
    <button
      type="button"
      class="pep-cloud-deploy-flow-modal__close-btn"
      onclick={onCancel}
      aria-label="关闭"
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
</div>

<style>
  .pep-cloud-deploy-flow-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    z-index: 200;
  }

  .pep-cloud-deploy-flow-modal {
    background: #fff;
    width: 100%;
    max-width: 400px;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.28);
    padding: 32px;
    box-sizing: border-box;
    position: relative;
  }

  .pep-cloud-deploy-flow-modal__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .pep-cloud-deploy-flow-modal__head-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pep-cloud-deploy-flow-modal__info-icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    object-fit: contain;
  }

  .pep-cloud-deploy-flow-modal__head h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    line-height: 30px;
    color: #191919;
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
    right: 20px;
    top: 20px;
  }

  .pep-cloud-deploy-flow-modal__close-btn svg {
    width: 24px;
    height: 24px;
  }

  .pep-cloud-deploy-flow-modal__body {
    margin-left: 0;
  }

  .pep-cloud-deploy-flow-modal__body p {
    margin: 0;
    font-size: 14px;
    line-height: 22px;
    letter-spacing: 0;
    color: #595959;
  }

  .pep-cloud-deploy-flow-modal__actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  :global(.pep-cloud-deploy-flow-modal__confirm) {
    min-width: 96px;
    height: 32px;
    padding: 0 24px;
    font-size: 14px;
    line-height: 22px;
    box-sizing: border-box;
  }
</style>
