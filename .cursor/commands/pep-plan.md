# PEP Plan - 生成开发任务

## 🎯 职责

根据完善的 `spec.md` 规格说明，智能生成详细的 `features.json` 任务列表。

**核心目标**：
1. 解析 spec.md 的需求
2. **识别公共能力与通用适配逻辑（优先原则）**
3. 拆解为可执行的小任务
4. 生成结构化的 features.json
5. 评估优先级和复杂度

**前置条件**：spec.md 已完善（运行过 `/pep-spec`）

**下一步**：运行 `/pep-next` 开始开发

---

## 📋 执行流程

### 阶段 0: 前置检查

```markdown
1. 检查组件是否存在
   components/<component-name>/ 不存在
   → 提示：请先运行 /pep-start 创建组件

2. 检查 spec.md 是否存在
   spec.md 不存在
   → 提示：文件缺失，请先运行 /pep-start

3. 读取 spec.md 内容
   → 进入【阶段 1：质量检查】

4. 检查现有 features.json
   - 如果已存在且有任务 → 进入【阶段 0A：覆盖确认】
   - 如果为空或不存在 → 直接进入【阶段 1】
```

#### 阶段 0A: 覆盖确认（如果 features.json 已存在）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  features.json 已存在

当前任务列表：
• 总任务数：8
• 已完成：2
• 进行中：1
• 待处理：5

重新生成将覆盖现有任务列表（已完成的任务会保留）。

是否继续？

A. 继续生成（覆盖待处理任务）
B. 取消（保持现有任务）

请回复
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Agent 行为指令**：
- 如果用户选择 A → 继续，但保留 status='completed' 的任务
- 如果用户选择 B → 取消，退出命令

---

### 阶段 1: spec.md 质量检查

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 正在分析 spec.md...

检查关键章节：
✅ 概述 - 已填写
✅ 核心功能 - 3 个功能模块，描述清晰
✅ Props 设计 - 5 个 Props，类型完整
✅ 验收标准 - 已定义

需求规格质量：高
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Agent 行为指令**：

如果 spec 质量不足，提示用户：

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  spec.md 信息不完整

缺少以下关键信息：
• 核心功能描述过于简单
• Props 设计缺失
• 验收标准未定义

建议先运行 /pep-spec 完善需求规格，再生成任务列表。

是否仍要继续？

A. 先完善 spec（推荐）
B. 继续生成（任务可能不够准确）

请回复
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- 如果用户选择 A → 提示运行 `/pep-spec`，退出当前命令
- 如果用户选择 B → 继续，但标注任务为"基于不完整 spec 生成"

---

### 阶段 2: 解析 spec.md

#### Agent 行为指令

```markdown
系统性地解析 spec.md，提取以下信息：

1. 【概述部分】
   - 组件定位和核心价值
   - 使用场景

2. 【核心功能】
   - 功能列表（每个功能点）
   - 功能描述
   - 功能依赖关系

3. 【Props 设计】
   - Props 列表
   - 类型定义
   - 默认值
   - 复杂度（简单值 vs 复杂对象）

4. 【事件设计】
   - 事件列表
   - 事件参数
   - 触发时机

5. 【样式要求】
   - 布局结构
   - 样式变体
   - 响应式要求
   - 动画效果

6. 【特殊需求】
   - 无障碍（a11y）
   - 性能优化
   - 浏览器兼容性

7. 【验收标准】
   - 功能测试点
   - UI 还原标准
   - 性能指标
```

---

### 阶段 3: 任务拆解与公共能力识别

#### Agent 行为指令

基于解析的信息，拆解任务，并**强制执行公共能力优先原则**：

1. **公共能力识别 (Public Capabilities First)**：
   - 检查是否引用了标准原子组件 (`PepFloorContainer`, `PepButton`, `PepTitle` 等)。
   - 检查是否涉及全局设计 Token 映射（字号、间距断点）。
   - 检查是否涉及通用适配逻辑（链接跳转适配、图片懒加载适配）。
   - **操作**：将这些任务归类为 `category: setup` 或高优先级的 `category: feature`，并在 `features.json` 中置顶。

2. **按开发阶段分层**：
   - **Public/Setup** (原子集成、类型契约、Token 映射) -> **必须最先执行**
   - **Feature** (业务逻辑、组件特有交互)
   - **Testing** (测试)
   - **Enhancement** (增强特性)
   - **Documentation** (文档)

3. **粒度控制**：
   - 每个任务 1-4 小时可完成
   - 复杂功能拆分为多个子任务
   - 简单功能合并为一个任务

4. **依赖关系**：
   - setup 任务优先级最高
   - feature 任务按依赖排序
   - testing 在 feature 之后
   - enhancement 优先级较低

【任务生成规则】

