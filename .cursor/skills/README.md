# PEP Skills

这个目录包含了 PEP 项目的 Cursor Skills，可以被 AI IDE 自动调用。

## 可用的 Skills

### @pep-init

快速初始化组件框架的 skill，无需交互式对话。

**用途**：
- 直接创建新组件的基础框架
- 自动生成所有必需的文件和目录
- 使用标准模板，保证可编译运行

**使用方式**：
```
@pep-init <component-name>
```

**示例**：
```
@pep-init pep-button
@pep-init pep-common-card
```

**与 /pep-start 的区别**：
- `/pep-start`：交互式命令，支持多种生成模式（标准模板、组件拷贝、AI 生成）
- `@pep-init`：非交互式 skill，仅支持标准模板，适合 AI 自动调用

**后续步骤**：
1. 运行 `/pep-spec <component-name>` 完善需求规格
2. 运行 `/pep-plan <component-name>` 生成开发任务
3. 运行 `/pep-next <component-name>` 开始开发

---

## Skills vs Commands

**Commands** (`/.cursor/commands/`)：
- 交互式，需要用户输入
- 支持复杂的对话流程
- 适合手动使用
- 示例：`/pep-start`, `/pep-spec`, `/pep-plan`

**Skills** (`/.cursor/skills/`)：
- 非交互式，直接执行
- 简化的流程，自动化程度高
- 适合 AI IDE 自动调用
- 示例：`@pep-init`

---

## 开发新的 Skill

如果需要添加新的 skill：

1. 在此目录创建新的 `.md` 文件
2. 遵循 skill 命名规范（kebab-case）
3. 编写清晰的执行流程和 Agent 行为指令
4. 确保无需用户交互即可完成
5. 更新本 README 文档
