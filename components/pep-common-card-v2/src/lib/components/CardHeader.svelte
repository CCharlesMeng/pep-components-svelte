<script lang="ts">
    // 1. 导入
    // (无)

    // 2. Props 定义
    let {
        title = "",
        titleMb = "",
        subtitle = "",
        subtitleMb = "",
        more = undefined
    } = $props<{
        title?: string;
        titleMb?: string;
        subtitle?: string;
        subtitleMb?: string;
        more?: { text?: string; href?: string } | undefined;
    }>();
</script>

{#if title || subtitle || titleMb || subtitleMb}
    <div class="pep-common-card-v2__header">
        {#if title || titleMb}
            <h2 class="pep-common-card-v2__floor-title">
                <span class="pc-only">{@html title}</span>
                <span class="mb-only">{@html titleMb || title}</span>
            </h2>
        {/if}
        {#if subtitle || subtitleMb}
            <div class="pep-common-card-v2__floor-subtitle">
                <span class="pc-only">{@html subtitle}</span>
                <span class="mb-only">{@html subtitleMb || subtitle}</span>
            </div>
        {/if}
        {#if more?.text}
            <a href={more.href} class="pep-common-card-v2__more"
                >{more.text} &gt;</a
            >
        {/if}
    </div>
{/if}

<style>
    .pep-common-card-v2__header {
        text-align: center;
        margin-bottom: var(--primitive-space-10);
        position: relative;
    }

    .pep-common-card-v2__floor-title {
        font-size: var(--primitive-font-3xl);
        font-weight: 600;
        color: var(--text-primary);
        margin: 0;
        line-height: 1.4;
    }

    .pep-common-card-v2__floor-title :global(p) {
        margin: 0;
    }

    .pep-common-card-v2__floor-subtitle {
        font-size: var(--primitive-font-base);
        color: var(--text-secondary);
        margin-top: var(--primitive-space-3);
        line-height: 1.6;
    }

    .pep-common-card-v2__more {
        display: inline-block;
        margin-top: var(--primitive-space-4);
        font-size: var(--primitive-font-sm);
        color: var(--text-link);
        text-decoration: none;
    }

    .pep-common-card-v2__more:hover {
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

        .pep-common-card-v2__floor-title {
            font-size: var(--primitive-font-2xl);
        }
    }
</style>
