export interface CardData {
    title?: string;
    description?: string;
    imageUrl?: string;
    tags?: string[];
    price?: number | string;
    priceSymbol?: string;
    unit?: string;
    linkUrl?: string;
    showImage?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    showInquiry?: boolean;
    [key: string]: any;
}

export interface FloorData {
    title?: string;
    isTitleCentered?: boolean;
    floorBackgroundColor?: string;
    cardBackgroundColor?: string;
    marginTop?: number;
    marginBottom?: number;
    tabs?: Array<{
        title: string;
        cards: CardData[];
        cardsPerRow?: number;
    }>;
    [key: string]: any;
}
