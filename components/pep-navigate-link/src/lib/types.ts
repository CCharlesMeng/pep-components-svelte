export interface ArticleItem {
    title: string;
    url: string;
}

export interface TabContent {
    isShowSelect: boolean;
    recommendType?: string;
    items?: ArticleItem[];
    article?: {
        source: string;
        type?: string;
        guideType?: string;
        sampleSize?: number;
        [key: string]: any;
    };
}

export interface Tab {
    tabTitle: string;
    tabUrl: string;
    tabContent?: TabContent;
    cardsPerRow?: number;
    cards?: any[]; // Adjust based on actual usage if needed
}

export interface BaseInfo {
    bg: string;
    isShowKeyWord: boolean;
    isFixed: boolean;
    top: number;
    bottom: number;
}

export interface Config {
    baseInfo: BaseInfo;
    tabs: Tab[];
}
