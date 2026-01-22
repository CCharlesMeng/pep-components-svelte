import type { UseTraits } from "/@shared/ui/types";

/**
 * 1. 定义该组件特有的“纯业务”属性
 */
export interface {{COMPONENT_NAME_PASCAL}}BusinessProps {
  /** PC 端卡片标题 */
  title?: string;
  /** 卡片描述文本 */
  description?: string;
  /** 按钮文本 */
  buttonText?: string;
}

/**
 * 2. 导出组合后的最终 Props
 * 通过 UseTraits 一眼看出该组件集成了哪些通用能力
 */
export type {{COMPONENT_NAME_PASCAL}}Props = {{COMPONENT_NAME_PASCAL}}BusinessProps & UseTraits<'header' | 'spacing' | 'visibility'>;

