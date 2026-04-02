<script lang="ts">
  // 1. 导入：Svelte → 第三方 → 共享组件 → 本地
  import { type Snippet } from "svelte";
  import type { {{COMPONENT_NAME_PASCAL}}Props } from "./types";

  import Floor from "@pep/shared/ui/floor/Floor.svelte";
  import { pickTrait } from "@pep/shared/ui/traits";

  // 本地业务子组件
  import SubComponent from "./components/SubComponent.svelte";

  // 2. Props 定义
  let props: {{COMPONENT_NAME_PASCAL}}Props & { children?: Snippet } = $props();

  // 3. 业务逻辑默认值
  const {
    theme = "white",
    // ... 其他业务字段
  } = props;

  // 4. Trait 分拣
  const headerProps = $derived(pickTrait(props, "header"));
  const spacingProps = $derived(pickTrait(props, "spacing"));

  // 5. 响应式状态
  let activeTabIndex = $state(0);
</script>

<Floor
  bg={theme === "grey" ? "grey" : "white"}
  title={headerProps.title}
  subtitle={headerProps.subtitle}
  titleLink={headerProps.more?.text
    ? { text: headerProps.more.text, href: headerProps.more.href }
    : undefined}
  mergeTopSpacing={spacingProps.isMergeTopSpacing}
  mergeBottomSpacing={spacingProps.isMergeBottomSpacing}
>
  <div class="{{COMPONENT_NAME}}__content">
    <SubComponent />
    {@render props.children?.()}
  </div>
</Floor>

<style>
  .{{COMPONENT_NAME}}__content {
    /* 内容区样式 */
  }
</style>
