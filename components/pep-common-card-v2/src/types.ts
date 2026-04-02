import type { UseTraits, TabItem as BaseTabItem } from "@pep/shared/ui/types";

/**
 * 1. 定义该组件特有的“纯业务”属性
 */
export interface CardBusinessProps {
  /** PC 端卡片样式 */
  cardType?: 'left' | 'center' | 'product';
  /** 背景色主题 */
  theme?: 'white' | 'grey';
  /** 卡片背景色 */
  cardBgColor?: 'white' | 'gray';
  /** PC 端卡片列数 */
  cardColumn?: '2' | '3' | '4' | '5';
  /** 图片/图标高度 */
  imgHeight?: '80px' | '60px' | '48px';
  /** 是否展示卡片描述 */
  showCardDesc?: boolean;
  /** 页签列表 */
  tabList?: TabItem[];
}

/**
 * 2. 导出组合后的最终 Props
 * 通过 UseTraits 一眼看出该组件集成了哪些通用能力
 */
export type PepCommonCardV2Props = CardBusinessProps & UseTraits<'header' | 'spacing' | 'visibility'>;

export interface TabItem extends BaseTabItem {
  /** 移动端布局方式 */
  layoutMb?: 'upDownLayout' | 'leftRightLayout';
  /** 内容区 */
  cards?: {
    products?: ProductItem[];
  };
  /** 展开时文案 */
  bottomShowMoreText?: string;
  /** 收起时文案 */
  bottomCollapseText?: string;
}

export interface ProductItem {
  /** 倒计时结束时间 */
  endTime?: string;
  /** 图标 URL */
  icon?: string;
  /** 移动端图标 URL */
  iconMb?: string;
  /** 卡片标题 */
  title?: string;
  /** 重点文案 */
  keywords?: {
    keyword?: string;
  }[];
  /** 卡片描述 (支持富文本) */
  desc?: string;
  /** 标签列表 */
  tags?: string[];
  /** 按钮组 */
  btnGroups?: CardButton[];
  /** 卡片整体链接 */
  href?: string;
}

export interface CardButton {
  /** 按钮类型 */
  btnType?: 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark';
  /** 按钮链接 */
  btnHref?: string;
  /** 按钮文案 */
  btnLinkText?: string;
}
