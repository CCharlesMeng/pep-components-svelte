/**
 * 核心特征注册表
 * 定义所有可能的通用楼层特征属性
 */
export interface FloorTraits {
  /** 头部特征 */
  header: {
    title?: string;
    titleMb?: string;
    subtitle?: string;
    subtitleMb?: string;
    more?: {
      text?: string;
      href?: string;
    };
  };
  /** 间距特征 */
  spacing: {
    isMergeTopSpacing?: boolean;
    isMergeBottomSpacing?: boolean;
  };
  /** 移动端展示特征 */
  visibility: {
    isShowMb?: boolean;
  };
}

/**
 * 类型体操：特征选择器
 * 允许按需组合多个特征
 */
export type UseTraits<K extends keyof FloorTraits> = UnionToIntersection<FloorTraits[K]>;

/** 辅助工具：将联合类型转为交叉类型 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * 原始 UI 组件 Props 定义（保持向后兼容）
 */
export type FloorHeaderProps = FloorTraits['header'];
export type FloorSpacingProps = FloorTraits['spacing'];
export type FloorVisibilityProps = FloorTraits['visibility'];

export interface TabItem {
  /** Tab 标题 */
  title?: string;
  /** 业务内容 */
  [key: string]: any;
}

export interface FloorTabsProps {
  /** 页签列表 */
  tabList?: TabItem[];
  /** 当前选中的页签索引 */
  activeTabIndex?: number;
}
