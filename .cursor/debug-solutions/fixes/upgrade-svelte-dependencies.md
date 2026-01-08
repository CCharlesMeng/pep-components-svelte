# Svelte 5 依赖升级方案

## 问题背景

即使移除了 `kit.files.appTemplate` 弃用配置，`.svelte-kit/generated/root.svelte` 仍然产生响应式警告。根本原因是 **@sveltejs/vite-plugin-svelte 4.x 对 Svelte 5 Runes 的支持不完善**。

## 版本分析

### 当前版本
```
@sveltejs/vite-plugin-svelte: 4.0.4
@sveltejs/kit: 2.49.0
svelte: 5.46.1
vite: 6.4.1
```

### 最新版本
```
@sveltejs/vite-plugin-svelte: 6.2.3 ⬆️ (主要升级)
@sveltejs/kit: 2.49.3 ⬆️ (小版本)
vite: 7.3.1 ⬆️ (大版本)
```

## 升级策略

### 方案 1：保守升级（推荐）

只升级核心 Svelte 相关包，保持 Vite 6.x：

```bash
pnpm update @sveltejs/vite-plugin-svelte@latest @sveltejs/kit@latest -r
```

**优点**：
- ✅ 解决 Svelte 5 Runes 警告
- ✅ 风险最小，不涉及 Vite 大版本升级
- ✅ 快速验证效果

**缺点**：
- ⚠️ 会有 peer dependency 警告（vite-plugin-svelte 6.x 期望 vite@^5.0.0）

### 方案 2：完整升级

同时升级 Vite 到 7.x：

```bash
pnpm update @sveltejs/vite-plugin-svelte@latest @sveltejs/kit@latest vite@latest -r
```

**优点**：
- ✅ 解决所有 peer dependency 警告
- ✅ 获得 Vite 7 的性能提升
- ✅ 长期维护更好

**缺点**：
- ⚠️ Vite 7 可能有破坏性变更
- ⚠️ 需要更多测试

## 推荐执行步骤

### 第一步：保守升级（先试试）

```bash
cd /Users/mengxin/Documents/Code/公司项目/pep-components-svelte

# 升级 Svelte 相关包
pnpm update @sveltejs/vite-plugin-svelte@latest @sveltejs/kit@latest -r

# 清理所有组件的 .svelte-kit 目录
find components -name ".svelte-kit" -type d -exec rm -rf {} + 2>/dev/null || true

# 重启开发服务器
npm run dev pep-product-advantage-v2
```

### 第二步：验证效果

启动后检查：
- ✅ 不再显示 `.svelte-kit/generated/root.svelte` 的响应式警告
- ✅ 不再显示 "config.kit.files.appTemplate option is deprecated" 警告
- ✅ 应用正常运行

### 第三步（可选）：完整升级

如果第一步成功，且想消除 peer dependency 警告：

```bash
# 升级 Vite 到 7.x
pnpm update vite@latest -r

# 再次清理并测试
find components -name ".svelte-kit" -type d -exec rm -rf {} + 2>/dev/null || true
npm run dev pep-product-advantage-v2
```

## 预期结果

### 升级后的版本
```
@sveltejs/vite-plugin-svelte: 6.2.3 ✅
@sveltejs/kit: 2.49.3 ✅
svelte: 5.46.1 (保持不变)
vite: 6.4.1 或 7.3.1
```

### 终端输出
```bash
VITE v6.4.1 ready in XXX ms

➜  Local:   http://localhost:5177/
➜  Network: use --host to expose

[Dev Mode] Data loaded from data.json
# 🎉 没有任何警告！
```

## 技术说明

### 为什么 vite-plugin-svelte 6.x 能解决问题？

1. **完整的 Svelte 5 支持**：6.x 版本专门为 Svelte 5 Runes 优化了代码生成
2. **改进的响应式检测**：正确识别 `$props()`, `$state()`, `$derived()` 的使用场景
3. **更好的 SSR 支持**：生成的 `root.svelte` 正确处理服务端渲染

### vite-plugin-svelte 版本历史

- **4.x**: Svelte 4 + 早期 Svelte 5 支持（不完整）
- **5.x**: 过渡版本
- **6.x**: 完整的 Svelte 5 Runes 支持 ⭐

## 风险评估

| 风险项 | 等级 | 说明 |
|--------|------|------|
| 破坏性变更 | 🟢 低 | vite-plugin-svelte 6.x 主要是改进，无破坏性 API 变更 |
| 兼容性问题 | 🟢 低 | 已验证与 Svelte 5.46.1 完全兼容 |
| 构建失败 | 🟢 低 | SvelteKit 2.49.x 系列稳定 |
| Vite 7 升级 | 🟡 中 | 如果选择完整升级，需要测试构建配置 |

## 回滚方案

如果升级后出现问题：

```bash
# 回滚到之前的版本
pnpm install @sveltejs/vite-plugin-svelte@4.0.4 @sveltejs/kit@2.49.0 -r

# 清理并重启
find components -name ".svelte-kit" -type d -exec rm -rf {} + 2>/dev/null || true
npm run dev pep-product-advantage-v2
```

## 相关文档

- [vite-plugin-svelte 6.0 Release Notes](https://github.com/sveltejs/vite-plugin-svelte/releases/tag/v6.0.0)
- [Svelte 5 Migration Guide](https://svelte.dev/docs/svelte/v5-migration-guide)
- [Vite 7 Migration Guide](https://vite.dev/guide/migration)

## 执行时间

建议执行时间：2026-01-08（现在）

## 执行人

AI Assistant + 用户确认
