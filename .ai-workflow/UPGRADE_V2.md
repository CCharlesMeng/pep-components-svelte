# 升级到 V2.0 - Spec-First 工作流

## 🎉 重大升级

从传统的手动编写 `features.json` 模式，升级到规范的 **Spec-First** 工作流。

---

## 📋 主要变更

### 1. 统一命令行工具 `pep-dev`

**之前**: 需要记住和输入完整的 python 脚本路径
```bash
node scripts/next-task.js --component pep-button
node scripts/mark-done.js --component pep-button --feature-id 1
```

**现在**: 简洁的命令行工具
```bash
pep-dev next pep-button --save
pep-dev done pep-button 1 --tested
```

### 2. Spec-First 开发流程

**之前**: 手动编写或半自动生成 features.json
```bash
# 初始化生成模板
node scripts/init-component.js --component pep-button --features 20

# 手动修改 features.json
vim components/pep-button/features.json
```

**现在**: 从 spec.md 自动生成
```bash
# 1. 编写规格文档
vim components/pep-button/spec.md

# 2. 自动生成 features.json
pep-dev init pep-button
pep-dev spec pep-button

# 3. Cursor AI 根据 spec 生成精确的功能清单
```

### 3. 任务归档系统

**之前**: 多个文件混乱管理
```
.component-dev/
├── current_prompt.md        # 用途不清
├── session_state.json       # 很少使用
├── features-prompt.md       # 一次性文件
└── ...
```

**现在**: 清晰的归档机制
```
.cursor-session/
├── current-task.md          # 仅当前任务

.cursor-archive/
├── 20231218-001-基础结构.md  # 已完成任务归档
├── 20231218-002-Props.md
└── ...

.cursor-prompts/
└── generate-features.md     # AI提示词（按需生成）
```

### 4. 自动合规检查

**新增**: 代码生成后的验证环节
```bash
# 验证功能清单
pep-dev validate pep-button

# 合规性检查（技术栈、架构、规范）
pep-dev check pep-button

# 全局规则检查
pep-dev rules pep-button
```

---

## 🚀 快速开始

### 安装 pep-dev 命令

```bash
# 方式1: 软链接（推荐）
sudo ln -s /path/to/pep-components-svelte/cursor-autonomous-coding/pep-dev /usr/local/bin/pep-dev

# 方式2: alias
echo 'alias pep-dev="/path/to/pep-components-svelte/cursor-autonomous-coding/pep-dev"' >> ~/.zshrc
source ~/.zshrc

# 验证
pep-dev help
```

### 新建组件开发流程

```bash
# 1. 创建规格文档
mkdir -p components/pep-new-component
vim components/pep-new-component/spec.md

# 2. 初始化组件
pep-dev init pep-new-component

# 3. 生成 features.json
pep-dev spec pep-new-component
# 在 Cursor 中使用 AI 生成功能清单

# 4. 验证和检查
pep-dev validate pep-new-component
pep-dev check pep-new-component

# 5. 开始开发
pep-dev next pep-new-component --save

# 6. 在 Cursor 中开发
# @current-task.md 查看任务

# 7. 完成并归档
pep-dev done pep-new-component 1 --tested

# 8. 继续下一个
pep-dev next pep-new-component --save
```

---

## 🔄 迁移现有组件

### 如果组件还没有 spec.md

```bash
# 1. 创建 spec.md
vim components/pep-existing-component/spec.md

# 2. 备份现有 features.json
cp components/pep-existing-component/features.json{,.backup}

# 3. 重新生成（可选）
pep-dev spec pep-existing-component

# 4. 比较新旧版本，决定是否替换
diff features.json{,.backup}
```

### 如果组件已有 features.json

**可以继续使用！** V2.0 完全向后兼容：

```bash
# 继续使用现有的 features.json
pep-dev next pep-existing-component --save
pep-dev done pep-existing-component 5 --tested

# 建议：补充 spec.md 用于文档和后续维护
vim components/pep-existing-component/spec.md
```

---

## 📁 目录结构变更

### 组件目录

**V1.0**:
```
components/pep-button/
├── features.json
├── DEVELOPMENT.md
└── .component-dev/
    ├── current_prompt.md
    └── session_state.json
```

**V2.0**:
```
components/pep-button/
├── spec.md                  # ⭐ 新增：规格文档
├── features.json
├── DEVELOPMENT.md
├── .cursor-session/         # 当前会话
│   ├── current-task.md
│   └── session-history.json
├── .cursor-archive/         # ⭐ 新增：归档
│   ├── 20231218-001-xxx.md
│   └── ...
└── .cursor-prompts/         # AI提示词
    └── generate-features.md
```

**迁移建议**:
```bash
# 可以删除旧的 .component-dev/
rm -rf components/*/component-dev

# 或者重命名保留
mv .component-dev .component-dev.old
```

---

## 🎯 核心命令对照表

