# PEP Init - 快速初始化组件框架

## 🎯 职责

快速初始化一个新的 PEP 组件基础框架，无需交互，直接生成可运行的组件骨架。

**核心目标**：
1. 直接生成可运行的组件骨架
2. 使用标准模板
3. 生成初始 `spec.md`
4. 为后续开发打好基础

**下一步**：运行 `/pep-spec` 完善需求规格

---

## 📋 使用方式

```markdown
# 直接调用
@pep-init <component-name>

# 示例
@pep-init pep-button
@pep-init pep-common-banner
```

---

## 🔧 执行流程

### 1. 参数验证

**Agent 行为指令**：

```markdown
1. 检查是否提供了组件名称
   - 如果没有提供 → 提示错误："请提供组件名称，例如：@pep-init pep-button"
   - 如果提供了 → 继续

2. 验证组件名称格式
   - 必须是 kebab-case 格式
   - 建议以 pep- 开头
   - 如果格式不正确 → 提示错误并建议正确格式

3. 检查组件是否已存在
   - 检查 components/<component-name>/ 目录
   - 如果已存在 → 提示错误："组件 <component-name> 已存在，请使用 /pep-spec 或 /pep-next"
   - 如果不存在 → 继续
```

---

### 2. 生成组件

**Agent 行为指令**：

```markdown
显示进度提示：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ 正在生成组件 <component-name>...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**调用 scaffold_component.py 脚本**：

```bash
python3 scripts/scaffold_component.py \
  --component <component-name> \
  --mode minimal \
  --template-data '{"description": "PEP 组件"}'
```

**注意事项**：
- 使用 `--mode minimal` 生成最小模板
- 脚本会自动创建所有必需的文件和目录
- 脚本会处理所有占位符替换
- 不要使用 read_file/write 工具逐个创建文件

---

### 3. 完成提示

**Agent 行为指令**：

```markdown
脚本执行成功后，显示完成信息：

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 组件初始化完成！

📦 生成内容

components/<component-name>/
├── ✅ src/<component-name>.svelte
├── ✅ src/types.ts
├── ✅ src/index.ts
├── ✅ spec.md
├── ✅ features.json
├── ✅ README.md
└── ✅ 配置文件（package.json, tsconfig.json 等）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 安装依赖与运行

⚠️  组件需要先安装依赖才能运行！

方案一：安装所有依赖（推荐）
\`\`\`bash
# 在项目根目录执行
pnpm install
\`\`\`

方案二：只安装当前组件依赖
\`\`\`bash
# 在项目根目录执行
pnpm install --filter <component-name>
\`\`\`

运行开发服务器：
\`\`\`bash
# 方式 1：使用根目录脚本（推荐）
npm run dev <component-name>

# 方式 2：进入组件目录运行
cd components/<component-name>
pnpm dev
\`\`\`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 继续开发

1️⃣  完善需求规格（推荐）
   /pep-spec <component-name>
   
   通过对话澄清需求细节，完善 spec.md

2️⃣  生成开发任务
   /pep-plan <component-name>
   
   基于完善的 spec.md 生成 features.json

3️⃣  开始开发
   /pep-next <component-name>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示

• spec.md 是初始草稿，运行 /pep-spec 通过对话完善
• 建议：安装依赖 → 完善 spec → 生成任务 → 开发

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**确保所有 \`<component-name>\` 占位符都替换为实际的组件名称！**

---

## 📤 输出内容

### 必须生成的文件

```
components/<component-name>/
├── src/
│   ├── <component-name>.svelte   # 组件主文件
│   ├── types.ts                   # 类型定义
│   ├── index.ts                   # 导出文件
│   └── routes/                    # 开发路由
│       ├── +layout.svelte
│       └── +page.svelte
├── package.json                   # 包配置
├── tsconfig.json                  # TS 配置
├── vite.config.ts                 # Vite 配置
├── svelte.config.js               # Svelte 配置
├── spec.md                        # 需求规格（草稿）
├── features.json                  # 任务列表（初始为空）
├── README.md                      # 组件文档
└── DEVELOPMENT.md                 # 开发日志
```

### 文件内容要求

#### spec.md
- 包含基础结构（概述、核心功能、Props、验收标准）
- 使用标准模板示例内容
- 标注待完善部分

#### README.md
- 包含组件状态（🟡 开发中）
- 初始化时间
- 基础使用示例
- 明确维护规则

#### features.json
- 初始为空数组 \`[]\`
- 由 \`/pep-plan\` 命令生成

---

## ⚠️  注意事项

1. **自动执行**
   - 无需用户确认，直接执行
   - 发生错误时才需要人工介入
   - 适合 AI IDE 自动调用

2. **标准模板**
   - 始终使用系统标准模板
   - 不支持组件拷贝或 AI 生成
   - 保证可编译运行

3. **简洁输出**
   - 避免冗长的说明
   - 重点展示生成的文件和下一步操作
   - 提供可直接复制的命令

4. **占位符替换**
   确保所有占位符都正确替换：
   - \`{{COMPONENT_NAME}}\` → kebab-case（如 pep-button）
   - \`{{COMPONENT_NAME_PASCAL}}\` → PascalCase（如 PepButton）
   - \`{{DESCRIPTION}}\` → 组件描述
   - \`{{INIT_DATE}}\` → 当前日期（YYYY-MM-DD）

---

## 🔧 实现提示

### 错误处理

\`\`\`markdown
如果脚本执行失败：

1. 检查脚本是否存在
   ls -la scripts/scaffold_component.py

2. 检查 Python 环境
   python3 --version

3. 显示错误信息和建议：
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ❌ 组件生成失败
   
   错误信息：
   [显示脚本输出的错误]
   
   建议：
   • 检查脚本是否存在：scripts/scaffold_component.py
   • 确认 Python 3 已安装
   • 查看详细日志了解问题
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
\`\`\`

### 组件名称转换

\`\`\`javascript
// kebab-case to PascalCase
function toPascalCase(kebabCase) {
  return kebabCase
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// 示例
'pep-button' → 'PepButton'
'pep-common-banner-v2' → 'PepCommonBannerV2'
\`\`\`

---

## 🎯 成功标准

- ✅ 组件目录创建完整
- ✅ 所有必需文件存在
- ✅ 占位符正确替换
- ✅ 代码可编译运行（npm run dev 不报错）
- ✅ spec.md 包含基础结构
- ✅ README.md 包含使用说明
- ✅ 用户清楚下一步操作（运行 /pep-spec）
- ✅ 无需用户交互，自动完成

---

## 🆚 与 pep-start 的区别

| 特性 | pep-start | pep-init |
|------|-----------|----------|
| 交互方式 | 多轮对话 | 无交互 |
| 生成模式 | 三种模式可选 | 仅标准模板 |
| 组件拷贝 | 支持 | 不支持 |
| AI 生成 | 支持 | 不支持 |
| 需求收集 | 交互式收集 | 不收集 |
| 适用场景 | 手动使用 | AI 自动调用 |
| 执行速度 | 较慢（需交互） | 快速（无交互） |

**使用建议**：
- 手动创建组件：使用 \`/pep-start\`（功能更丰富）
- AI 自动创建：使用 \`@pep-init\`（快速简洁）
