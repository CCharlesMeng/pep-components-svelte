# PEP Check - 状态检查

## 🎯 职责

智能检测组件的当前开发状态，并提供合适的操作建议。

**核心目标**：
1. 全面诊断组件状态
2. 识别问题和不一致
3. 提供明确的操作建议
4. 防止状态混乱

---

## 📋 执行流程

### 阶段 1: 基础检查

```markdown
1. 组件存在性
   ✅ 存在
   ❌ 不存在 → 提示运行 /pep-start

2. 目录结构完整性
   检查必需文件:
   • src/组件.svelte
   • src/types.ts
   • package.json
   • spec.md
   • features.json
   
   ⚠️  缺少文件 → 列出并提示

3. features.json 有效性
   • JSON 格式正确
   • 必需字段完整
   • ID 无重复
   
   ❌ 无效 → 提示修复或重新生成
```

---

### 阶段 2: Git 状态检查

```markdown
1. 工作目录状态
   $ git status components/pep-common-banner/
   
   情况 A: 干净（无修改）
   ✅ 状态正常
   
   情况 B: 有未暂存修改
   ⚠️  修改文件: 3 个
       - src/pep-common-banner.svelte
       - src/types.ts
       - src/styles.scss
   
   情况 C: 有已暂存修改
   ⚠️  已暂存: 2 个
       - src/pep-common-banner.svelte
       - src/types.ts
   
   情况 D: 有未跟踪文件
   ⚠️  未跟踪: 1 个
       - src/new-file.ts

2. 最近提交记录
   $ git log -5 --oneline -- components/pep-common-banner/
   
   abc123d feat(pep-common-banner): 实现轮播逻辑
   def456a feat(pep-common-banner): 添加 Props 接口
   ghi789b feat(pep-common-banner): 初始化组件
```

---

### 阶段 3: 会话状态检查

```markdown
1. 当前任务
   读取: .component-dev/session_state.json
   
   情况 A: 无当前任务
   ✅ 可以开始新任务
   
   情况 B: 有当前任务
   📋 当前任务: [FEAT-003] 实现轮播逻辑
   • 状态: in_progress
   • 开始时间: 2025-12-18 10:30
   • 已进行: 4小时

2. 会话历史
   • 总会话数: 15 次
   • 最近活动: 2025-12-18 14:30
   • 已完成任务: 8 个
```

---

### 阶段 4: 任务进度检查

```markdown
1. 任务统计
   读取: features.json
   
   • 总任务: 25 个
   • 已完成: 8 个 (32%)
   • 进行中: 1 个
   • 待开始: 16 个
   • 已阻塞: 0 个

2. 依赖关系
   检查任务依赖:
   
   ✅ 无循环依赖
   ✅ 依赖关系清晰
   
   或
   
   ❌ 发现循环依赖:
       FEAT-003 → FEAT-005 → FEAT-003
   
   ❌ 发现孤立任务:
       TEST-001 依赖 FEAT-999（不存在）

3. 优先级分布
   • critical: 2 个
   • high: 10 个
   • medium: 8 个
   • low: 5 个
```

---

### 阶段 5: 状态一致性检查

```markdown
检查各处状态是否一致:

1. Git vs 会话状态
   
   一致性场景:
   ✅ 有修改 + 有进行中任务
   ✅ 无修改 + 无进行中任务
   
   不一致场景:
   ⚠️  有修改 但 无进行中任务
       → 可能忘记标记任务开始
   
   ⚠️  无修改 但 有进行中任务
       → 可能代码被回滚或已提交但未标记完成

2. features.json vs 会话状态
   
   一致性场景:
   ✅ 会话中的任务在 features.json 中存在
   ✅ 任务状态一致
   
   不一致场景:
   ❌ 会话中的任务不存在
       → 可能 features.json 被修改
   
   ❌ 状态不一致
       → features.json 显示 completed
       → 会话显示 in_progress

3. 代码 vs 任务描述
   
   检查已完成任务的 commit:
   ✅ 所有已完成任务都有 commit
   
   或
   
   ⚠️  任务 FEAT-002 标记完成但无 commit
       → 可能忘记提交或 commit hash 未记录
```

---

### 阶段 6: 代码质量检查

