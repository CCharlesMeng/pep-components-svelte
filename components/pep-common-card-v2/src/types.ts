/**
 * PepCommonCardV2 组件的 Props 类型定义
 * 严格对应 schema.json 的属性结构
 */
export interface PepCommonCardV2Props {
  /** 楼层标题 (支持 HTML) */
  title?: string;
  /** 移动端楼层标题 */
  titleMb?: string;
  /** 楼层副标题 (支持富文本) */
  subtitle?: string;
  /** 移动端楼层副标题 */
  subtitleMb?: string;
  /** 更多链接配置 */
  more?: {
    text?: string;
    href?: string;
  };
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
  /** 是否显示楼层顶部间距 */
  isMergeTopSpacing?: boolean;
  /** 是否显示楼层底部间距 */
  isMergeBottomSpacing?: boolean;
  /** 移动端是否展示 */
  isShowMb?: boolean;
  /** 是否展示卡片描述 */
  showCardDesc?: boolean;
  /** 页签列表 */
  tabList?: TabItem[];
}

export interface TabItem {
  /** Tab 标题 */
  title?: string;
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
