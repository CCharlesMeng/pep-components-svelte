<script lang="ts">
    interface Props {
        completed: boolean;
        index: number;
        checkedIcon?: string;
        dotClass: string;
        iconClass?: string;
        fallbackClass?: string;
    }

    let { completed, index, checkedIcon, dotClass, iconClass = '', fallbackClass = '' }: Props = $props();
</script>

<span class={dotClass} class:is-completed={completed}>
    {#if completed}
        {#if checkedIcon}
            <img class={iconClass} src={checkedIcon} alt="" />
        {:else}
            <span class={fallbackClass}>✓</span>
        {/if}
    {:else}
        {index + 1}
    {/if}
</span>
