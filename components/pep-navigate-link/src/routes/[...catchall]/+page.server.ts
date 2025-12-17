import { getMockArticles, getMockManuals } from '$lib/server/mockData';
import { createDataLoader } from '@pep/bff';
import type { Config, ArticleItem } from '$lib/types';

interface ArticleConfig {
    source: string;
    type?: string;
    guideType?: string;
    sampleSize?: number;
    [key: string]: any;
}

import type { PageServerLoad } from './$types';

// Use the new createDataLoader which supports both BFF (via Header) and dev mode (via data.json)
const loadConfig = createDataLoader('data.json');

export const load: PageServerLoad = async (event) => {
    const config: Config = await loadConfig(event);

    if (!config.tabs) {
        console.error('Invalid config loaded');
        return {
            config: {
                baseInfo: { bg: 'white', isShowKeyWord: false, isFixed: false, top: 0, bottom: 0 },
                tabs: []
            } as Config,
            tabData: {} as Record<number, ArticleItem[]>
        };
    }

    const tabData: Record<number, ArticleItem[]> = {};

    for (let i = 0; i < config.tabs.length; i++) {
        const tab = config.tabs[i];
        if (tab.tabContent?.isShowSelect && tab.tabContent.recommendType === '2') {
            const articleConfig = tab.tabContent.article as ArticleConfig | undefined;

            if (articleConfig) {
                if (articleConfig.source === '1' && articleConfig.type) {
                    tabData[i] = getMockArticles(articleConfig.type, articleConfig.sampleSize);
                } else if (articleConfig.source === '3' && articleConfig.guideType) {
                    tabData[i] = getMockManuals(articleConfig.guideType, articleConfig.sampleSize);
                }
            }
        }
    }

    return {
        config,
        tabData
    };
}
