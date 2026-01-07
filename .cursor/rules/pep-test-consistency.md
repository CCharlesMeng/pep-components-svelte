---
description: Ensure Playwright tests remain consistent with mock data and component code.
globs: **/tests/*.spec.ts
---

# 测试一致性与同源规则 (Testing Source of Truth Consistency)

为了保证测试用例的健壮性和可维护性，所有 Playwright 测试必须遵循以下规则：

## 1. 数据同源 (Data Source of Truth)
- **禁止硬编码字面量**：测试用例中的断言内容（如文本、数量、链接等）严禁直接写死字符串字面量。
- **引用 Mock 数据**：必须从组件对应的 `data.json` 或 `schema.json` 中导入数据进行断言。
- **引用类型定义**：尽可能使用 `src/types.ts` 中的类型定义，确保测试代码与业务逻辑类型一致。

## 2. 选择器同步 (Selector Consistency)
- **结构化定位**：优先使用符合组件结构的语义化选择器。
- **避免过度耦合**：如果组件定义了特定的类名常量，测试中应优先引用这些常量或通过结构化定位（如 `section.locator('.title')`）而非全局搜索。

## 3. 动态断言 (Dynamic Assertions)
- **循环断言**：对于列表类内容（如 Tab 列表、产品列表），应通过遍历 `data.json` 中的数组进行动态匹配。
- **边界同步**：测试中的边界情况（如过期隐藏）应通过调整导入的 mock 数据对象或参考其 `endTime` 逻辑来计算，而不是使用固定的日期字符串。

## 4. 示例
反例：
```typescript
await expect(page.locator('.title')).toHaveText('迁移中心 MgC'); // 错误：硬编码
```

正例：
```typescript
import mockData from '../data.json';
await expect(page.locator('.title')).toHaveText(mockData.tabList[0].cards.products[0].title); // 正确：引用 mock 数据
```

