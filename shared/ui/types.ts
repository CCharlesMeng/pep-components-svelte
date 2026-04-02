/**
 * 核心特征注册表
 * 定义所有可能的通用楼层特征属性
 */
export interface FloorTraits {
  /** 头部特征（title/subtitle/more，透传给 Floor 组件） */
  header: {
    title?: string;
    subtitle?: string;
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

export interface TabItem {
  /** Tab 标题 */
  title?: string;
  /** 业务内容 */
  [key: string]: any;
}
