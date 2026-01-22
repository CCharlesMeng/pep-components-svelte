import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const { values } = parseArgs({
    options: {
      component: { type: 'string' },
      features: { type: 'string', default: '20' },
      spec: { type: 'string' },
      'ai-assist': { type: 'boolean' },
      'workspace-root': { type: 'string', default: process.cwd() },
    }
  });

  if (!values.component) {
    console.error('用法: node scripts/init-component.js --component <name> [--features <num>] [--spec <path>] [--ai-assist]');
    process.exit(1);
  }

  const componentName = values.component;
  const workspaceRoot = path.resolve(values['workspace-root']);
  const numFeatures = parseInt(values.features, 10);

  console.log("\n" + "=".repeat(70));
  console.log(`  初始化组件: ${componentName}`);
  console.log("=".repeat(70) + "\n");

  try {
    const componentDir = await getComponentDir(workspaceRoot, componentName);
    
    const featuresFile = path.join(componentDir, 'features.json');
    try {
      await fs.access(featuresFile);
      console.warn(`⚠️  组件已初始化（features.json 已存在）`);
      console.warn(`   如需重新生成，请先删除: ${featuresFile}\n`);
      return;
    } catch {}

    const specFile = values.spec ? path.resolve(values.spec) : path.join(componentDir, 'spec.md');
    try {
      await fs.access(specFile);
    } catch {
      console.error(`❌ 错误: 未找到 spec.md 规格文档`);
      console.log("\n" + "━".repeat(70));
      console.log("  📋 需要先创建组件规格文档");
      console.log("━".repeat(70) + "\n");
      console.log("规格文档应包含:");
      console.log("  • 组件概述和设计目标");
      console.log("  • 主要功能和特性描述");
      console.log("  • Props 接口说明");
      console.log("  • 事件和回调定义");
      console.log("  • 样式要求和主题");
      console.log("  • 示例用法\n");
      console.log("请按以下步骤操作:");
      console.log(`  1. 创建规格文档: vim ${specFile}`);
      console.log(`  2. 重新运行初始化\n`);
      console.log("💡 提示: 可以使用 Cursor AI 帮助生成规格文档\n");
      return;
    }

    const specContent = await fs.readFile(specFile, 'utf-8');
    console.log(`📄 读取规格文件: ${specFile}`);
    console.log(`  ✓ 规格文件读取成功 (${specContent.length} 字符)\n`);

    console.log("🤖 生成 AI 提示词（从 spec.md 生成 features.json）...");
    const prompt = generateAiAssistPrompt(componentName, numFeatures, specContent);

    const promptDir = path.join(componentDir, '.cursor-prompts');
    await fs.mkdir(promptDir, { recursive: true });
    const promptFile = path.join(promptDir, 'generate-features.md');
    await fs.writeFile(promptFile, prompt, 'utf-8');

    console.log(`  ✓ AI 提示词已保存到: ${promptFile}\n`);

    console.log("=".repeat(70));
    console.log("  📋 下一步操作");
    console.log("=".repeat(70) + "\n");
    console.log("方式1: 使用 pep-dev 命令（推荐）⭐");
    console.log(`  pep-dev spec ${componentName}\n`);
    console.log("方式2: 手动操作");
    console.log("  1️⃣  在 Cursor 中打开提示词:");
    console.log(`     ${promptFile}\n`);
    console.log("  2️⃣  使用 Cursor AI 生成功能清单:");
    console.log("     • Cmd+I (Composer) 或 Cmd+L (Chat)");
    console.log("     • 粘贴提示词内容\n");
    console.log("  3️⃣  保存 AI 生成的 JSON:");
    console.log(`     • 保存到: ${featuresFile}\n`);
    console.log("  4️⃣  验证和检查:");
    console.log(`     pep-dev validate ${componentName}`);
    console.log(`     pep-dev check ${componentName}\n`);
    console.log("  5️⃣  开始开发:");
    console.log(`     pep-dev next ${componentName} --save\n`);
    console.log("=".repeat(70) + "\n");

  } catch (err) {
    console.error(`\n❌ 错误: ${err.message}\n`);
    process.exit(1);
  }
}

async function getComponentDir(workspaceRoot, componentName) {
  const componentDir = path.join(workspaceRoot, 'components', componentName);
  
  try {
    await fs.access(componentDir);
  } catch {
    console.warn(`⚠️  组件目录不存在: ${componentDir}`);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => rl.question('是否创建新组件目录？(y/N): ', resolve));
    rl.close();

    if (answer.toLowerCase() === 'y') {
      await fs.mkdir(componentDir, { recursive: true });
      console.log(`✓ 已创建组件目录: ${componentDir}`);
    } else {
      throw new Error(`组件目录不存在: ${componentDir}`);
    }
  }

  return componentDir;
}

function generateAiAssistPrompt(componentName, numFeatures, specContent) {
  return `# 任务：为Svelte组件生成功能清单

请为 **${componentName}** 组件生成 ${numFeatures} 个详细的功能点，以JSON格式输出。

## 组件规格

${specContent}

## 组件上下文

这是一个Svelte组件，位于pnpm monorepo中。组件应该：
- 可复用、独立
- 遵循Svelte最佳实践
- 支持TypeScript
- 具有良好的可访问性
- 有完整的文档和示例

## 功能分类建议

1. **structure** (5%) - 基础结构
2. **props** (15%) - Props接口和配置
3. **styling** (20%) - 样式和主题
4. **events** (15%) - 事件处理
5. **state** (10%) - 状态管理
6. **variants** (10%) - 样式变体
7. **accessibility** (10%) - 无障碍
8. **documentation** (10%) - 文档
9. **testing** (15%) - 测试

## 输出格式

\`\`\`json
[
  {
    "id": 1,
    "category": "structure|props|styling|events|state|variants|accessibility|documentation|testing",
    "priority": "critical|high|medium|low",
    "title": "${componentName} - 简洁的功能标题",
    "description": "详细描述此功能要实现什么，为什么重要",
    "acceptance_criteria": [
      "具体的验收标准1",
      "具体的验收标准2",
      "具体的验收标准3"
    ],
    "estimated_complexity": "low|medium|high",
    "dependencies": [依赖的功能ID列表],
    "status": "pending",
    "completed_at": null,
    "tested": false,
    "commit_hash": null
  }
]
\`\`\`

## 要求

1. **功能要细**: 每个功能1-3小时可完成
2. **优先级明确**: 
   - critical: 基础必需功能（2-3个）
   - high: 核心功能（40%）
   - medium: 重要功能（40%）
   - low: 增强功能（20%）
3. **依赖清晰**: 确保依赖关系合理
4. **验收标准具体**: 可测试、可验证

请直接输出JSON数组，不要包含其他解释文字。
`;
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
