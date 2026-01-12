<script lang="ts">
    import type { ProductItem } from "../../types";
    import { getRemainingTime } from "../../../../../shared/utils/date";

    export let product: ProductItem;
    export let cardBgColor: "white" | "gray" = "gray";
    export let imgHeight: string = "80px";
    export let showCardDesc: boolean = true;
    export let layoutMb: "upDownLayout" | "leftRightLayout" | undefined =
        undefined;
    export let now: number;
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
        <!-- 标题 -->
        {#if product.title}
            <h3 class="pep-common-card-v2__card-title">{product.title}</h3>
        {/if}

        <!-- 重点文案 -->
        {#if product.keywords && product.keywords.length > 0}
            <div class="pep-common-card-v2__card-keywords">
                {#each product.keywords as kw}
                    <span class="pep-common-card-v2__keyword">{kw.keyword}</span
                    >
                {/each}
            </div>
        {/if}

        <!-- 描述 -->
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
                    on:click|stopPropagation={() =>
                        btn.btnHref && window.open(btn.btnHref)}
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
        padding: 40px 24px;
        text-decoration: none;
        transition: all 0.3s ease;
        border-radius: 4px;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        /* Allow parent to control grid layout */
    }

    .pep-common-card-v2__card-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    }

    .card-bg-white {
        background-color: #ffffff;
    }
    .card-bg-gray {
        background-color: #f9fafb;
    }

    .pep-common-card-v2__card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 24px;
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
        font-size: 18px;
        font-weight: 600;
        color: #111;
        margin: 0 0 12px 0;
        text-align: center;
        line-height: 1.4;
    }

    .pep-common-card-v2__card-desc {
        font-size: 14px;
        color: #666;
        text-align: center;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    .pep-common-card-v2__card-desc :global(p) {
        margin: 0;
    }

    .pep-common-card-v2__card-countdown {
        position: absolute;
        top: 12px;
        right: 12px;
        font-size: 12px;
        color: #e41e2b;
        background: rgba(228, 30, 43, 0.05);
        padding: 2px 8px;
        border-radius: 10px;
    }

    .pep-common-card-v2__card-tags {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
        justify-content: center;
    }

    .pep-common-card-v2__tag {
        font-size: 12px;
        padding: 2px 8px;
        background: #f0f0f0;
        color: #666;
        border-radius: 2px;
    }

    .pep-common-card-v2__card-keywords {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
        justify-content: center;
    }

    .pep-common-card-v2__keyword {
        font-size: 14px;
        color: #e41e2b;
        font-weight: 600;
    }

    .pep-common-card-v2__card-btns {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        width: 100%;
        justify-content: center;
    }

    .pep-common-card-v2__btn {
        flex: 1;
        padding: 8px 16px;
        font-size: 14px;
        border-radius: 2px;
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid transparent;
        max-width: 120px;
    }

    .por-btn-primary {
        background-color: #111;
        color: #fff;
    }
    .por-btn-secondary {
        background-color: #fff;
        border-color: #111;
        color: #111;
    }
    .por-btn-dark {
        background-color: transparent;
        color: #111;
    }

    /* 布局微调 */
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

    /* 响应式辅助 */
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

        /* 移动端左右布局 */
        .pep-common-card-v2__card-item.layout-mb-lr {
            flex-direction: row;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
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
