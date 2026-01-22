# PEP 组件工具脚本

这个目录包含用于 PEP 组件开发的工具脚本。

## 脚本列表

### 1. copy-template.js

**用途**: 从现有组件拷贝结构创建新组件

**功能**:
- 从现有组件完整拷贝文件结构
- 自动替换所有组件名称（支持多种命名格式）
- 可选地清理 spec.md、features.json、DEVELOPMENT.md
- 更新 package.json 中的组件信息
- 保证拷贝出的组件可以直接编译运行

**使用方法**:

```bash
# 基础用法：从 pep-notice 拷贝创建 pep-new-alert
node scripts/copy-template.js \
  --source pep-notice \
  --target pep-new-alert

# 拷贝并清理文档（推荐用于快速开始）
node scripts/copy-template.js \
  --source pep-notice \
  --target pep-new-alert \
  --clean-spec \
  --clean-features \
  --clean-dev
```

**命名格式替换**:

脚本会自动处理以下命名格式的替换：
- `pep-notice` → `pep-new-alert` (kebab-case)
- `PepNotice` → `PepNewAlert` (PascalCase)
- `pepNotice` → `pepNewAlert` (camelCase)
- `pep_notice` → `pep_new_alert` (snake_case)
- `PEP_NOTICE` → `PEP_NEW_ALERT` (UPPER_SNAKE_CASE)

**参数说明**:
- `--source`: 源组件名称（必需）
- `--target`: 目标组件名称（必需）
- `--clean-spec`: 清空 spec.md，使用模板
- `--clean-features`: 清空 features.json，生成初始任务
- `--clean-dev`: 清空 DEVELOPMENT.md

---

### 2. scaffold-component.js

**用途**: 基于模板创建新组件

**功能**:
- 从 `.ai-workflow/templates/component/` 拷贝基础模板
- 替换模板中的占位符（如 `{{COMPONENT_NAME}}`）
- 支持 AI 定制增强（根据需求数据生成代码）

**使用方法**:

```bash
node scripts/scaffold-component.js \
  --component pep-new-component \
  --mode minimal \
  --template-data '{"description": "新组件描述"}'
```

**模式说明**:
- `minimal`: 最小脚手架
- `standard`: 标准脚手架
- `custom`: 定制脚手架（需要提供 template-data）

---

### 3. generate-features.js

**用途**: 生成或更新 features.json 文件

**使用方法**:

```bash
node scripts/generate-features.js --component pep-new-component
```

---

### 4. dev-pkg.js

**用途**: 开发工具脚本，用于启动特定组件的开发服务器。

**使用方法**:

```bash
pnpm run dev <package-name>
# 或者直接运行
node scripts/dev-pkg.js <package-name>
```

---

## 与 pep-start 指令的集成

这些脚本被 `/pep-start` 指令调用，用于初始化新组件：

### 快速模式 - 选项 1: 模板拷贝

```
/pep-start pep-new-component --quick
→ 选择 1（模板拷贝）
→ 推荐：0（系统预制模板）【默认】
→ 可选：输入 'list' 查看现有组件（最多推荐3个相似的）
```

#### 方式 A: 系统预制模板（推荐）

```
→ 选择 0 或直接回车
→ 调用 scaffold-component.js
```

**优点**: 
- ✅ 保证能够编译运行
- ✅ 最干净、最标准的组件结构
- ✅ 没有多余的业务逻辑
- ✅ 适合所有组件类型

**缺点**:
- ⚠️ 需要从零开始实现功能

#### 方式 B: 现有组件拷贝（不推荐）

```
→ 输入 'list' 查看可用组件
→ 选择参考组件（如 pep-notice）
→ 调用 copy-template.js
```

**优点**: 
- ✅ 保证能够编译运行
- ✅ 可以参考现有实现
- ✅ 继承参考组件的最佳实践

**缺点**:
- ⚠️ 可能包含不需要的业务逻辑
- ⚠️ 需要仔细审查并删除多余代码
- ⚠️ 仅适合结构相似的组件

### 快速模式 - 选项 2: AI 生成

```
/pep-start pep-new-component --quick
→ 选择 2（AI 生成）
→ 简单描述组件功能
→ 调用 scaffold-component.js
```

**优点**:
- ✅ 更贴近实际需求
- ✅ 自动生成相关代码结构

**缺点**:
- ⚠️ 不保证能够直接运行
- ⚠️ 可能需要调试

---

## 开发指南

### 添加新脚本

1. 创建新的 `.js` 文件
2. 遵循现有脚本的结构和风格
3. 更新此 README 文件

### 脚本规范

- 使用 Node.js 20+
- 添加清晰的文档注释
- 使用 `node:util` 的 `parseArgs` 处理命令行参数
- 提供友好的错误信息
- 使用 `path.resolve(__dirname, '..')` 获取项目根目录

---

## 故障排除

### 脚本无法执行

确保已安装依赖：
```bash
pnpm install
```

### 组件拷贝失败

```bash
# 检查源组件是否存在
ls components/

# 查看可用组件列表
node scripts/copy-template.js --source nonexistent --target test
```

### Node.js 版本问题

```bash
# 检查 Node.js 版本
node --version  # 建议 20+
```