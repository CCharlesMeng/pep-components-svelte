<script lang="ts">
    export let title: string = "";
    export let titleMb: string = "";
    export let subtitle: string = "";
    export let subtitleMb: string = "";
    export let more: { text?: string; href?: string } | undefined = undefined;
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
        margin-bottom: 40px;
        position: relative;
    }

    .pep-common-card-v2__floor-title {
        font-size: 32px;
        font-weight: 600;
        color: #111;
        margin: 0;
        line-height: 1.4;
    }

    .pep-common-card-v2__floor-title :global(p) {
        margin: 0;
    }

    .pep-common-card-v2__floor-subtitle {
        font-size: 16px;
        color: #666;
        margin-top: 12px;
        line-height: 1.6;
    }

    .pep-common-card-v2__more {
        display: inline-block;
        margin-top: 16px;
        font-size: 14px;
        color: #3b82f6;
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
            font-size: 24px;
        }
    }
</style>
