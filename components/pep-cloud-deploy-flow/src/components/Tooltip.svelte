<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        content: string;
        placement?: "top" | "bottom";
        disabled?: boolean;
        children?: Snippet;
    }

    let {
        content,
        placement = "top",
        disabled = false,
        children,
    }: Props = $props();

    let isDisabled = $derived(disabled || !content?.trim());
    let triggerEl = $state<HTMLSpanElement | null>(null);
    let popupEl = $state<HTMLSpanElement | null>(null);
    let visible = $state(false);

    function show(): void {
        if (isDisabled) return;
        visible = true;
        requestAnimationFrame(updatePosition);
    }

    function hide(): void {
        visible = false;
    }

    function updatePosition(): void {
        if (!triggerEl || !popupEl || !visible) return;
        const rect = triggerEl.getBoundingClientRect();
        const popupRect = popupEl.getBoundingClientRect();
        const gap = 8;

        let top: number;
        if (placement === "bottom") {
            top = rect.bottom + gap;
        } else {
            top = rect.top - popupRect.height - gap;
        }

        let left = rect.left + rect.width / 2 - popupRect.width / 2;
        const minLeft = 4;
        const maxLeft = window.innerWidth - popupRect.width - 4;
        left = Math.max(minLeft, Math.min(maxLeft, left));

        popupEl.style.top = `${top}px`;
        popupEl.style.left = `${left}px`;
    }
</script>

<span
    class="pep-tooltip"
    role="presentation"
    bind:this={triggerEl}
    onmouseenter={show}
    onmouseleave={hide}
    onfocusin={show}
    onfocusout={hide}
>
    {@render children?.()}
</span>

{#if visible && !isDisabled}
    <span
        class="pep-tooltip__popup"
        class:bottom={placement === "bottom"}
        class:is-visible={visible}
        bind:this={popupEl}
    >
        {content}
    </span>
{/if}

<style>
    .pep-tooltip {
        display: inline-flex;
    }

    .pep-tooltip__popup {
        position: fixed;
        top: 0;
        left: 0;
        min-width: max-content;
        max-width: 280px;
        padding: 12px 16px;
        border-radius: 8px;
        background: #fff;
        color: #000;
        box-shadow: 0 2px 12px rgba(0,0,0, 0.16);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.4;
        text-align: center;
        white-space: nowrap;
        pointer-events: none;
        z-index: 10000;
        opacity: 0;
        transition:
            opacity 0.16s ease;
    }

    .pep-tooltip__popup.is-visible {
        opacity: 1;
    }

    .pep-tooltip__popup::after {
        content: "";
        position: absolute;
        left: 50%;
        top: 100%;
        transform: translateX(-50%);
        border-width: 5px 5px 0 5px;
        border-style: solid;
        border-color: #fff transparent transparent transparent;
    }

    .pep-tooltip__popup.bottom::after {
        top: auto;
        bottom: 100%;
        border-width: 0 5px 5px 5px;
        border-color: transparent transparent #fff transparent;
    }
</style>
