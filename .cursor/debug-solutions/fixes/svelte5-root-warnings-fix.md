# Svelte 5 Root.svelte 响应式警告修复

## 问题描述

终端反复出现以下警告：

```
[vite-plugin-svelte] .svelte-kit/generated/root.svelte:11:27 This reference only captures the initial value of `stores`. Did you mean to reference it inside a closure instead?
[vite-plugin-svelte] .svelte-kit/generated/root.svelte:17:2 This reference only captures the initial value of `stores`. Did you mean to reference it inside a closure instead?
[vite-plugin-svelte] .svelte-kit/generated/root.svelte:17:18 This reference only captures the initial value of `page`. Did you mean to reference it inside a closure instead?
```

## 根本原因

1. **弃用的配置项**：`shared/config/svelte.config.js` 使用了 `kit.files.appTemplate` 选项
2. **不兼容的代码生成**：这个已弃用的选项导致 SvelteKit 生成不兼容 Svelte 5 Runes 的代码
3. **响应式系统冲突**：生成的 `root.svelte` 中对响应式变量的引用方式不符合 Svelte 5 规范

## 修复方案

### 1. 移除弃用的配置项

**文件**：`shared/config/svelte.config.js`

**修改前**：
```javascript
kit: {
    adapter: adapter(),
    files: {
        appTemplate: path.resolve(__dirname, '../../templates/app.html')
    },
    paths: {
        assets: process.env.SVELTE_CLIENT_ASSET_PATH,
        relative: false
    }
}
```

**修改后**：
```javascript
kit: {
    adapter: adapter(),
    // Removed deprecated 'files.appTemplate' option
    // SvelteKit will automatically use src/app.html if it exists
    paths: {
        assets: process.env.SVELTE_CLIENT_ASSET_PATH,
        relative: false
    }
}
```

### 2. 清理旧的生成文件

已清理以下组件的 `.svelte-kit` 目录：
- ✓ `components/pep-product-advantage-v2/.svelte-kit`
- ✓ `components/pep-common-card-v2/.svelte-kit`

### 3. 验证步骤

重启开发服务器后，警告应该完全消失：

```bash
# 停止当前运行的开发服务器（Ctrl+C）
# 然后重新启动
npm run dev pep-product-advantage-v2
```

**预期结果**：
- ✓ 不再显示 "config.kit.files.appTemplate option is deprecated" 警告
- ✓ 不再显示关于 `stores` 和 `page` 的响应式警告
- ✓ 开发服务器正常运行，无任何错误

## 技术说明

### 为什么移除 appTemplate 就能解决问题？

1. **SvelteKit 2.0+ 的标准行为**：新版本会自动查找并使用 `src/app.html`（如果存在）
2. **代码生成改进**：使用标准方式时，SvelteKit 会生成完全兼容 Svelte 5 Runes 的代码
3. **响应式系统正确性**：新生成的 `root.svelte` 会正确使用 `$derived` 和闭包来处理响应式引用

### 项目结构保持一致

每个组件目录下已经有 `src/app.html` 文件：
- `components/pep-product-advantage-v2/src/app.html`
- `components/pep-common-card-v2/src/app.html`

这些文件会被 SvelteKit 自动使用，无需额外配置。

## 影响范围

- **影响组件**：所有使用 `@pep/config` 共享配置的组件
- **破坏性**：无（仅移除弃用配置，不改变运行时行为）
- **向后兼容**：完全兼容，功能无变化

## 相关文档

- [SvelteKit Migration Guide](https://kit.svelte.dev/docs/migrating-to-sveltekit-2)
- [Svelte 5 Runes Documentation](https://svelte.dev/docs/svelte/v5-migration-guide)

## 修复时间

2026-01-08 10:51

## 验证状态

⏳ 等待开发服务器重启验证
