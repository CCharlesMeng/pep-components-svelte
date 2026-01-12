import type { PepCommonCardV2Props } from './types';

// Mock loader logic simulating BFF data fetching
export const loader = (method: { requestClient: any }, data: any): PepCommonCardV2Props => {
    return {
        title: "热门活动",
        titleMb: "热门活动",
        subtitle: "精选活动不容错过",
        subtitleMb: "精选活动",
        theme: "white",
        cardType: "center",
        cardBgColor: "gray",
        cardColumn: "3",
        imgHeight: "80px",
        isMergeTopSpacing: true,
        isMergeBottomSpacing: true,
        isShowMb: true,
        showCardDesc: true,
        more: {
            text: "查看更多",
            href: "/more"
        },
        tabList: [
            {
                title: "精选推荐",
                layoutMb: "leftRightLayout",
                cards: {
                    products: [
                        {
                            title: "示例产品 1",
                            desc: "这是一个示例产品的描述文案，支持富文本。",
                            icon: "https://via.placeholder.com/80",
                            href: "#",
                            tags: ["热销", "新品"],
                            btnGroups: [
                                {
                                    btnType: "por-btn-primary",
                                    btnLinkText: "立即购买",
                                    btnHref: "#"
                                }
                            ]
                        },
                        {
                            title: "示例产品 2",
                            desc: "这是一个示例产品的描述文案。",
                            icon: "https://via.placeholder.com/80",
                            href: "#",
                            tags: ["优惠"],
                            endTime: "2025-12-31 23:59:59"
                        },
                        {
                            title: "示例产品 3",
                            desc: "这是一个示例产品的描述文案。",
                            icon: "https://via.placeholder.com/80",
                            href: "#"
                        }
                    ]
                }
            },
            {
                title: "最新活动",
                cards: {
                    products: []
                }
            }
        ]
    };
}
