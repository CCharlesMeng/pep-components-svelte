import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/pep-product-advantage-v2';

test.describe('pep-product-advantage-v2 组件功能测试', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('1. 基础渲染测试 - 验证标题与栅格布局', async ({ page }) => {
    const component = page.locator('.pep-product-advantage-v2').first();
    
    // 验证楼层标题
    await expect(component.locator('.pep-title__main')).toBeVisible();
    
    // 验证栅格行
    const rows = component.locator('.grid-cols-24');
    await expect(rows).toHaveCount(2); // 根据 data.json 应该是 2 行
  });

  test('2. 卡片内容测试 - 验证图文排版', async ({ page }) => {
    const firstCard = page.locator('.pep-product-advantage-v2__card').first();
    
    // 验证标题
    await expect(firstCard.locator('.pep-product-advantage-v2__card-title')).toBeVisible();
    
    // 验证描述列表
    const infos = firstCard.locator('.pep-product-advantage-v2__info-item');
    await expect(infos).toHaveCount(1);
    
    // 验证图片
    await expect(firstCard.locator('.pep-product-advantage-v2__card-image img')).toBeVisible();
  });

  test('3. 移动端折叠交互测试', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const firstCard = page.locator('.pep-product-advantage-v2__card').first();
    const secondCard = page.locator('.pep-product-advantage-v2__card').nth(1);

    // 第一个卡片默认展开
    await expect(firstCard.locator('.pep-product-advantage-v2__card-details')).toBeVisible();
    
    // 第二个卡片默认折叠
    await expect(secondCard.locator('.pep-product-advantage-v2__card-details')).not.toBeVisible();

    // 点击第二个卡片标题展开
    await secondCard.locator('.pep-product-advantage-v2__card-title').click();
    await page.waitForTimeout(500);
    await expect(secondCard.locator('.pep-product-advantage-v2__card-details')).toBeVisible();

    // 第一个卡片依然保持展开 (多选模式)
    await expect(firstCard.locator('.pep-product-advantage-v2__card-details')).toBeVisible();
  });

  test('4. RTL 镜像适配测试', async ({ page }) => {
    const rtlComponent = page.locator('.demo-section[dir="rtl"] .pep-product-advantage-v2').first();
    const card = rtlComponent.locator('.pep-product-advantage-v2__card').first();
    
    // 验证 flex-direction 是否为 row-reverse
    await expect(card).toHaveCSS('flex-direction', 'row-reverse');
  });
});
