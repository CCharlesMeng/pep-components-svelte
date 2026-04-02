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
        mergeTopSpacing = false,
        mergeBottomSpacing = false,
        children,
    }: Props = $props();
</script>

<div
    class="por-section"
    class:por-section-merge-spacing-top={mergeTopSpacing}
    class:por-section-merge-spacing-bottom={mergeBottomSpacing}
    class:por-section-title-left={titleLeft}
    data-bg={bg}
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
