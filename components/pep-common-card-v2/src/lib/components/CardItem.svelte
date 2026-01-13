<script lang="ts">
    import type { ProductItem } from "../../types";
    import { getRemainingTime } from "../../../../../shared/utils/date";

    let {
        product,
        cardBgColor = "gray",
        imgHeight = "80px",
        showCardDesc = true,
        layoutMb = undefined,
        now
    } = $props<{
        product: ProductItem;
        cardBgColor?: "white" | "gray";
        imgHeight?: string;
        showCardDesc?: boolean;
        layoutMb?: "upDownLayout" | "leftRightLayout" | undefined;
        now: number;
    }>();
</script>

<a
    href={product.href || "javascript:;"}
    class="pep-common-card-v2__card-item"
    class:card-bg-white={cardBgColor === "white"}
    class:card-bg-gray={cardBgColor === "gray"}
    class:layout-mb-lr={layoutMb === "leftRightLayout"}
    class:layout-mb-ud={layoutMb === "upDownLayout"}
    target={product.href ? "_blank" : "_self"}
>
    <!-- 倒计时 -->
    {#if product.endTime}
        <div class="pep-common-card-v2__card-countdown">
            {getRemainingTime(product.endTime, now)}
        </div>
    {/if}

    <!-- 图标 -->
    {#if product.icon || product.iconMb}
        <div class="pep-common-card-v2__card-icon" style="height: {imgHeight}">
            <img src={product.icon} class="pc-only" alt={product.title} />
            <img
                src={product.iconMb || product.icon}
                class="mb-only"
                alt={product.title}
            />
        </div>
    {/if}

    <!-- 标签 -->
    {#if product.tags && product.tags.length > 0}
        <div class="pep-common-card-v2__card-tags">
            {#each product.tags as tag}
                <span class="pep-common-card-v2__tag">{tag}</span>
            {/each}
        </div>
    {/if}

    <!-- 内容文本区 -->
    <div class="pep-common-card-v2__card-info">
        {#if product.title}
            <h3 class="pep-common-card-v2__card-title">{product.title}</h3>
        {/if}

        {#if product.keywords && product.keywords.length > 0}
            <div class="pep-common-card-v2__card-keywords">
                {#each product.keywords as kw}
                    <span class="pep-common-card-v2__keyword">{kw.keyword}</span
                    >
                {/each}
            </div>
        {/if}

        {#if showCardDesc && product.desc}
            <div class="pep-common-card-v2__card-desc">
                {@html product.desc}
            </div>
        {/if}
    </div>

    <!-- 按钮组 -->
    {#if product.btnGroups && product.btnGroups.length > 0}
        <div class="pep-common-card-v2__card-btns">
            {#each product.btnGroups as btn}
                <button
                    class="pep-common-card-v2__btn {btn.btnType}"
                    onclick={(e) => {
                        e.stopPropagation();
                        btn.btnHref && window.open(btn.btnHref);
                    }}
                >
                    {btn.btnLinkText}
                </button>
            {/each}
        </div>
    {/if}
</a>

<style>
    .pep-common-card-v2__card-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--card-padding);
        text-decoration: none;
        transition: all 0.3s ease;
        border-radius: var(--card-radius);
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
    }

    .pep-common-card-v2__card-item:hover {
        transform: translateY(-4px);
        box-shadow: var(--card-shadow);
    }

    .card-bg-white {
        background-color: var(--bg-primary);
    }
    .card-bg-gray {
        background-color: var(--bg-secondary);
    }

    .pep-common-card-v2__card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: var(--primitive-space-6);
        width: 100%;
    }

    .pep-common-card-v2__card-icon img {
        height: 100%;
        width: auto;
        object-fit: contain;
    }

    .pep-common-card-v2__card-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .pep-common-card-v2__card-title {
        font-size: var(--primitive-font-lg);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0 0 var(--primitive-space-3) 0;
        text-align: center;
        line-height: 1.4;
    }

    .pep-common-card-v2__card-desc {
        font-size: var(--primitive-font-sm);
        color: var(--text-secondary);
        text-align: center;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .pep-common-card-v2__card-desc :global(p) {
        margin: 0;
    }

    .pep-common-card-v2__card-countdown {
        position: absolute;
        top: var(--primitive-space-3);
        right: var(--primitive-space-3);
        font-size: var(--primitive-font-xs);
        color: var(--text-accent);
        background: var(--primitive-red-50);
        padding: 2px var(--primitive-space-2);
        border-radius: 10px;
    }

    .pep-common-card-v2__card-tags {
        display: flex;
        gap: var(--primitive-space-2);
        margin-bottom: var(--primitive-space-3);
        flex-wrap: wrap;
        justify-content: center;
    }

    .pep-common-card-v2__tag {
        font-size: var(--primitive-font-xs);
        padding: 2px var(--primitive-space-2);
        background: var(--primitive-gray-200);
        color: var(--text-secondary);
        border-radius: 2px;
    }

    .pep-common-card-v2__card-keywords {
        display: flex;
        gap: var(--primitive-space-3);
        margin-bottom: var(--primitive-space-3);
        justify-content: center;
    }

    .pep-common-card-v2__keyword {
        font-size: var(--primitive-font-sm);
        color: var(--text-accent);
        font-weight: 600;
    }

    .pep-common-card-v2__card-btns {
        display: flex;
        gap: var(--primitive-space-3);
        margin-top: var(--primitive-space-6);
        width: 100%;
        justify-content: center;
    }

    .pep-common-card-v2__btn {
        flex: 1;
        padding: var(--primitive-space-2) var(--primitive-space-4);
        font-size: var(--primitive-font-sm);
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
        max-width: 120px;
    }

    .por-btn-primary {
        background-color: var(--btn-primary-bg);
        color: var(--btn-primary-text);
    }
    .por-btn-secondary {
        background-color: var(--bg-primary);
        border-color: var(--btn-secondary-border);
        color: var(--btn-secondary-text);
    }
    .por-btn-dark {
        background-color: transparent;
        color: var(--text-primary);
    }

    :global(.layout-left) .pep-common-card-v2__card-info,
    :global(.layout-left) .pep-common-card-v2__card-tags,
    :global(.layout-left) .pep-common-card-v2__card-keywords,
    :global(.layout-left) .pep-common-card-v2__card-btns {
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
    }
    :global(.layout-left) .pep-common-card-v2__card-title,
    :global(.layout-left) .pep-common-card-v2__card-desc {
        text-align: left;
    }

    .pc-only {
        display: block;
    }
    .mb-only {
        display: none;
    }

    @media (max-width: 767px) {
        .pc-only {
            display: none;
        }
        .mb-only {
            display: block;
        }

        .pep-common-card-v2__card-item.layout-mb-lr {
            flex-direction: row;
            align-items: flex-start;
            gap: var(--primitive-space-4);
            padding: var(--primitive-space-4);
        }

        .layout-mb-lr .pep-common-card-v2__card-icon {
            width: 80px;
            margin-bottom: 0;
            flex-shrink: 0;
        }

        .layout-mb-lr .pep-common-card-v2__card-info,
        .layout-mb-lr .pep-common-card-v2__card-tags,
        .layout-mb-lr .pep-common-card-v2__card-keywords,
        .layout-mb-lr .pep-common-card-v2__card-btns {
            align-items: flex-start;
            justify-content: flex-start;
            text-align: left;
        }

        .layout-mb-lr .pep-common-card-v2__card-title,
        .layout-mb-lr .pep-common-card-v2__card-desc {
            text-align: left;
        }
    }
</style>
