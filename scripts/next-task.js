import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const { values } = parseArgs({
    options: {
      component: { type: 'string' },
      'project-dir': { type: 'string', default: process.cwd() },
      format: { type: 'string', default: 'markdown' },
      count: { type: 'string', default: '1' },
      priority: { type: 'string' },
      category: { type: 'string' },
      save: { type: 'boolean' },
    }
  });

  const projectDir = path.resolve(values['project-dir']);
  const count = parseInt(values.count, 10);

  try {
    const featuresFile = await getFeaturesFile(projectDir, values.component);
    const features = await loadFeatures(featuresFile);
    
    const tasks = getNextTasks(
      features,
      count,
      values.priority,
      values.category
    );

    if (tasks.length === 0) {
      console.log("\n🎉 太棒了！所有功能都已完成或没有可开始的功能！\n");
      printStats(features);
      return;
    }

    printStats(features);

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      if (values.format === 'json') {
        console.log(JSON.stringify(task, null, 2));
      } else if (values.format === 'text') {
        console.log(formatTaskText(task));
      } else {
        const prompt = generateTaskPrompt(task, features);
        console.log(prompt);

        if (i === 0 && values.save) {
          const taskFile = await saveCurrentTask(projectDir, prompt, values.component);
          console.log(`\n💾 任务已保存到: ${taskFile}\n`);
        }
      }

      if (i < tasks.length - 1) {
        console.log("\n" + "-".repeat(60) + "\n");
      }
    }

    if (values.format === 'markdown' && !values.save) {
      console.log("\n" + "=".repeat(60));
      console.log("  💡 提示");
      console.log("=".repeat(60));
      console.log("\n添加 --save 参数可以将任务保存到 .cursor-session/current-task.md");
      console.log("\n示例:");
      console.log("  node scripts/next-task.js --save\n");
    }

  } catch (err) {
    console.error(`\n❌ 错误: ${err.message}\n`);
    process.exit(1);
  }
}

async function getFeaturesFile(projectDir, component) {
  let featuresFile;
  if (component) {
    featuresFile = path.join(projectDir, 'components', component, 'features.json');
  } else {
    featuresFile = path.join(projectDir, 'features.json');
  }

  try {
    await fs.access(featuresFile);
    return featuresFile;
  } catch {
    throw new Error(component 
      ? `组件功能清单不存在: ${featuresFile}\n请先运行: node scripts/scaffold-component.js --component ${component}`
      : `功能清单不存在: ${featuresFile}\n请先初始化项目`
    );
  }
}

async function loadFeatures(featuresFile) {
  const content = await fs.readFile(featuresFile, 'utf-8');
  const data = JSON.parse(content);
  if (Array.isArray(data)) return data;
  if (data && data.features) return data.features;
  throw new Error(`无效的 features.json 格式: ${featuresFile}`);
}

function getNextTasks(features, count, priority, category) {
  const completed = new Set(
    features
      .filter(f => ['completed', 'tested'].includes(f.status))
      .map(f => f.id)
  );

  let candidates = features.filter(f => 
    f.status === 'pending' && 
    (f.dependencies || []).every(depId => completed.has(depId))
  );

  if (priority) {
    candidates = candidates.filter(f => f.priority === priority);
  }

  if (category) {
    candidates = candidates.filter(f => f.category === category);
  }

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  candidates.sort((a, b) => {
    const pA = priorityOrder[a.priority] ?? 99;
    const pB = priorityOrder[b.priority] ?? 99;
    if (pA !== pB) return pA - pB;
    return String(a.id).localeCompare(String(b.id));
  });

  return candidates.slice(0, count);
}

