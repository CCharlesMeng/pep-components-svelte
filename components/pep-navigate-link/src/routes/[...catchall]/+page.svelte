<script lang="ts">
    import NavigateLink from "$lib/components/NavigateLink.svelte";
    import type { Config, ArticleItem } from "$lib/types";

    interface PageData {
        config: Config;
        tabData: Record<number, ArticleItem[]>;
    }

    export let data: PageData;
</script>

<div class="page-container">
    <header>
        <h1>楼层导航组件演示</h1>
        <p>配置化导航栏，支持多种数据源聚合。</p>
    </header>

    <div class="demo-area">
        <NavigateLink config={data.config} tabData={data.tabData} />
    </div>

    <div class="content-placeholder">
        {#each Array(20) as _, i}
            <p>页面内容占位符 {i + 1} - 用于演示吸顶效果...</p>
        {/each}
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
        background-color: #f0f2f5;
    }
    .page-container {
        min-height: 200vh; /* To demonstrate sticky positioning */
    }
    header {
        padding: 40px 20px;
        text-align: center;
        background: #fff;
        margin-bottom: 20px;
        border-bottom: 1px solid #eaeaea;
    }
    h1 {
        margin: 0 0 10px 0;
        color: #333;
    }
    .content-placeholder {
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    p {
        line-height: 1.6;
        color: #666;
        margin-bottom: 15px;
    }
</style>
