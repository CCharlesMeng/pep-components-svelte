/**
 * {{COMPONENT_NAME_PASCAL}} 组件的 Props 类型定义
 */
export interface {{COMPONENT_NAME_PASCAL}}Props {
  /**
   * 自定义类名
   */
  className?: string;

  /**
   * 卡片标题
   * @default '组件标题'
   */
  title?: string;

  /**
   * 卡片描述文本
   * @default '这是一个示例组件，包含卡片、按钮和响应式状态'
   */
  description?: string;

  /**
   * 按钮文本
   * @default '点击增加'
   */
  buttonText?: string;
}

