/**
 * PepProductAdvantageV2 组件的 Props 类型定义
 */

export type ThemeType = 'light' | 'grey';

/**
 * 布局模式 (24 栅格)
 * 1: 一列 (24)
 * 2: 两列 (12:12)
 * 3: 两列 (14:10)
 * 4: 两列 (10:14)
 */
export type LayoutType = 1 | 2 | 3 | 4;

/**
 * 按钮样式类型
 */
export type BtnType = 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark' | 'por-btn-danger';

/**
 * 楼层基本信息
 */
export interface BaseInfo {
  /** 楼层背景主题 */
  theme?: ThemeType;
  /** 楼层标题 */
  title: string;
  /** 楼层副标题 (支持富文本) */
  subtitle?: string;
}

/**
 * 卡片描述信息项
 */
export interface CardInfoItem {
  /** 是否展示 li 符号 */
  showLICircle?: boolean;
  /** 描述内容 (支持富文本) */
  description: string;
}

/**
 * 按钮项
 */
export interface BtnItem {
  /** 按钮样式 */
  btnType?: BtnType;
  /** 按钮文字 */
  btnText: string;
  /** 按钮链接 */
  btnLink?: string;
}

/**
 * 单个卡片信息
 */
export interface CardItem {
  /** 卡片标题 */
  cardTitle: string;
  /** 图片链接 */
  bgImage: string;
  /** 描述内容列表 */
  cardInfos: CardInfoItem[];
  /** 按钮列表 */
  btnLists?: BtnItem[];
}

/**
 * 卡片行配置
 */
export interface CardRow {
  /** 布局比例场景 */
  layout: LayoutType;
  /** 该行包含的卡片列表 */
  cardItem: CardItem[];
}

/**
 * PepProductAdvantageV2 组件主 Props
 */
export interface PepProductAdvantageV2Props {
  /** 基础信息配置 */
  baseInfo: BaseInfo;
  /** 卡片行列表 */
  cardItemLists: CardRow[];
  /** 自定义类名 */
  className?: string;
}