每个功能点 → 1-3 个任务
每个特殊需求 → 1 个任务
测试相关 → 1-2 个任务
文档相关 → 0-1 个任务（如需要）
```

#### 任务拆解示例

**spec 输入**：
```markdown
## 核心功能

### 功能 1: 轮播展示
- 支持多个 Banner 项循环播放
- 自动播放，可配置间隔时间
- 左右箭头手动切换

### 功能 2: 指示器
- 显示当前位置
- 点击跳转到指定项
```

**任务输出**：
```json
[
  {
    "id": "FEAT-001",
    "category": "feature",
    "priority": "high",
    "title": "实现轮播核心逻辑",
    "description": "实现 items 数组的循环切换，支持 next/prev 方法，处理边界情况（第一项/最后一项）",
    "status": "pending",
    "estimated_complexity": 2
  },
  {
    "id": "FEAT-002",
    "category": "feature",
    "priority": "high",
    "title": "实现自动播放功能",
    "description": "根据 autoPlay 和 interval props 实现定时切换，组件挂载时启动，卸载时清理",
    "status": "pending",
    "estimated_complexity": 2
  },
  {
    "id": "FEAT-003",
    "category": "feature",
    "priority": "high",
    "title": "实现切换箭头控件",
    "description": "添加左右箭头按钮，绑定 prev/next 事件，处理禁用状态（首尾项）",
    "status": "pending",
    "estimated_complexity": 1
  },
  {
    "id": "FEAT-004",
    "category": "feature",
    "priority": "medium",
    "title": "实现指示器组件",
    "description": "显示当前位置的指示点，高亮当前项，支持点击跳转",
    "status": "pending",
    "estimated_complexity": 2
  }
]
```

---

### 阶段 4: 评估复杂度和优先级

#### Agent 行为指令

```markdown
为每个任务评估：

【优先级】(priority)
- high: 核心功能，必须实现
- medium: 重要但非紧急
- low: 增强特性，可选

【复杂度】(estimated_complexity)
1 - 简单（1 小时内）
2 - 中等（2-3 小时）
3 - 复杂（3-4 小时）
4 - 很复杂（4-6 小时）
5 - 极复杂（需要拆分）

如果复杂度 = 5，自动拆分为多个子任务

【分类】(category)
- setup: 基础结构、类型定义
- feature: 功能实现
- testing: 测试相关
- enhancement: 性能优化、增强特性
- documentation: 文档完善
```

---

### 阶段 5: 生成 features.json

#### Agent 行为指令

```markdown
1. 生成完整的 JSON 结构
2. 任务排序：
   - 按 priority 排序（high → medium → low）
   - 同优先级按 category 排序（setup → feature → testing → enhancement → documentation）
3. 添加任务 ID（FEAT-001, FEAT-002...）
4. 所有任务 status 初始为 'pending'
5. 如果是覆盖模式，保留已完成的任务

