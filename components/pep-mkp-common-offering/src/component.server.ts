import type { FloorData } from './types';

export const loader = (method: { requestClient: any }, data: any): FloorData => {
    return {
        title: "Latest Offerings",
        isTitleCentered: true,
        floorBackgroundColor: "#f8f9fa",
        marginTop: 1,
        marginBottom: 1,
        tabs: [
            {
                title: "Cloud Services",
                cardsPerRow: 3,
                cards: [
                    {
                        title: "Web Hosting",
                        description: "Reliable web hosting for your personal website or business.",
                        price: "9.99",
                        priceSymbol: "$",
                        unit: "mo",
                        tags: ["Popular", "Fast"],
                        showInquiry: false,
                        showTitle: true,
                        showDescription: true,
                        linkUrl: "#"
                    },
                    {
                        title: "VPS Hosting",
                        description: "Scalable virtual private server for high performance apps.",
                        price: "29.99",
                        priceSymbol: "$",
                        unit: "mo",
                        tags: ["Scalable"],
                        showInquiry: true,
                        showTitle: true,
                        showDescription: true,
                        linkUrl: "#"
                    },
                    {
                        title: "Dedicated Server",
                        description: "Fully dedicated physical server with max performance.",
                        price: "199",
                        priceSymbol: "$",
                        unit: "mo",
                        tags: ["Enterprise"],
                        showInquiry: true,
                        showTitle: true,
                        showDescription: true,
                        linkUrl: "#"
                    }
                ]
            },
            {
                title: "Security Solutions",
                cardsPerRow: 2,
                cards: [
                    {
                        title: "SSL Certificate",
                        description: "Secure your website with industry standard encryption.",
                        price: "49.99",
                        priceSymbol: "$",
                        unit: "yr",
                        showInquiry: false,
                        showTitle: true,
                        showDescription: true,
                        linkUrl: "#"
                    },
                    {
                        title: "DDoS Protection",
                        description: "Advanced protection against distributed denial of service attacks.",
                        price: "99.99",
                        priceSymbol: "$",
                        unit: "mo",
                        showInquiry: true,
                        showTitle: true,
                        showDescription: true,
                        linkUrl: "#"
                    }
                ]
            }
        ]
    };
}
