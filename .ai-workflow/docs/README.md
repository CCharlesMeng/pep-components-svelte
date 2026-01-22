# 📚 Cursor自主编码流程 - 文档中心

欢迎来到Cursor自主编码流程的文档中心！

---

## 🚀 核心指南（3篇）

### [01-快速配置.md](./guides/01-快速配置.md) ⭐
**首次使用必读！** 5分钟完成配置，包括：
- 安装和验证
- Monorepo vs 标准项目选择
- 全局规则配置
- 全自动化模式

### [02-单组件开发.md](./guides/02-单组件开发.md) 🎯
**Monorepo单组件开发完整流程**，包括：
- 初始化组件
- 编写功能清单
- 获取任务 → Cursor开发 → 标记完成
- 进度追踪
- 最佳实践

### [03-公共逻辑开发.md](./guides/03-公共逻辑开发.md) 🔧
**开发Monorepo公共代码**，包括：
- 公共工具包（shared-utils）
- 公共样式包（shared-styles）
- 全局配置文件
- 全局规则系统
- 公共构建脚本

---

## 📂 完整文档结构

```
docs/
├── README.md                      # 本文件 - 文档索引
│
├── guides/                        # 📖 核心指南（3篇）
│   ├── 01-快速配置.md             # 首次使用配置
│   ├── 02-单组件开发.md           # 单组件开发流程
│   └── 03-公共逻辑开发.md         # 公共代码开发
│
├── quickstart/                    # 🚀 快速参考
│   ├── QUICKSTART.md             # 5分钟快速上手
│   └── 新功能快速参考.md          # v1.2新功能
│
├── examples/                      # 💡 示例教程
│   ├── EXAMPLE_MONOREPO_SETUP.md # Monorepo完整示例
│   └── example-spec.md           # 项目规格示例
│
└── technical/                     # 🔧 技术文档
    ├── ARCHITECTURE.md            # 架构设计
    └── WORKFLOW_COMPARISON.md     # 与Claude SDK对比
```

---

## 🎯 按场景查找文档

### 我是新手，第一次使用

1. **必读**: [01-快速配置.md](./guides/01-快速配置.md)
2. **快速上手**: [QUICKSTART.md](./quickstart/QUICKSTART.md)
3. 根据项目类型选择：
   - Monorepo → [02-单组件开发.md](./guides/02-单组件开发.md)
   - 标准项目 → 直接使用 `next-task.js` 命令

### 我要开发单个组件（Monorepo）

1. [02-单组件开发.md](./guides/02-单组件开发.md) - 完整开发流程
2. [EXAMPLE_MONOREPO_SETUP.md](./examples/EXAMPLE_MONOREPO_SETUP.md) - 实际示例

### 我要开发Monorepo的公共代码

1. [03-公共逻辑开发.md](./guides/03-公共逻辑开发.md) - 公共包开发指南
2. 了解如何创建和管理：
   - 公共工具包（shared-utils）
   - 公共样式包（shared-styles）
   - 全局配置文件
   - 全局规则

### 我想了解技术原理

1. [ARCHITECTURE.md](./technical/ARCHITECTURE.md) - 架构设计
2. [WORKFLOW_COMPARISON.md](./technical/WORKFLOW_COMPARISON.md) - 与Claude SDK对比

---

## 🔍 常用命令速查

### Monorepo模式

```bash
# 初始化组件
node scripts/init-component.js --component <组件名>

# 获取任务
node scripts/next-task.js --component <组件名> --save

# 标记完成
node scripts/mark-done.js --component <组件名> --feature-id <ID>

# 查看进度
node scripts/report.js --component <组件名>

# 全局汇总
node scripts/monorepo-summary.js

# 验证全局规则
node scripts/validate-global-rules.js --component <组件名>

# 全自动化模式
node scripts/auto-develop.js --component <组件名>
```

### 标准项目模式

```bash
# 初始化项目
node scripts/init-project.js --spec spec.md

# 获取任务
node scripts/next-task.js --save

# 标记完成
node scripts/mark-done.js --feature-id <ID>

# 查看进度
node scripts/report.js

# 验证清单
node scripts/validate.js
```

---

## 📖 学习路径

### 新手路径（推荐）

```
1. 阅读 01-快速配置.md
   └─> 完成安装和配置

2. 根据项目类型选择：
   
   Monorepo项目:
   └─> 阅读 02-单组件开发.md
       └─> 开始第一个组件开发
           └─> 如需开发公共代码，阅读 03-公共逻辑开发.md
   
   标准项目:
   └─> 直接使用命令开始开发
       └─> node scripts/init-project.js --spec spec.md
```

### 进阶路径

```
1. 查看 EXAMPLE_MONOREPO_SETUP.md 了解完整实例
2. 阅读 ARCHITECTURE.md 理解技术架构
3. 阅读 WORKFLOW_COMPARISON.md 了解与Claude SDK的区别
4. 探索 新功能快速参考.md 了解v1.2新特性
```

---

## 💡 核心概念

### features.json - 功能清单

所有项目/组件的**唯一真实来源**，定义：
- 功能列表
- 状态追踪
- 依赖关系
- 测试标准

```json
{
  "features": [
    {
      "id": 1,
      "name": "功能名称",
      "description": "详细描述",
      "status": "pending|in_progress|completed",
      "priority": "high|medium|low",
      "dependencies": [前置功能ID],
      "test_criteria": ["如何验证"]
    }
  ]
}
```

### 工作流程

```
1. 获取任务
   node scripts/next-task.js --save

2. Cursor中开发
   复制提示词 → AI对话 → 编码

3. 标记完成
   node scripts/mark-done.js --feature-id N

4. 提交代码
   git commit

5. 重复1-4
```

### Monorepo vs 标准项目

| 特性 | Monorepo模式 | 标准项目模式 |
|------|-------------|------------|
| **适用场景** | 100+组件，多人维护 | 单体应用，中小型项目 |
| **命令参数** | 需要 `--component` | 无需 `--component` |
| **功能清单位置** | `components/xxx/features.json` | `features.json` |
| **全局汇总** | ✅ 支持 `monorepo-summary.js` | ❌ 不需要 |
| **全局规则** | ✅ 支持 `global-rules.json` | ❌ 不需要 |

---

## 🆘 需要帮助？

### 遇到问题

1. 查看对应指南的"常见问题"章节
2. 运行 `node scripts/validate.js` 检查配置
3. 查看 `DEVELOPMENT.md` 了解开发历史

### 找不到文档

- **快速上手** → [01-快速配置.md](./guides/01-快速配置.md)
- **组件开发** → [02-单组件开发.md](./guides/02-单组件开发.md)
- **公共代码** → [03-公共逻辑开发.md](./guides/03-公共逻辑开发.md)
- **命令不会用** → 查看本页的"常用命令速查"
- **看示例** → [examples/](./examples/)

---

## 🔗 相关链接

- [主README](../README.md) - 项目主页
- [CHANGELOG](../CHANGELOG.md) - 更新日志
- [LICENSE](../LICENSE) - 开源许可

---

**文档精简说明**:

✅ **保留3个核心指南** - 覆盖所有使用场景  
✅ **删除冗余文档** - 避免重复和混乱  
✅ **清晰的学习路径** - 新手快速上手  

**祝使用愉快！** 🚀
