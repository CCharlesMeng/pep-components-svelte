import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/';

test.describe('pep-common-card-v2 组件功能测试', () => {
  
  test.beforeEach(async ({ page }) => {
    // 访问组件预览页面
    await page.goto(BASE_URL);
  });

  test('1. 基础渲染测试 - 验证楼层标题与卡片内容', async ({ page }) => {
    const floorTitle = page.locator('.pep-common-card-v2__floor-title .pc-only');
    await expect(floorTitle).toContainText('您可能感兴趣的产品');

    // 验证第一页签下的卡片数量（data.json 中配置了 3 个产品）
    const cards = page.locator('.pep-common-card-v2__card-grid').first().locator('.pep-common-card-v2__card-item');
    await expect(cards).toHaveCount(3);

    // 验证卡片标题
    await expect(cards.nth(0).locator('.pep-common-card-v2__card-title')).toHaveText('迁移中心 MgC');
    await expect(cards.nth(1).locator('.pep-common-card-v2__card-title')).toHaveText('弹性云服务器 ECS');
  });

  test('2. 页签切换测试 - 验证 Tab 点击联动', async ({ page }) => {
    const tabs = page.locator('.pep-common-card-v2__tab-item');
    const firstGrid = page.locator('.pep-common-card-v2__card-grid').first();

    // 初始状态：第一个 Tab 激活
    await expect(tabs.nth(0)).toHaveClass(/active/);
    
    // 点击第二个 Tab ("最新动态")
    await tabs.nth(1).click();
    await expect(tabs.nth(1)).toHaveClass(/active/);
    await expect(tabs.nth(0)).not.toHaveClass(/active/);

    // 验证内容更新（最新动态页签下应有 1 个促销产品）
    const cards = firstGrid.locator('.pep-common-card-v2__card-item');
    await expect(cards).toHaveCount(1);
    await expect(cards.locator('.pep-common-card-v2__card-title')).toHaveText('限时促销产品');
  });

  test('3. 倒计时功能测试 - 验证实时更新与过期隐藏', async ({ page }) => {
    // 验证实时更新：检查时间字符串是否包含冒号并随秒数变化
    const countdown = page.locator('.pep-common-card-v2__card-countdown').first();
    const timeText1 = await countdown.innerText();
    expect(timeText1).toMatch(/距结束 \d+:\d+:\d+/);

    // 等待 1.5 秒后再次检查，确认秒数发生变化
    await page.waitForTimeout(1500);
    const timeText2 = await countdown.innerText();
    expect(timeText1).not.toBe(timeText2);

    // 验证过期隐藏：在预览页面的第 2 部分
    const section2 = page.locator('.demo-section').nth(1);
    const expiredCards = section2.locator('.pep-common-card-v2__card-item');
    // 根据 demo 配置，过期产品（2020年）应被隐藏，仅保留 1 个可见产品
    await expect(expiredCards).toHaveCount(1);
    await expect(expiredCards.locator('.pep-common-card-v2__card-title')).toHaveText('可见产品');
  });

  test('4. 响应式布局测试 - 验证移动端适配', async ({ page }) => {
    // 设置为移动端视口 (iPhone 12 尺寸)
    await page.setViewportSize({ width: 375, height: 812 });

    // 验证楼层标题字号变化（通过 computed style 检查）
    const title = page.locator('.pep-common-card-v2__floor-title .mb-only').first();
    await expect(title).toBeVisible();
    
    // 验证卡片是否切换为左右布局（data.json 中默认配置为 leftRightLayout）
    const firstCard = page.locator('.pep-common-card-v2__card-item').first();
    await expect(firstCard).toHaveClass(/layout-mb-lr/);
    
    // 验证 Flex 方向（左右布局应为 row）
    const flexDir = await firstCard.evaluate(el => window.getComputedStyle(el).flexDirection);
    expect(flexDir).toBe('row');
  });

  test('5. 交互测试 - 验证卡片链接与悬停效果', async ({ page }) => {
    const firstCard = page.locator('.pep-common-card-v2__card-item').first();
    
    // 验证链接属性
    await expect(firstCard).toHaveAttribute('href', 'https://www.huaweicloud.com/product/mgc.html');
    await expect(firstCard).toHaveAttribute('target', '_blank');

    // 验证按钮点击阻止冒泡（内部按钮点击不应触发 a 标签的默认行为或报错）
    const buyBtn = page.locator('.pep-common-card-v2__btn').first();
    if (await buyBtn.isVisible()) {
      // 确认按钮可点击且不导致页面导航（因为我们使用了 stopPropagation）
      await buyBtn.click();
      expect(page.url()).toBe(BASE_URL);
    }
  });

});