function generateTaskPrompt(feature, features) {
  const total = features.length;
  const completed = features.filter(f => ['completed', 'tested'].includes(f.status)).length;
  const percentage = total > 0 ? (completed / total * 100) : 0;

  const dependenciesInfo = (feature.dependencies || []).map(depId => {
    const dep = features.find(f => f.id === depId);
    if (!dep) return null;
    const statusEmoji = ['completed', 'tested'].includes(dep.status) ? '✅' : '⏳';
    return `  - ${statusEmoji} #${dep.id}: ${dep.title}`;
  }).filter(Boolean);

  const dependenciesText = dependenciesInfo.length > 0 ? dependenciesInfo.join('\n') : '  无依赖';
  const criteriaChecklist = (feature.acceptance_criteria || []).map(c => `- [ ] ${c}`).join('\n');

  return `# 功能开发任务 #${feature.id}

## 📊 项目进度

- **总功能数**: ${total}
- **已完成**: ${completed} (${percentage.toFixed(1)}%)
- **当前功能**: #${feature.id} / ${total}

---

## 🎯 功能详情

**标题**: ${feature.title}

**类别**: \`${feature.category}\`  
**优先级**: \`${feature.priority}\`  
**复杂度**: \`${feature.estimated_complexity || 'medium'}\`

### 功能描述

${feature.description}

### 验收标准

${criteriaChecklist}

### 依赖关系

${dependenciesText}

---

## 💡 开发指南

### 1. 理解需求
- 仔细阅读功能描述和验收标准
- 查看依赖功能的实现方式
- 明确功能边界和预期行为

### 2. 实现步骤

#### 核心代码
- 创建必要的文件和目录
- 实现核心功能逻辑
- 添加错误处理
- 编写注释和文档字符串

#### 测试验证
- 编写单元测试（如适用）
- 手动测试核心流程
- 验证边界情况
- 检查错误处理

#### 代码质量
- 运行linter检查
- 修复任何警告
- 确保代码风格一致
- 优化性能（如需要）

#### 文档更新
- 更新相关文档
- 添加使用示例
- 更新API文档（如适用）

### 3. 验证清单

在标记功能完成前，请确认：

- [ ] 所有验收标准都已满足
- [ ] 代码通过linter检查，无警告
- [ ] 功能已手动测试，工作正常
- [ ] 边界情况和错误处理已验证
- [ ] 相关文档已更新
- [ ] 代码已格式化，符合项目规范
- [ ] 没有引入新的依赖（或已记录）
- [ ] 提交信息清晰描述变更

---

## 🚀 完成流程

### 1. 实现功能
在Cursor中使用Composer或Chat完成开发

### 2. 本地测试
\`\`\`bash
# 运行应用并测试功能
# [根据项目类型添加具体命令]
\`\`\`

### 3. 提交代码
\`\`\`bash
git add .
git commit -m "feat: ${feature.title} (#${feature.id})"
\`\`\`

### 4. 标记完成
\`\`\`bash
node scripts/mark-done.js --feature-id ${feature.id}
\`\`\`

---

## 📝 注意事项

- **专注**: 只实现当前功能，不要过度设计
- **质量**: 确保代码质量高于完成速度
- **测试**: 彻底测试后再标记完成
- **文档**: 保持文档与代码同步
- **提交**: 每个功能独立提交

---

## 🔗 相关资源

- 项目规格: \`spec.md\`
- 功能清单: \`features.json\`
- 进度追踪: \`cursor-progress.md\`

---

**开始时间**: ${new Date().toLocaleString()}

祝编码愉快！🎉
`;
}

function formatTaskText(feature) {
  let text = `
下一个任务: 功能 #${feature.id}
${'='.repeat(50)}

标题: ${feature.title}
类别: ${feature.category}
优先级: ${feature.priority}
复杂度: ${feature.estimated_complexity || 'medium'}

描述:
${feature.description}

验收标准:
`;
  (feature.acceptance_criteria || []).forEach((c, i) => {
    text += `${i + 1}. ${c}\n`;
  });
  return text;
}

async function saveCurrentTask(projectDir, prompt, component) {
  const sessionDir = component 
    ? path.join(projectDir, 'components', component, '.component-dev')
    : path.join(projectDir, '.cursor-session');

  await fs.mkdir(sessionDir, { recursive: true });
  const taskFile = path.join(sessionDir, 'current-task.md');
  await fs.writeFile(taskFile, prompt, 'utf-8');
  return taskFile;
}

function printStats(features) {
  const total = features.length;
  const stats = {
    status: {},
    priority: {},
    category: {}
  };

  features.forEach(f => {
    stats.status[f.status] = (stats.status[f.status] || 0) + 1;
    stats.priority[f.priority] = (stats.priority[f.priority] || 0) + 1;
    stats.category[f.category] = (stats.category[f.category] || 0) + 1;
  });

  const completed = (stats.status.completed || 0) + (stats.status.tested || 0);
  const percentage = total > 0 ? (completed / total * 100) : 0;

  console.log("\n" + "=".repeat(60));
  console.log("  📊 项目统计");
  console.log("=".repeat(60));
  console.log(`\n总功能数: ${total}`);
  console.log(`已完成: ${completed} (${percentage.toFixed(1)}%)`);
  console.log(`进行中: ${stats.status.in_progress || 0}`);
  console.log(`待开始: ${stats.status.pending || 0}`);
  console.log(`已阻塞: ${stats.status.blocked || 0}`);

  console.log("\n按优先级:");
  ['critical', 'high', 'medium', 'low'].forEach(p => {
    if (stats.priority[p]) console.log(`  ${p}: ${stats.priority[p]}`);
  });

  console.log("\n按类别:");
  Object.entries(stats.category)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => console.log(`  ${cat}: ${count}`));
  console.log();
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
