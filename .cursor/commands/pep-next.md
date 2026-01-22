# PEP Next - 获取下一个任务

## 🎯 职责

智能获取下一个开发任务，并准备开发环境。

**核心目标**：
1. 检测当前开发状态
2. 获取下一个待办任务
3. 准备任务上下文
4. 引导开发者开始工作

---

## 📋 执行流程

### 阶段 0: 状态检测（关键！）

```markdown
按优先级检查以下状态：

1. 检查组件是否存在
   ❌ 不存在 → 引导到场景 A（新组件）

2. 检查是否有未提交代码
   ❌ 有未提交 → 引导到场景 B（未完成任务）

3. 检查是否有进行中任务
   ❌ 有进行中 → 引导到场景 C（继续任务）

4. 检查是否有待办任务
   ❌ 无待办 → 引导到场景 D（已完成）

5. 检查 features.json 是否为空
   ❌ 为空 → 引导到场景 E（无任务）

✅ 所有检查通过 → 进入正常流程
```

---

### 场景 A: 新组件（组件不存在）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 组件不存在

组件 'pep-new-component' 尚未初始化。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 请先初始化组件

/pep-start pep-new-component

这将生成：
• 可运行的组件脚手架
• spec.md 草稿（或空模板）
• 基础开发环境

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示

初始化时可选择：
• 智能问答模式 → 生成定制脚手架
• 快速模式 (--quick) → 生成最小脚手架

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 场景 B: 未完成任务（有未提交代码）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  检测到未提交的代码

当前状态:
• 修改文件: 3 个
  - src/pep-common-banner.svelte
  - src/types.ts
  - src/styles.scss

• 当前任务: [FEAT-003] 实现轮播逻辑
• 任务状态: in_progress
• 开始时间: 2025-12-18 10:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤔 接下来怎么做？

选项 1: 继续当前任务（推荐）
   继续实现 [FEAT-003] 实现轮播逻辑

选项 2: 完成并提交
   如果任务已完成，运行：
   /pep-done pep-common-banner FEAT-003

选项 3: 放弃修改
   如果要丢弃修改并开始新任务：
   git checkout .
   然后重新运行 /pep-next

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 任务详情

标题: 实现轮播逻辑
描述: 实现 next/prev/goTo 方法和自动播放功能

验收标准:
• next/prev 方法正确切换索引
• goTo 方法可跳转到指定索引
• 自动播放定时器正常工作
• 边界情况处理（空数组、单项等）

技术要点:
• 使用取模运算处理边界
• onMount 启动定时器
• onDestroy 清理定时器

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 场景 C: 继续任务（无未提交代码，但有进行中任务）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  检测到进行中任务

当前状态:
• 当前任务: [FEAT-003] 实现轮播逻辑
• 任务状态: in_progress
• 开始时间: 2025-12-18 10:30
• 工作目录: 干净（无未提交代码）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤔 状态不一致？

可能的情况:
1. 代码已提交，但忘记标记任务完成
2. 代码被回滚或重置
3. 会话状态未同步

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 建议操作

选项 1: 继续当前任务
   如果任务确实未完成，继续实现

选项 2: 标记任务完成
   如果任务已完成但未标记：
   /pep-done pep-common-banner FEAT-003

选项 3: 重置任务状态
   如果要放弃当前任务：
   pep-dev reset pep-common-banner FEAT-003

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 任务详情

[显示任务详情，同场景 B]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 场景 D: 已完成（无待办任务）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 恭喜！所有任务已完成

组件: pep-common-banner

进度统计:
• 总任务: 25 个
• 已完成: 25 个
• 完成率: 100%

最后完成:
• [TEST-003] 浏览器兼容性测试
• 完成时间: 2025-12-18 15:30

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 后续工作建议

1️⃣  代码审查
   • 检查代码质量
   • 运行完整测试套件
   • 检查文档完整性

2️⃣  发布准备
   • 更新 CHANGELOG
   • 标记版本号
   • 准备发布说明

3️⃣  新增需求
   如有新需求，可以：
   • 更新 spec.md
   • 运行 /pep-plan 生成新任务

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 场景 E: 无任务列表（features.json 为空）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  未找到任务列表

组件 'pep-common-banner' 已初始化，但 features.json 为空。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 请先生成任务列表

方案 1: 基于 spec.md 生成（推荐）

1. 编写或完善 spec.md
   vim components/pep-common-banner/spec.md

2. 生成任务列表
   /pep-plan pep-common-banner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方案 2: 手动编写 features.json

vim components/pep-common-banner/features.json

参考格式: docs/examples/example-features.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示

推荐使用方案 1，AI 会根据 spec.md 智能生成完整的任务列表。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 正常流程: 获取下一个任务

#### 阶段 1: 选择任务

```markdown
任务选择策略：

1. 过滤可执行任务
   - status = "pending"
   - 依赖任务已完成

2. 按优先级排序
   - critical > high > medium > low

3. 同优先级按复杂度
   - 简单任务优先（快速推进）
   - 或复杂任务优先（啃硬骨头）
   
   由 AI 根据上下文判断：
   - 如刚开始 → 简单任务建立信心
   - 如快完成 → 复杂任务收尾
```

#### 阶段 2: 准备任务上下文

```markdown
1. 更新任务状态
   - status: pending → in_progress
   - started_at: 当前时间

2. 保存任务到会话
   - .component-dev/current-task.md

3. 收集相关信息
   - 任务依赖的已完成任务
   - 相关的代码文件
   - 相关的测试文件

4. 生成实现提示
   - 技术要点
   - 参考代码
   - 注意事项
```

---

## 📤 输出格式

### 成功输出（获取到任务）

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 下一个任务

