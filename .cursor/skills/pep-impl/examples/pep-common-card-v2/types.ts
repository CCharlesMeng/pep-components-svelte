/**
 * 标杆组件 pep-common-card-v2 的类型定义（精简版）
 *
 * 关键模式：
 * - UseTraits<'header' | 'spacing' | 'visibility'> 声明式组合 Trait
 * - *Mb 后缀字段用于 Level 2 响应式配对切换
 * - 业务 Props 与 Trait Props 分离后再交叉
 */
import type { UseTraits, TabItem as BaseTabItem } from "@pep/shared/ui/types";

/** 纯业务属性 — 与 Trait 无关 */
export interface CardBusinessProps {
  cardType?: 'left' | 'center' | 'product';
  theme?: 'white' | 'grey';
  cardBgColor?: 'white' | 'gray';
  cardColumn?: '2' | '3' | '4' | '5';
  imgHeight?: '80px' | '60px' | '48px';
  showCardDesc?: boolean;
  tabList?: TabItem[];
}

/** 最终 Props = 业务 Props + Trait Props，一眼看出集成了哪些通用能力 */
export type PepCommonCardV2Props = CardBusinessProps
  & UseTraits<'header' | 'spacing' | 'visibility'>;

/** 扩展共享基础 TabItem */
export interface TabItem extends BaseTabItem {
  layoutMb?: 'upDownLayout' | 'leftRightLayout';
  cards?: { products?: ProductItem[] };
}

export interface ProductItem {
  icon?: string;
  iconMb?: string; // *Mb 后缀 → Level 2 配对切换
  title?: string;
  desc?: string;
  tags?: string[];
  href?: string;
  btnGroups?: CardButton[];
}

export interface CardButton {
  btnType?: 'por-btn-primary' | 'por-btn-secondary' | 'por-btn-dark';
  btnHref?: string;
  btnLinkText?: string;
}