```markdown
1. TypeScript 检查
   $ tsc --noEmit
   
   ✅ 无类型错误
   
   或
   
   ❌ 3 个类型错误:
       src/types.ts:12:5 - error TS2304
       src/component.svelte:45:10 - error TS2339

2. Lint 检查
   $ eslint components/pep-common-banner/
   
   ✅ 无 lint 错误
   
   或
   
   ⚠️  5 个警告:
       src/component.svelte:23 - unused variable
       src/component.svelte:45 - missing semicolon

3. 编译检查
   $ npm run build
   
   ✅ 编译成功
   
   或
   
   ❌ 编译失败:
       [错误信息]
```

---

## 📤 输出格式

### 情况 A: 状态正常

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ 状态检查完成

组件: pep-common-banner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 基础信息

• 组件存在: ✅
• 目录结构: ✅ 完整
• features.json: ✅ 有效（25 个任务）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Git 状态

• 工作目录: ✅ 干净
• 最近提交: abc123d - feat: 实现轮播逻辑 (2小时前)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 任务进度

• 总任务: 25 个
• 已完成: 8 个 (32%)
• 进行中: 0 个
• 待开始: 17 个

进度条: ████████░░░░░░░░░░░░░░░░░░░░░░ 32%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 状态一致性

• Git vs 会话: ✅ 一致
• features.json vs 会话: ✅ 一致
• 任务依赖: ✅ 无循环依赖

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 代码质量

• TypeScript: ✅ 无错误
• Lint: ✅ 无错误
• 编译: ✅ 成功

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 建议

状态良好！可以开始下一个任务：

/pep-next pep-common-banner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 情况 B: 有未完成任务

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  状态检查 - 发现未完成任务

组件: pep-common-banner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 基础信息

• 组件存在: ✅
• 目录结构: ✅ 完整
• features.json: ✅ 有效（25 个任务）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Git 状态

• 工作目录: ⚠️  有未提交修改
  - src/pep-common-banner.svelte (+45, -10)
  - src/types.ts (+3, -0)
  - src/styles.scss (+20, -5)

• 最近提交: def456a - feat: 添加 Props 接口 (5小时前)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 任务进度

• 总任务: 25 个
• 已完成: 7 个 (28%)
• 进行中: 1 个 ⚠️
• 待开始: 17 个

当前任务: [FEAT-003] 实现轮播逻辑
• 开始时间: 2025-12-18 10:30
• 已进行: 4小时 15分钟

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 状态一致性

• Git vs 会话: ✅ 一致（有修改 + 有进行中任务）
• features.json vs 会话: ✅ 一致

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 建议

正在进行任务: [FEAT-003] 实现轮播逻辑

选项 1: 继续当前任务
   继续实现功能

选项 2: 完成任务
   如已完成，运行:
   /pep-done pep-common-banner FEAT-003

选项 3: 放弃修改
   如要重新开始:
   git checkout .

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 情况 C: 状态不一致

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ 状态检查 - 发现不一致

组件: pep-common-banner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 基础信息

• 组件存在: ✅
• 目录结构: ✅ 完整
• features.json: ✅ 有效（25 个任务）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Git 状态

• 工作目录: ✅ 干净
• 最近提交: def456a - feat: 添加 Props 接口 (5小时前)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  任务进度

• 总任务: 25 个
• 已完成: 7 个 (28%)
• 进行中: 1 个 ⚠️
• 待开始: 17 个

当前任务: [FEAT-003] 实现轮播逻辑
• 开始时间: 2025-12-18 10:30
• 已进行: 4小时 15分钟

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 状态不一致

问题: Git 工作目录干净，但有进行中任务

可能原因:
1. 代码已提交，但忘记标记任务完成
2. 代码被回滚或重置
3. 会话状态未同步

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 修复建议

选项 1: 标记任务完成（推荐）
   如果 FEAT-003 确实已完成:
   /pep-done pep-common-banner FEAT-003

选项 2: 继续任务
   如果 FEAT-003 尚未完成，继续实现

选项 3: 重置任务状态
   如果要放弃任务:
   pep-dev reset pep-common-banner FEAT-003

