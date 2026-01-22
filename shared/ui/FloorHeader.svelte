<script lang="ts">
    import type { FloorHeaderProps } from "./types";
    /**
     * 通用楼层头部组件
     * 支持 PC/移动端 标题、副标题及“更多”链接
     */
    let {
        title = "",
        titleMb = "",
        subtitle = "",
        subtitleMb = "",
        more = undefined
    }: FloorHeaderProps = $props();
</script>

{#if title || subtitle || titleMb || subtitleMb}
    <div class="pep-floor-header">
        {#if title || titleMb}
            <h2 class="pep-floor-header__title">
                <span class="pc-only">{@html title}</span>
                <span class="mb-only">{@html titleMb || title}</span>
            </h2>
        {/if}
        {#if subtitle || subtitleMb}
            <div class="pep-floor-header__subtitle">
                <span class="pc-only">{@html subtitle}</span>
                <span class="mb-only">{@html subtitleMb || subtitle}</span>
            </div>
        {/if}
        {#if more?.text}
            <a href={more.href} class="pep-floor-header__more">
                {more.text} &gt;
            </a>
        {/if}
    </div>
{/if}

<style>
    .pep-floor-header {
        text-align: center;
        margin-bottom: var(--primitive-space-10);
        position: relative;
    }

    .pep-floor-header__title {
        font-size: var(--primitive-font-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.4;
    }

    .pep-floor-header__title :global(p) {
        margin: 0;
    }

    .pep-floor-header__subtitle {
        font-size: var(--primitive-font-base);
        color: var(--text-secondary);
        margin-top: var(--primitive-space-3);
        line-height: 1.6;
    }

    .pep-floor-header__more {
        display: inline-block;
        margin-top: var(--primitive-space-4);
        font-size: var(--primitive-font-sm);
        color: var(--text-link);
        text-decoration: none;
    }

    .pep-floor-header__more:hover {
        text-decoration: underline;
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

        .pep-floor-header__title {
            font-size: var(--primitive-font-2xl);
        }
    }
</style>