| V1.0 命令 | V2.0 命令 | 说明 |
|-----------|-----------|------|
| `node scripts/init-component.js --component X` | `pep-dev init X` | 初始化 |
| _(新功能)_ | `pep-dev spec X` | 生成features |
| `node scripts/next-task.js --component X` | `pep-dev next X --save` | 获取任务 |
| `node scripts/mark-done.js --component X --feature-id N` | `pep-dev done X N --tested` | 完成任务 |
| `node scripts/validate.js --component X` | `pep-dev validate X` | 验证清单 |
| _(新功能)_ | `pep-dev check X` | 合规检查 |
| _(新功能)_ | `pep-dev rules X` | 规则检查 |
| `node scripts/report.js --component X` | `pep-dev status X` | 查看进度 |
| `node scripts/monorepo-summary.js` | `pep-dev summary` | 整体进度 |

---

## ✨ 新功能

### 1. 合规性检查

```bash
pep-dev check pep-button

# 检查内容：
# ✅ 必需文件（spec.md, features.json, README.md）
# ✅ spec.md 与 features.json 一致性
# ✅ 技术栈一致性（Svelte, TypeScript）
# ✅ 架构规范
# ✅ 文档完整性
```

### 2. 全局规则验证

```bash
pep-dev rules pep-button

# 检查内容：
# ✅ 组件命名规范（pep-*）
# ✅ 文件命名规范（kebab-case）
# ✅ 代码质量标准
# ✅ Git 提交规范
# ✅ 无障碍要求
```

### 3. 自动归档

完成任务时自动归档：

```bash
pep-dev done pep-button 1 --tested

# 自动：
# ✓ 更新 features.json
# ✓ 归档到 .cursor-archive/20231218-001-xxx.md
# ✓ 清理 current-task.md
# ✓ 更新会话历史
```

### 4. Spec-First 工作流

```
spec.md (需求)
    ↓
AI 生成 features.json (任务)
    ↓
Cursor 开发 (实现)
    ↓
自动验证 (质量)
    ↓
归档 (沉淀)
```

---

## 🐛 破坏性变更

### 无破坏性变更！

V2.0 完全向后兼容 V1.0：
- ✅ 现有的 features.json 可以继续使用
- ✅ 现有的脚本命令仍然有效
- ✅ 可以逐步迁移到新工作流

---

## 📚 文档更新

新的文档结构：

```
docs/
├── README.md                # 文档索引
├── guides/
│   ├── 01-快速配置.md       # 首次配置
│   ├── 02-单组件开发.md     # ⭐ 更新：新工作流
│   └── 03-公共逻辑开发.md   # Monorepo共享代码
├── quickstart/
│   ├── QUICKSTART.md
│   └── 新功能快速参考.md
├── examples/
│   ├── EXAMPLE_MONOREPO_SETUP.md
│   └── example-spec.md      # ⭐ 新增：spec模板
└── technical/
    ├── ARCHITECTURE.md
    └── WORKFLOW_COMPARISON.md
```

---

## 💡 推荐实践

### 1. 新组件必须 Spec-First

```bash
# ✅ 推荐
vim spec.md         # 先写规格
pep-dev init X      # 再初始化
pep-dev spec X      # 生成功能清单

# ❌ 不推荐
# 直接写代码或手动编写 features.json
```

### 2. 使用命令行工具

```bash
# ✅ 推荐
pep-dev next pep-button --save

# ❌ 不推荐（但仍然有效）
node scripts/next-task.js --component pep-button
```

### 3. 定期验证

```bash
# 每完成 3-5 个功能后
pep-dev validate pep-button
pep-dev check pep-button
```

---

## ❓ 常见问题

### Q1: 必须升级吗？

**不是必须的**，但强烈推荐：
- 更规范的工作流
- 更好的任务管理
- 自动验证和归档
- 更简洁的命令

### Q2: 现有组件怎么办？

**可以继续使用**，无需改动：
```bash
# 继续使用现有的 features.json
pep-dev next pep-existing-component --save
```

**建议补充 spec.md**：
```bash
# 为现有组件补充规格文档
vim components/pep-existing-component/spec.md
```

### Q3: pep-dev 和 python scripts/ 有什么区别？

`pep-dev` 是对 python 脚本的封装：
- 更短的命令
- 更好的帮助信息
- 统一的入口
- 但底层仍是相同的 Python 脚本

### Q4: 归档文件可以删除吗？

**不建议删除**：
- 归档是知识沉淀
- 便于审计和追溯
- 文件很小，不占空间

如需清理，可以定期备份：
```bash
# 备份并清理旧归档
tar -czf archive-backup-$(date +%Y%m%d).tar.gz .cursor-archive/
mv .cursor-archive .cursor-archive.old
```

---

## 🎓 延伸阅读

- [02-单组件开发.md](./docs/guides/02-单组件开发.md) - 完整的新工作流指南
- [01-快速配置.md](./docs/guides/01-快速配置.md) - 首次配置
- [README.md](./README.md) - 项目总览

---

**欢迎使用 V2.0! 🚀**

