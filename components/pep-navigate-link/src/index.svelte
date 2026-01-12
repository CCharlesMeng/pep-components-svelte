<script lang="ts">
    import type { Config, ArticleItem, Tab } from "./types";
    import NavTabs from "./lib/components/NavTabs.svelte";

    // Mock data generators (simulating the original BFF logic)
    function getMockArticles(type: string, sampleSize: number): ArticleItem[] {
        const articles = [
            { title: `技术文章 - ${type} - 1`, url: `/articles/${type}/1` },
            { title: `技术文章 - ${type} - 2`, url: `/articles/${type}/2` },
            { title: `技术文章 - ${type} - 3`, url: `/articles/${type}/3` },
            { title: `技术文章 - ${type} - 4`, url: `/articles/${type}/4` },
            { title: `技术文章 - ${type} - 5`, url: `/articles/${type}/5` },
        ];
        return articles.slice(0, sampleSize);
    }

    function getMockManuals(
        guideType: string,
        sampleSize: number,
    ): ArticleItem[] {
        const manuals = [
            {
                title: `使用手册 - ${guideType} - 入门指南`,
                url: `/manuals/${guideType}/intro`,
            },
            {
                title: `使用手册 - ${guideType} - 高级配置`,
                url: `/manuals/${guideType}/advanced`,
            },
            {
                title: `使用手册 - ${guideType} - 故障排除`,
                url: `/manuals/${guideType}/troubleshooting`,
            },
            {
                title: `使用手册 - ${guideType} - API参考`,
                url: `/manuals/${guideType}/api`,
            },
            {
                title: `使用手册 - ${guideType} - 最佳实践`,
                url: `/manuals/${guideType}/best-practices`,
            },
            {
                title: `使用手册 - ${guideType} - 更新日志`,
                url: `/manuals/${guideType}/changelog`,
            },
        ];
        return manuals.slice(0, sampleSize);
    }

    // Generate tabData for development (simulating original +page.server.ts logic)
    function generateMockTabData(tabs: Tab[]): Record<number, ArticleItem[]> {
        const tabData: Record<number, ArticleItem[]> = {};

        tabs.forEach((tab, index) => {
            if (
                tab.tabContent?.isShowSelect &&
                tab.tabContent.recommendType === "2"
            ) {
                const articleConfig = tab.tabContent.article as any;

                if (articleConfig) {
                    if (articleConfig.source === "1" && articleConfig.type) {
                        tabData[index] = getMockArticles(
                            articleConfig.type,
                            articleConfig.sampleSize || 5,
                        );
                    } else if (
                        articleConfig.source === "3" &&
                        articleConfig.guideType
                    ) {
                        tabData[index] = getMockManuals(
                            articleConfig.guideType,
                            articleConfig.sampleSize || 5,
                        );
                    }
                }
            }
        });

        return tabData;
    }

    let {
        baseInfo,
        tabs,
        tabData: initialTabData,
    }: { baseInfo: any; tabs: any[]; tabData?: Record<number, ArticleItem[]> } =
        $props();

    // Map schema enum to CSS classes
    const bgClasses: Record<string, string> = {
        white: "theme-white",
        bluegrey: "theme-bluegrey",
        halftransparent: "theme-halftransparent",
        shallowgrey: "theme-shallowgrey",
    };

    // Local state for tabData - initialize with props or generate mock data
    let tabData = $state<Record<number, ArticleItem[]>>();

    // Initialize tabData if not provided (for development)
    $effect(() => {
        if (initialTabData) {
            tabData = initialTabData;
        } else if (tabs && tabs.length > 0) {
            tabData = generateMockTabData(tabs);
        } else {
            tabData = {};
        }
    });

    // Safe access with defaults - make reactive
    let currentBgClass = $derived(
        baseInfo?.bg ? bgClasses[baseInfo.bg] || "theme-white" : "theme-white"
    );

    // Style for top/bottom spacing - make reactive
    let containerStyle = $derived(
        baseInfo
            ? `
        padding-top: ${baseInfo.top || 0}px;
        padding-bottom: ${baseInfo.bottom || 0}px;
    `
            : ""
    );
</script>

<nav
    class="navigate-link {currentBgClass} {baseInfo?.isFixed ? 'fixed' : ''}"
    style={containerStyle}
>
    <div class="content-wrapper">
        {#if baseInfo?.isShowKeyWord}
            <div class="keyword-label">当前页面关键词</div>
        {/if}

        <NavTabs {tabs} {tabData} />
    </div>
</nav>

<style>
    /* Base Styles */
    .navigate-link {
        width: 100%;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        font-family: "Inter", sans-serif;
    }

    .fixed {
        position: sticky;
        top: 0;
    }

    .content-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        height: 60px;
        padding: 0 20px;
    }

    .keyword-label {
        margin-right: 20px;
        font-size: 14px;
        font-weight: bold;
        opacity: 0.8;
    }

    /* Themes */
    .theme-white {
        background-color: #ffffff;
        color: #333333;
    }

    .theme-bluegrey {
        background-color: #34495e;
        color: #ffffff;
    }

    .theme-halftransparent {
        background-color: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        backdrop-filter: blur(10px);
    }

    .theme-shallowgrey {
        background-color: #f5f5f5;
        color: #333333;
    }
</style>