features.json 格式：
[
  {
    "id": "FEAT-001",
    "category": "feature",
    "priority": "high",
    "title": "任务标题",
    "description": "详细描述",
    "status": "pending",
    "estimated_complexity": 2,
    "notes": "备注（可选）"
  }
]
```

---

### 阶段 6: 展示任务预览

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 任务拆解完成

📋 任务概览

总任务数：12

按优先级：
• 高优先级：5 个
• 中优先级：4 个
• 低优先级：3 个

按分类：
• 功能实现：7 个
• 测试：2 个
• 增强特性：2 个
• 文档：1 个

预估总工时：约 2-3 天

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 任务列表预览（前 5 个）

1. [high] 实现轮播核心逻辑（复杂度：2）
2. [high] 实现自动播放功能（复杂度：2）
3. [high] 实现切换箭头控件（复杂度：1）
4. [medium] 实现指示器组件（复杂度：2）
5. [medium] 完善样式实现（复杂度：3）
...

是否确认生成 features.json？[Y/n]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Agent 行为指令**：
- 用户确认后，使用 `write` 工具生成 features.json
- 进入【阶段 7：完成提示】

---

### 阶段 7: 完成提示

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ features.json 已生成！

📦 任务列表

components/<component-name>/features.json
• 总任务数：12
• 高优先级：5 个
• 预估工时：2-3 天

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 下一步操作

1️⃣  开始开发（推荐）
   /pep-next <component-name>
   
   AI 会自动选择下一个待开发任务

2️⃣  查看任务列表
   查看 features.json 了解所有任务

3️⃣  调整任务（如需要）
   手动编辑 features.json，或重新运行 /pep-plan
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示

• 任务按优先级和依赖关系排序
• /pep-next 会自动选择最优先的待处理任务
• 如需调整任务，可手动编辑 features.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎯 关键设计原则

### 1. 专注任务拆解
- 不再负责完善 spec（由 /pep-spec 负责）
- 只负责读取 spec 并拆解任务
- 如果 spec 质量低，提示用户先运行 /pep-spec

### 2. 智能拆解
- 基于功能点和复杂度拆解
- 任务粒度适中（1-4 小时）
- 自动识别依赖关系
- 合理评估优先级

### 3. 清晰的输出
- 结构化的 JSON 格式
- 完整的任务信息（ID / 标题 / 描述 / 优先级 / 复杂度）
- 预览任务列表
- 明确下一步操作

### 4. 可重复执行
- 支持重新生成（覆盖模式）
- 保留已完成的任务
- 提示用户确认覆盖

### 5. **公共能力优先**
- **强制识别标准原子组件、全局 Token 映射、通用适配逻辑**
- **在 features.json 中将公共能力任务置顶执行**

---

## 📤 features.json 标准格式

### 完整示例

```json
[
  {
    "id": "FEAT-001",
    "category": "feature",
    "priority": "high",
    "title": "实现轮播核心逻辑",
    "description": "实现 items 数组的循环切换，支持 next/prev 方法，处理边界情况（第一项/最后一项）",
    "status": "pending",
    "estimated_complexity": 2
  },
  {
    "id": "FEAT-002",
    "category": "feature",
    "priority": "high",
    "title": "实现自动播放功能",
    "description": "根据 autoPlay 和 interval props 实现定时切换，组件挂载时启动，卸载时清理",
    "status": "pending",
    "estimated_complexity": 2,
    "notes": "需要处理组件卸载时的定时器清理"
  },
  {
    "id": "TEST-001",
    "category": "testing",
    "priority": "medium",
    "title": "功能测试",
    "description": "测试轮播、控制器、指示器、事件等核心功能",
    "status": "pending",
    "estimated_complexity": 2
  },
  {
    "id": "ENH-001",
    "category": "enhancement",
    "priority": "low",
    "title": "移动端触摸手势支持",
    "description": "添加滑动手势支持（swipe left/right 切换）",
    "status": "pending",
    "estimated_complexity": 3,
    "notes": "可选特性，增强移动端交互体验"
  }
]
```

### 字段说明

| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| id | string | ✅ | 任务唯一标识（FEAT-xxx / TEST-xxx / ENH-xxx）|
| category | string | ✅ | 分类（setup / feature / testing / enhancement / documentation）|
| priority | string | ✅ | 优先级（high / medium / low）|
| title | string | ✅ | 任务标题（简洁描述）|
| description | string | ✅ | 详细描述（具体做什么）|
| status | string | ✅ | 状态（pending / completed）|
| estimated_complexity | number | ✅ | 预估复杂度（1-5）|
| actual_complexity | number | ❌ | 实际复杂度（完成后填写）|
| completed_at | string | ❌ | 完成时间（ISO 8601 格式）|
| notes | string | ❌ | 备注说明 |

---

## 🤔 典型使用场景

### 场景 A：首次生成任务

```
用户：/pep-start pep-button
用户：/pep-spec pep-button（完善需求）
用户：/pep-plan pep-button

Agent：
1. 检查 spec.md → 质量高
2. 解析 spec 提取信息
3. 拆解为 10 个任务
4. 生成 features.json
5. 提示运行 /pep-next
```

### 场景 B：需求变更后重新生成

```
用户完善了 spec.md，增加了新功能

用户：/pep-plan pep-button

Agent：
1. 检测到 features.json 已存在
2. 提示确认覆盖
用户：A（继续）
Agent：
3. 保留已完成的任务
4. 基于新 spec 重新生成待处理任务
5. 合并输出新的 features.json
```

### 场景 C：spec 不完整时的处理

```
用户：/pep-plan pep-form

Agent：
1. 检查 spec.md → 质量低（缺少核心信息）
2. 提示："建议先运行 /pep-spec 完善需求"
用户：B（继续生成）
Agent：
3. 基于不完整的 spec 尽力生成任务
4. 标注："基于不完整 spec 生成，可能需要调整"
5. 生成 features.json
```

---

## ⚠️  注意事项

1. **不要完善 spec**
   - 这是 /pep-spec 的职责
   - /pep-plan 只负责读取 and 拆解
   - 发现 spec 不完整时，提示用户先运行 /pep-spec

2. **任务粒度适中**
   - 每个任务 1-4 小时
   - 过大的任务自动拆分
   - 过小的任务合并

3. **保留已完成任务**
   - 重新生成时，不要删除 status='completed' 的任务
   - 保留其完成时间和复杂度数据

4. **清晰的依赖关系**
   - setup 任务优先级最高
   - 按功能依赖排序
   - 避免循环依赖

---

## 🎯 成功标准

- ✅ features.json 生成成功
- ✅ 任务拆解合理（粒度适中）
- ✅ 优先级和复杂度评估准确
- ✅ 任务按依赖关系排序
- ✅ JSON 格式正确（可被解析）
- ✅ 用户清楚下一步操作（运行 /pep-next）
