<script lang="ts">
    import type { Snippet } from "svelte";

    type Bg = "white" | "light" | "grey" | "dark" | "transBlack" | "transWhite";
    type Theme = "dark" | "light";

    interface Props {
        /** 楼层背景，对应 por-section data-bg */
        bg?: Bg;
        /** 标题区颜色主题，对应 por-section-head data-theme */
        theme?: Theme;
        /** 主标题，支持 HTML */
        title?: string;
        /** 副标题，支持 HTML */
        subtitle?: string;
        /** 更多链接 */
        titleLink?: { text: string; href?: string };
        /** 标题居左，添加 por-section-title-left */
        titleLeft?: boolean;
        /** 合并上方间距，添加 por-section-merge-spacing-top */
        mergeTopSpacing?: boolean;
        /** 合并下方间距，添加 por-section-merge-spacing-bottom */
        mergeBottomSpacing?: boolean;
        /**
         * PC 端楼层背景图 URL。仅在 `bg` 为 `transBlack` 或 `transWhite` 时生效。
         * 仅传 PC 图时移动端不设背景图（保持 trans 透明底）。
         */
        bgImagePc?: string;
        /**
         * 移动端楼层背景图 URL。仅在 `bg` 为 `transBlack` 或 `transWhite` 时生效。
         * 仅传移动端图时 PC 端不设背景图。
         */
        bgImageMb?: string;
        /** 楼层内容 */
        children?: Snippet;
    }

    let {
        bg = "white",
        theme = "dark",
        title,
        subtitle,
        titleLink,
        titleLeft = false,
        mergeTopSpacing = true,
        mergeBottomSpacing = true,
        bgImagePc,
        bgImageMb,
        children,
    }: Props = $props();

    /** 半透明楼层底上叠加背景图（PortalUI trans 背景 + cover 图） */
    const transBgImage = $derived.by((): { pc: string | null; mb: string | null } | null => {
        if (bg !== "transBlack" && bg !== "transWhite") return null;
        const pc = bgImagePc?.trim() || null;
        const mb = bgImageMb?.trim() || null;
        if (!pc && !mb) return null;
        return { pc, mb };
    });

    function cssBgValue(url: string | null): string {
        return url ? `url(${JSON.stringify(url)})` : "none";
    }
</script>

<div
    class="por-section"
    class:floor-trans-bg-image={!!transBgImage}
    class:por-section-merge-spacing-top={!mergeTopSpacing}
    class:por-section-merge-spacing-bottom={!mergeBottomSpacing}
    class:por-section-title-left={titleLeft}
    data-bg={bg}
    style:--floor-bg-pc={transBgImage ? cssBgValue(transBgImage.pc) : undefined}
    style:--floor-bg-mb={transBgImage ? cssBgValue(transBgImage.mb) : undefined}
>
    <div class="por-container">
        {#if title || subtitle}
            <div class="por-section-head" data-theme={theme}>
                {#if title}
                    <h2 class="por-section-title">{@html title}</h2>
                {/if}
                {#if subtitle}
                    <p class="por-section-subtitle">{@html subtitle}</p>
                {/if}
                {#if titleLink?.text}
                    <a href={titleLink.href} class="por-section-title-link">
                        {titleLink.text}
                    </a>
                {/if}
            </div>
        {/if}
        <div class="por-section-body">
            {@render children?.()}
        </div>
    </div>
</div>

<style>
    /* 与 pep-impl responsive-levels：PC 默认，≤767px 为移动端 */
    .por-section.floor-trans-bg-image {
        background-image: var(--floor-bg-pc);
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;
    }

    @media (max-width: 768px) {
        .por-section.floor-trans-bg-image {
            background-image: var(--floor-bg-mb);
        }
    }
</style>
