<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  /** 黑底白字 | 白底深色字（描边次要按钮） */
  type Variant = "primary" | "secondary";

  type Props = {
    variant?: Variant;
    class?: string;
    children: Snippet;
  } & Omit<HTMLButtonAttributes, "class" | "children">;

  let {
    variant = "primary",
    class: className = "",
    children,
    type = "button",
    ...rest
  }: Props = $props();

  let variantClass = $derived(
    variant === "primary"
      ? "pep-cloud-deploy-flow-btn--primary"
      : "pep-cloud-deploy-flow-btn--secondary",
  );

  let mergedClass = $derived(
    ["pep-cloud-deploy-flow-btn", variantClass, className]
      .filter(Boolean)
      .join(" "),
  );
</script>

<button {type} class={mergedClass} {...rest}>
  {@render children()}
</button>

<style>
  .pep-cloud-deploy-flow-btn {
    font-family: inherit;
    box-sizing: border-box;
    border-radius: 999px;
    transition:
      background-color 0.2s,
      border-color 0.2s;
  }

  .pep-cloud-deploy-flow-btn--primary {
    border: none;
    background: #191919;
    color: #fff;
    padding: 7px 24px;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .pep-cloud-deploy-flow-btn--primary:hover:not(:disabled) {
    background: #1f2937;
  }

  .pep-cloud-deploy-flow-btn--primary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .pep-cloud-deploy-flow-btn--secondary {
    border: 1px solid #c9cdd4;
    background: #fff;
    color: #4e5969;
    padding: 7px 24px;
    font-size: 12px;
    line-height: 18px;
    cursor: pointer;
  }

  .pep-cloud-deploy-flow-btn--secondary:hover:not(:disabled) {
    background: #f5f7fa;
  }

  .pep-cloud-deploy-flow-btn--secondary:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
</style>