选项 4: 手动同步
   vim components/pep-common-banner/.component-dev/session_state.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### 情况 D: 代码质量问题

```markdown
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  状态检查 - 发现代码质量问题

组件: pep-common-banner

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 基础信息

• 组件存在: ✅
• 目录结构: ✅ 完整
• features.json: ✅ 有效（25 个任务）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 Git 状态

• 工作目录: ⚠️  有未提交修改
• 最近提交: def456a - feat: 添加 Props 接口 (2小时前)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 代码质量

TypeScript 错误: 3 个
  src/types.ts:12:5 - error TS2304: Cannot find name 'BannerItem'.
  src/component.svelte:45:10 - error TS2339: Property 'items' does not exist.
  src/component.svelte:67:15 - error TS2345: Argument type mismatch.

Lint 警告: 5 个
  src/component.svelte:23 - 'timer' is assigned but never used
  src/component.svelte:45 - Missing semicolon
  src/component.svelte:78 - Unexpected console.log

编译: ❌ 失败

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 修复建议

1. 修复 TypeScript 错误（阻塞性）
   • 定义 BannerItem 类型
   • 检查 Props 类型定义
   • 修正参数类型

2. 修复 Lint 警告（建议）
   • 移除未使用的变量
   • 添加缺失的分号
   • 移除调试代码（console.log）

3. 重新编译
   $ npm run build

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 提示

建议先修复代码质量问题，再继续开发或提交。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧠 关键技术点

### 1. 智能状态推断

```typescript
enum ComponentState {
  Healthy,              // 一切正常
  InProgress,           // 有进行中任务
  Inconsistent,         // 状态不一致
  QualityIssue,         // 代码质量问题
  StructureIncomplete,  // 目录结构不完整
  NotInitialized,       // 未初始化
}

function inferState(component: string): ComponentState {
  // 检查逻辑...
}
```

### 2. 一致性检查矩阵

```markdown
| Git状态 | 会话状态 | 结论 |
|---------|---------|------|
| 干净    | 无任务   | ✅ 正常 |
| 干净    | 有任务   | ⚠️  不一致 |
| 有修改  | 无任务   | ⚠️  不一致 |
| 有修改  | 有任务   | ✅ 正常 |
```

### 3. 修复建议生成

```typescript
function generateFixSuggestions(state: ComponentState, checks: Checks): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  if (state === ComponentState.Inconsistent) {
    if (checks.git.clean && checks.session.hasTask) {
      suggestions.push({
        priority: 'high',
        action: '/pep-done',
        reason: '代码已提交但任务未标记完成',
      });
    }
  }
  
  if (checks.quality.typescript.errors > 0) {
    suggestions.push({
      priority: 'critical',
      action: '修复 TypeScript 错误',
      details: checks.quality.typescript.errorList,
    });
  }
  
  return suggestions.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  );
}
```

---

## 🔧 执行指南

### 作为 AI，您需要：

1. **全面检查**
   - 不遗漏任何状态
   - 检查一致性
   - 识别潜在问题

2. **清晰诊断**
   - 准确描述问题
   - 解释可能原因
   - 评估影响

3. **实用建议**
   - 提供具体操作
   - 按优先级排序
   - 包含命令示例

4. **友好呈现**
   - 使用图标和颜色
   - 结构化输出
   - 易于理解

---

## ⚠️  注意事项

1. **不要遗漏检查**
   - 每个阶段都要执行
   - 发现问题立即报告

2. **不要误导用户**
   - 诊断准确
   - 建议可行
   - 风险提示

3. **不要过度警告**
   - 区分错误和警告
   - 不要小题大做

4. **提供恢复路径**
   - 对于每个问题
   - 都要有解决方案
   - 或至少有排查方向

---

## 底层脚本调用

```bash
# 状态检查
python3 scripts/check_component_state.py \
  --component <component-name>

# 输出:
# - 状态代码 (0=正常, 1=警告, 2=错误)
# - 检查结果 JSON
# - 修复建议列表
```

---

## 🎯 成功标准

- ✅ 全面检查所有状态维度
- ✅ 准确识别问题和不一致
- ✅ 提供清晰的诊断信息
- ✅ 提供可执行的修复建议
- ✅ 用户理解当前状态和下一步操作

