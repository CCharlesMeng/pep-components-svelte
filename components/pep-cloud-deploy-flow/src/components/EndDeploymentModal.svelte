<script lang="ts">
    import type { EndDeploymentConfig } from '../types';

    interface Props {
        endDeployment: EndDeploymentConfig;
        onConfirm?: () => void;
        onCancel?: () => void;
    }

    let { endDeployment, onConfirm, onCancel }: Props = $props();
</script>

<div class="pep-cloud-deploy-flow-modal-backdrop" role="dialog" aria-modal="true">
    <div class="pep-cloud-deploy-flow-modal">
        <div class="pep-cloud-deploy-flow-modal__head">
            <div class="pep-cloud-deploy-flow-modal__head-title">
                {#if endDeployment.modal.icon}
                    <img class="pep-cloud-deploy-flow-modal__info-icon" src={endDeployment.modal.icon} alt="" />
                {:else}
                    <svg class="pep-cloud-deploy-flow-modal__info-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/>
                        <path d="M12 8v1M12 11v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                {/if}
                <h3>{endDeployment.modal.title}</h3>
            </div>
            <button type="button" class="pep-cloud-deploy-flow-modal__close-btn" onclick={onCancel} aria-label="关闭">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
        <div class="pep-cloud-deploy-flow-modal__body">
            <p>{endDeployment.modal.content}</p>
            <div class="pep-cloud-deploy-flow-modal__actions">
                <button type="button" class="pep-cloud-deploy-flow-modal__confirm" onclick={onConfirm}>
                    {endDeployment.modal.confirmText}
                </button>
            </div>
        </div>
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
        background: #f2f3f5;
        width: 100%;
        max-width: 400px;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 16px 44px rgba(0, 0, 0, 0.28);
        padding: 24px 32px 24px;
        box-sizing: border-box;
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
        color: #2b74e6;
    }

    .pep-cloud-deploy-flow-modal__info-icon {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        object-fit: contain;
    }

    .pep-cloud-deploy-flow-modal__head h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        line-height: 1.5;
        color: #1f2329;
    }

    .pep-cloud-deploy-flow-modal__close-btn {
        border: none;
        background: transparent;
        cursor: pointer;
        color: #86909c;
        padding: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
    }

    .pep-cloud-deploy-flow-modal__close-btn:hover {
        color: #1f2329;
    }

    .pep-cloud-deploy-flow-modal__close-btn svg {
        width: 22px;
        height: 22px;
    }

    .pep-cloud-deploy-flow-modal__body {
        margin-left: 0;
    }

    .pep-cloud-deploy-flow-modal__body p {
        margin: 0;
        font-size: 16px;
        line-height: 1.6;
        letter-spacing: 0;
        color: #4e5969;
    }

    .pep-cloud-deploy-flow-modal__actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 20px;
    }

    .pep-cloud-deploy-flow-modal__confirm {
        border: none;
        border-radius: 999px;
        background: #181b1f;
        color: #fff;
        min-width: 96px;
        height: 32px;
        padding: 0 24px;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
    }

    .pep-cloud-deploy-flow-modal__confirm:hover {
        background: #111315;
    }
</style>
