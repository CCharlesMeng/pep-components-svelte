import { test, expect } from '@playwright/test';
import { mainConfig, expiredConfig, manualConfig } from '../src/lib/test-data';
import { expectPepTitle, expectPepButton } from '../../../shared/test-utils/assertions.ts';

const BASE_URL = 'http://localhost:5173/';

test.describe('pep-common-card-v2 组件功能测试', () => {

  test.beforeEach(async ({ page }) => {
    // 访问组件预览页面
    await page.goto(BASE_URL);
    // 等待页面加载和可能的水合过程
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('1. 基础渲染测试 - 验证楼层标题与卡片内容', async ({ page }) => {
    const section1 = page.locator('.demo-section').first();

    // 使用标准化断言验证标题 (同源自 mainConfig)
    await expectPepTitle(section1, {
      title: mainConfig.title,
      subtitle: mainConfig.subtitle
    });

    // 验证第一页签下的卡片数量
    const firstTabProducts = mainConfig.tabList[0].cards.products;
    const cards = section1.locator('.pep-common-card-v2__card-grid').locator('.pep-common-card-v2__card-item');
    await expect(cards).toHaveCount(firstTabProducts.length);

    // 验证卡片标题内容
    for (let i = 0; i < firstTabProducts.length; i++) {
      await expect(cards.nth(i).locator('.pep-common-card-v2__card-title'))
        .toHaveText(firstTabProducts[i].title);
    }
  });

  test('2. 页签切换测试 - 验证 Tab 点击联动', async ({ page }) => {
    const section1 = page.locator('.demo-section').first();
    const tabs = section1.locator('.pep-common-card-v2__tab-item');
    const grid = section1.locator('.pep-common-card-v2__card-grid');

    // 验证 Tab 标题
    for (let i = 0; i < mainConfig.tabList.length; i++) {
      await expect(tabs.nth(i)).toContainText(mainConfig.tabList[i].title);
    }

    // 点击第二个 Tab
    const secondTabIndex = 1;
    await tabs.nth(secondTabIndex).click();
    await page.waitForTimeout(500);

    await expect(tabs.nth(secondTabIndex)).toHaveClass(/active/);

    // 验证内容更新
    const secondTabProducts = mainConfig.tabList[secondTabIndex].cards.products;
    const cards = grid.locator('.pep-common-card-v2__card-item');
    await expect(cards).toHaveCount(secondTabProducts.length);
    await expect(cards.first().locator('.pep-common-card-v2__card-title'))
      .toHaveText(secondTabProducts[0].title);
  });

  test('3. 倒计时功能测试 - 验证实时更新与过期隐藏', async ({ page }) => {
    const section1 = page.locator('.demo-section').first();
    const countdown = section1.locator('.pep-common-card-v2__card-countdown').first();

    // 验证倒计时格式
    const timeText1 = await countdown.innerText();
    expect(timeText1).toMatch(/距结束 \d+:\d+:\d+/);

    // 验证实时更新
    await page.waitForTimeout(3000);
    const timeText2 = await countdown.innerText();
    expect(timeText1).not.toBe(timeText2);

    // 验证过期隐藏 (同源自 expiredConfig)
    const section2 = page.locator('.demo-section').nth(1);
    const expiredCards = section2.locator('.pep-common-card-v2__card-item');

    // 计算 expiredConfig 中未过期的产品数量
    const now = Date.now();
    const visibleProducts = expiredConfig.tabList[0].cards.products.filter(p => {
      if (!p.endTime) return true;
      return new Date(p.endTime.replace(/-/g, '/')).getTime() > now;
    });

    await expect(expiredCards).toHaveCount(visibleProducts.length);
    if (visibleProducts.length > 0) {
      await expect(expiredCards.first().locator('.pep-common-card-v2__card-title'))
        .toHaveText(visibleProducts[0].title);
    }
  });

  test('4. 响应式布局测试 - 验证移动端适配', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });

    const section1 = page.locator('.demo-section').first();
    const title = section1.locator('.pep-title__main .mb-only');
    await expect(title).toBeVisible();

    // 验证布局类名 (根据 mainConfig 中的 layoutMb)
    const expectedLayoutClass = mainConfig.tabList[0].layoutMb === 'leftRightLayout' ? /layout-mb-lr/ : /layout-mb-ud/;
    const firstCard = section1.locator('.pep-common-card-v2__card-item').first();
    await expect(firstCard).toHaveClass(expectedLayoutClass);
  });

  test('5. 交互测试 - 验证卡片链接', async ({ page }) => {
    const section1 = page.locator('.demo-section').first();
    const firstProduct = mainConfig.tabList[0].cards.products[0];
    const firstCard = section1.locator('.pep-common-card-v2__card-item').first();

    if (firstProduct.href) {
      await expect(firstCard).toHaveAttribute('href', firstProduct.href);
      await expect(firstCard).toHaveAttribute('target', '_blank');
    }

    // 验证按钮点击 (如果配置了按钮)
    const firstProductWithBtn = mainConfig.tabList.flatMap(t => t.cards.products).find(p => p.btnGroups?.length);
    if (firstProductWithBtn && firstProductWithBtn.btnGroups) {
      // 切换到包含按钮的 Tab
      const tabIndex = mainConfig.tabList.findIndex(t => t.cards.products.includes(firstProductWithBtn));
      if (tabIndex !== -1) {
        const tabs = section1.locator('.pep-common-card-v2__tab-item');
        await tabs.nth(tabIndex).click();

        const buyBtn = section1.locator('.pep-button').first();
        await expectPepButton(buyBtn, {
          text: firstProductWithBtn.btnGroups[0].btnLinkText,
          btnType: firstProductWithBtn.btnGroups[0].btnType
        });
        await buyBtn.click();
        expect(page.url()).toBe(BASE_URL);
      }
    }
  });

});
