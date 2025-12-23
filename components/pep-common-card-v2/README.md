# pep-common-card-v2

> 组件状态：🟡 开发中  
> 最后更新：2025-12-23T11:29:57.898148

## 📝 概述

通用卡片组件 v2

## 🎯 核心功能

- [x] 卡片展示（标题、描述）
- [x] 响应式计数器
- [x] 按钮交互
- [ ] 待补充...

## 📦 安装

```bash
pnpm add pep-common-card-v2
```

## 🎨 使用示例

### 基础用法

```svelte
<script>
  import { PepCommonCardV2 } from 'pep-common-card-v2';
</script>

<PepCommonCardV2 />
```

### 自定义内容

```svelte
<script>
  import { PepCommonCardV2 } from 'pep-common-card-v2';
</script>

<PepCommonCardV2
  title="自定义标题"
  description="这是自定义的描述文本"
  buttonText="点我"
>
  <!-- 插槽内容 -->
  <p>这是通过插槽添加的自定义内容</p>
</PepCommonCardV2>
```

## 📦 Props API

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| className | string | '' | 自定义类名 |
| title | string | '组件标题' | 卡片标题 |
| description | string | '这是一个示例组件...' | 卡片描述文本 |
| buttonText | string | '点击增加' | 按钮文本 |

## 🔧 开发

```bash
# 开发模式
pnpm dev

# 构建
pnpm build

# 类型检查
pnpm check
```

## 🔄 变更记录

### 2025-12-23T11:29:57.898148
- ✅ 初始化组件结构
- ✅ 实现卡片展示功能
- ✅ 实现响应式计数器
- ✅ 实现按钮交互

## 📚 相关文档

- [详细规格说明](./spec.md)
- [开发日志](./DEVELOPMENT.md)
- [任务列表](./features.json)

---

**📌 维护规则**
- 本文档在初始化（/pep-start）和归档（/pep-done）时自动更新
- 核心功能进度与 features.json 保持同步
- Props API 与代码实际定义保持同步

## License

MIT

