import { expect, type Locator } from '@playwright/test';

/**
 * 验证 PepTitle 组件的渲染
 */
export async function expectPepTitle(locator: Locator, data: { 
  title?: string; 
  titleMb?: string; 
  subtitle?: string; 
  subtitleMb?: string;
}) {
  const pcTitle = locator.locator('.pep-title__main .pc-only');
  const mbTitle = locator.locator('.pep-title__main .mb-only');

  if (data.title) {
    const expectedTitle = data.title.replace(/<[^>]*>?/gm, '');
    await expect(pcTitle).toContainText(expectedTitle);
  }

  if (data.titleMb || data.title) {
    const expectedMbTitle = (data.titleMb || data.title!).replace(/<[^>]*>?/gm, '');
    await expect(mbTitle).toContainText(expectedMbTitle);
  }

  if (data.subtitle) {
    const pcSub = locator.locator('.pep-title__sub .pc-only');
    await expect(pcSub).toContainText(data.subtitle.replace(/<[^>]*>?/gm, ''));
  }
}

/**
 * 验证 PepFloorContainer 组件的显隐
 */
export async function expectPepFloorVisible(locator: Locator, isShowMb: boolean = true) {
  if (!isShowMb) {
    // 假设在移动端视口下
    await expect(locator).toHaveClass(/hide-mb/);
  } else {
    await expect(locator).not.toHaveClass(/hide-mb/);
  }
}

/**
 * 验证 PepButton 组件的渲染
 */
export async function expectPepButton(locator: Locator, data: { text?: string; btnType?: string }) {
  if (data.text) {
    await expect(locator).toContainText(data.text);
  }
  if (data.btnType) {
    await expect(locator).toHaveClass(new RegExp(data.btnType));
  }
}