[FEAT-003] 实现轮播逻辑

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 任务详情

类别: feature (核心功能)
优先级: high
复杂度: 5/10 (中等)
预计时间: 3-4 小时

描述:
实现轮播的核心逻辑，包括：
• next() 方法 - 切换到下一个
• prev() 方法 - 切换到上一个
• goTo(index) 方法 - 跳转到指定位置
• 自动播放功能（可选）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 验收标准

功能要求:
• next/prev 方法正确切换索引
• goTo 方法可跳转到指定索引
• 循环处理（到达末尾回到开头）
• 边界情况处理（空数组、单项）

技术要求:
• 使用响应式状态（Svelte reactive）
• 类型安全（TypeScript）
• 代码注释清晰

测试要求:
• 手动测试切换功能
• 验证边界情况

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 技术要点

1. 索引计算（处理循环）
```typescript
// 下一个
currentIndex = (currentIndex + 1) % items.length;

// 上一个
currentIndex = (currentIndex - 1 + items.length) % items.length;
```

2. 自动播放（如需要）
```typescript
let timer: number | null = null;

onMount(() => {
  if (autoPlay) {
    timer = setInterval(next, interval);
  }
});

onDestroy(() => {
  if (timer) clearInterval(timer);
});
```

3. 边界处理
```typescript
if (items.length === 0) return; // 空数组
if (items.length === 1) return; // 单项无需切换
```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 相关文件

需要修改:
• src/pep-common-banner.svelte (主文件)
• src/types.ts (如需添加类型)

可参考:
• components/pep-other-carousel/src/*.svelte (如有类似组件)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 依赖任务

以下任务已完成，可以作为基础：
✅ [FEAT-001] 实现 Props 接口
✅ [FEAT-002] 实现状态管理

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 进度概览

当前进度: 8/25 (32%)
已完成: 8 个
进行中: 1 个 (当前任务)
待开始: 16 个

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 开发提示

1. 先实现基础切换逻辑（next/prev）
2. 测试边界情况
3. 再添加自动播放（如需要）
4. 考虑用户交互时暂停自动播放

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 开始实现

现在可以开始实现这个任务。
完成后运行:

/pep-done pep-common-banner FEAT-003

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧠 关键技术点

### 1. 智能状态检测

```typescript
function detectState(component: string): State {
  // 1. 组件存在性
  if (!componentExists(component)) {
    return State.NewComponent;
  }
  
  // 2. Git 状态
  const gitStatus = checkGitStatus(component);
  if (gitStatus.hasUncommitted) {
    return State.UnfinishedTask;
  }
  
  // 3. 会话状态
  const session = loadSessionState(component);
  if (session.currentTask && session.currentTask.status === 'in_progress') {
    return State.InProgress;
  }
  
  // 4. 任务列表
  const features = loadFeatures(component);
  const pending = features.filter(f => f.status === 'pending' && !hasDependencies(f));
  if (pending.length === 0) {
    return features.every(f => f.status === 'completed')
      ? State.AllCompleted
      : State.NoTask;
  }
  
  return State.Normal;
}
```

### 2. 任务选择算法

```typescript
function selectNextTask(features: Feature[]): Feature {
  // 过滤可执行任务
  const executable = features.filter(f => 
    f.status === 'pending' &&
    f.dependencies.every(depId => 
      features.find(x => x.id === depId)?.status === 'completed'
    )
  );
  
  // 按优先级分组
  const groups = groupBy(executable, 'priority');
  const priorityOrder = ['critical', 'high', 'medium', 'low'];
  
  for (const priority of priorityOrder) {
    const tasks = groups[priority] || [];
    if (tasks.length > 0) {
      // 同优先级按复杂度排序
      return sortByComplexity(tasks)[0];
    }
  }
  
  return null;
}
```

### 3. 上下文准备

```typescript
function prepareTaskContext(task: Feature, component: string): TaskContext {
  return {
    task,
    relatedFiles: findRelatedFiles(task, component),
    completedDependencies: getCompletedDependencies(task),
    technicalHints: generateTechnicalHints(task),
    references: findReferenceCode(task),
  };
}
```

---

## 🔧 执行指南

### 作为 AI，您需要：

1. **彻底检查状态**
   - 不要跳过任何检查
   - 根据状态给出准确引导

2. **清晰的任务呈现**
   - 任务描述具体
   - 验收标准明确
   - 技术提示有价值

3. **有用的上下文**
   - 提供代码示例
   - 指出相关文件
   - 说明依赖关系

4. **友好的引导**
   - 告诉用户下一步做什么
   - 提供多种选项（如适用）
   - 鼓励和支持

---

## ⚠️  注意事项

1. **状态检测优先**
   - 必须先检测状态
   - 根据状态输出不同内容
   - 不要在异常状态下继续

2. **不要丢失进度**
   - 有进行中任务时警告
   - 有未提交代码时阻止

3. **依赖关系检查**
   - 确保依赖任务已完成
   - 不要分配无法执行的任务

4. **提供完整信息**
   - 任务详情完整
   - 技术提示有价值
   - 验收标准可执行

---

## 底层脚本调用

```bash
# 获取下一个任务
node scripts/next-task.js \
  --component <component-name>

# 输出:
# - 任务详情 JSON
# - 相关文件列表
# - 技术提示
```

---

## 🎯 成功标准

- ✅ 状态检测准确（识别所有异常状态）
- ✅ 任务选择合理（优先级、依赖关系正确）
- ✅ 上下文完整（技术提示、相关文件、验收标准）
- ✅ 引导清晰（用户知道下一步做什么）
- ✅ 会话状态已更新（任务标记为 in_progress）

