<script lang="ts">
  // 1. 导入：Svelte → 第三方 → 本地
  import { type Snippet } from "svelte";
  import type { {{COMPONENT_NAME_PASCAL}}Props } from "./types";

  // 共享 UI 组件 (使用项目约定的别名路径)
  import FloorHeader from "@pep/shared/ui/FloorHeader.svelte";
  import FloorTabs from "@pep/shared/ui/FloorTabs.svelte"; // 示例：使用共享 Tabs
  import { pickTrait } from "@pep/shared/ui/traits";

  // 本地业务子组件
  import SubComponent from "./components/SubComponent.svelte";

  // 2. Props 定义 (严格对应 schema.json)
  let props: {{COMPONENT_NAME_PASCAL}}Props & { children?: Snippet } = $props();

  // 3. 业务逻辑默认值处理
  const {
    title = "组件标题",
    description = "这是一个示例组件，基于 Svelte 5 编写",
    buttonText = "点击增加",
  } = props;

  // 4. 状态管理
  let count = $state(0);
  let activeTabIndex = $state(0);

  // 5. 特征分拣 (Explicit Forwarder) - 自动同步 Trait 属性
  const headerProps = $derived(pickTrait(props, "header"));
  const spacingProps = $derived(pickTrait(props, "spacing"));
  const visibilityProps = $derived(pickTrait(props, "visibility"));

  // 6. 事件处理
  function handleClick() {
    count += 1;
  }
</script>

<div
  class="{{COMPONENT_NAME}}"
  class:merge-top={spacingProps.isMergeTopSpacing ?? true}
  class:merge-bottom={spacingProps.isMergeBottomSpacing ?? true}
  class:hide-mb={visibilityProps.isShowMb === false}
>
  <div class="{{COMPONENT_NAME}}__container">
    <!-- 使用共享组件：楼层头部 -->
    <FloorHeader {...headerProps} />

    <div class="{{COMPONENT_NAME}}__content">
      <!-- 使用共享组件：页签 (仅作示例展示) -->
      <FloorTabs tabList={[{ title: '示例页签1' }, { title: '示例页签2' }]} bind:activeTabIndex />

      <div class="{{COMPONENT_NAME}}__card">
        <h3 class="{{COMPONENT_NAME}}__title">{title} (Tab: {activeTabIndex})</h3>
        <p class="{{COMPONENT_NAME}}__description">{description}</p>
        
        <div class="{{COMPONENT_NAME}}__counter">
          <!-- 使用本地子组件 -->
          <SubComponent label="当前累计" {count} />
          
          <button 
            class="{{COMPONENT_NAME}}__button" 
            onclick={handleClick}
            type="button"
          >
            {buttonText}
          </button>
        </div>
      </div>

      {@render props.children?.()}
    </div>
  </div>
</div>

<style>
  .{{COMPONENT_NAME}} {
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

  .{{COMPONENT_NAME}}__container {
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: var(--primitive-space-15) var(--primitive-space-5);
  }

  .{{COMPONENT_NAME}}__card {
    background: var(--bg-primary);
    border: 1px solid var(--border-subtle);
    border-radius: 8px;
    padding: 24px;
  }

  .{{COMPONENT_NAME}}__title {
    margin: 0 0 8px 0;
    font-size: 20px;
    font-weight: 600;
  }

  .{{COMPONENT_NAME}}__description {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .{{COMPONENT_NAME}}__counter {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .{{COMPONENT_NAME}}__count {
    font-size: 24px;
    font-weight: 700;
    color: var(--brand-primary);
  }

  .{{COMPONENT_NAME}}__button {
    padding: 8px 16px;
    background: var(--brand-primary);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .merge-top .{{COMPONENT_NAME}}__container {
    padding-top: 0;
  }
  .merge-bottom .{{COMPONENT_NAME}}__container {
    padding-bottom: 0;
  }

  @media (max-width: 767px) {
    .hide-mb {
      display: none;
    }

    .{{COMPONENT_NAME}}__container {
      padding: var(--primitive-space-10) var(--primitive-space-4);
    }
  }
</style>
