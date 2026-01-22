import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const { values } = parseArgs({
    options: {
      spec: { type: 'string' },
      features: { type: 'string', default: '150' },
      'project-dir': { type: 'string', default: process.cwd() },
      'ai-assist': { type: 'boolean' },
    }
  });

  if (!values.spec) {
    console.error('用法: node scripts/init-project.js --spec <path> [--features <num>] [--project-dir <path>] [--ai-assist]');
    process.exit(1);
  }

  const specPath = path.resolve(values.spec);
  const projectDir = path.resolve(values['project-dir']);
  const numFeatures = parseInt(values.features, 10);

  console.log("\n" + "=".repeat(60));
  console.log("  Cursor 自主编码项目初始化");
  console.log("=".repeat(60) + "\n");

  try {
    const specContent = await fs.readFile(specPath, 'utf-8');
    console.log(`📄 读取项目规格: ${specPath}`);
    console.log(`  ✓ 规格文件读取成功 (${specContent.length} 字符)\n`);

    console.log("🔍 分析技术栈...");
    const techStack = extractTechStack(specContent);
    Object.entries(techStack).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
    console.log();

    await fs.mkdir(projectDir, { recursive: true });

    const specDest = path.join(projectDir, 'spec.md');
    try {
      await fs.access(specDest);
    } catch {
      await fs.writeFile(specDest, specContent, 'utf-8');
      console.log(`  ✓ 规格文件已复制到: ${specDest}\n`);
    }

    if (values['ai-assist']) {
      console.log("🤖 生成AI辅助提示词...");
      const prompt = generateAiAssistPrompt(specContent, numFeatures);
      const promptFile = path.join(projectDir, '.cursor-session', 'features-prompt.md');
      await fs.mkdir(path.dirname(promptFile), { recursive: true });
      await fs.writeFile(promptFile, prompt, 'utf-8');

      console.log(`\n  ✓ AI提示词已保存到: ${promptFile}`);
      console.log("\n  📋 请按以下步骤操作：");
      console.log(`     1. 在Cursor中打开: ${promptFile}`);
      console.log("     2. 使用Composer或Chat功能，粘贴提示词");
      console.log("     3. 将生成的JSON保存到: features.json");
      console.log("     4. 运行验证: node scripts/validate.js\n");
      return;
    }

    console.log(`⚙️  生成功能清单 (${numFeatures} 个功能)...`);
    const features = generateFeaturesFromSpec(specContent, numFeatures);
    const featuresFile = path.join(projectDir, 'features.json');
    await fs.writeFile(featuresFile, JSON.stringify(features, null, 2), 'utf-8');
    console.log(`  ✓ 功能清单已生成: ${featuresFile}`);
    console.warn(`  ⚠️  注意: 大部分功能需要手动完善或使用 --ai-assist 选项\n`);

    console.log("📁 创建会话配置目录...");
    const sessionDir = await createSessionDirectory(projectDir);
    console.log(`  ✓ 会话目录创建成功: ${sessionDir}\n`);

    console.log("📊 创建进度追踪文档...");
    await createProgressFile(projectDir, specContent, techStack);
    console.log(`  ✓ 进度文档创建成功: cursor-progress.md\n`);

    console.log("🔧 初始化Git仓库...");
    initGitRepo(projectDir);
    console.log();

    console.log("=".repeat(60));
    console.log("  ✅ 初始化完成！");
    console.log("=".repeat(60));
    console.log(`\n📋 创建的文件:`);
    console.log(`  • features.json`);
    console.log(`  • cursor-progress.md`);
    console.log(`  • .cursor-session/`);

    console.log("\n🚀 下一步:");
    console.log("  1. 完善功能清单（features.json）");
    console.log("  2. 运行: node scripts/next-task.js");
    console.log("  3. 在Cursor中开始开发\n");

  } catch (err) {
    console.error(`\n❌ 错误: ${err.message}\n`);
    process.exit(1);
  }
}

function extractTechStack(content) {
  const stack = { frontend: "未指定", backend: "未指定", database: "未指定", testing: "未指定" };
  const lower = content.toLowerCase();
  if (lower.includes("react")) stack.frontend = "React";
  else if (lower.includes("vue")) stack.frontend = "Vue";
  else if (lower.includes("svelte")) stack.frontend = "Svelte";
  
  if (lower.includes("express") || lower.includes("node")) stack.backend = "Node.js/Express";
  else if (lower.includes("fastapi")) stack.backend = "FastAPI";
  
  if (lower.includes("postgres")) stack.database = "PostgreSQL";
  else if (lower.includes("mongo")) stack.database = "MongoDB";
  
  return stack;
}

function generateFeaturesFromSpec(content, num) {
  const features = [
    { id: 1, category: "infrastructure", priority: "critical", title: "项目初始化和依赖管理", description: "设置项目结构，初始化包管理器，安装核心依赖", acceptance_criteria: ["项目目录结构清晰合理", "依赖配置文件完整", "开发环境可以成功启动"], status: "pending", dependencies: [] },
    { id: 2, category: "infrastructure", priority: "critical", title: "开发环境配置", description: "配置开发服务器、热重载、环境变量等", acceptance_criteria: ["开发服务器可以正常启动", "文件修改后自动重载"], status: "pending", dependencies: [1] },
    { id: 3, category: "infrastructure", priority: "critical", title: "数据库设置和迁移系统", description: "初始化数据库，设置迁移工具，创建基础表结构", acceptance_criteria: ["数据库连接成功", "迁移系统正常工作"], status: "pending", dependencies: [1, 2] }
  ];

  const categories = ["core", "api", "ui", "auth", "data", "integration", "testing", "optimization"];
  for (let i = features.length + 1; i <= num; i++) {
    features.push({
      id: i,
      category: categories[(i - 1) % categories.length],
      priority: i < num * 0.3 ? "high" : "medium",
      title: `功能 #${i} - 待定义`,
      description: `[需要根据项目规格定义此功能的具体内容]`,
      acceptance_criteria: ["功能按预期工作", "代码质量良好"],
      status: "pending",
      dependencies: i > 10 ? [Math.max(1, i - 5)] : []
    });
  }
  return features;
}

async function createSessionDirectory(projectDir) {
  const sessionDir = path.join(projectDir, '.cursor-session');
  await fs.mkdir(sessionDir, { recursive: true });
  await fs.writeFile(path.join(sessionDir, 'config.json'), JSON.stringify({ created_at: new Date().toISOString(), version: "1.0.0" }, null, 2));
  await fs.writeFile(path.join(sessionDir, 'session-history.json'), "[]");
  return sessionDir;
}

async function createProgressFile(projectDir, spec, stack) {
  const content = `# 项目开发进度\n\n**创建时间**: ${new Date().toLocaleString()}\n\n**技术栈**:\n- Frontend: ${stack.frontend}\n- Backend: ${stack.backend}\n- Database: ${stack.database}\n\n## 开发状态\n\n| 指标 | 数值 |\n|------|------|\n| 总功能数 | - |\n| 已完成 | 0 |\n| 完成率 | 0% |\n`;
  await fs.writeFile(path.join(projectDir, 'cursor-progress.md'), content);
}

function initGitRepo(projectDir) {
  try {
    execSync('git rev-parse --git-dir', { cwd: projectDir });
    console.log("  ✓ Git仓库已存在");
  } catch {
    execSync('git init', { cwd: projectDir });
    console.log("  ✓ Git仓库初始化成功");
    const ignore = "node_modules/\n.env\n.DS_Store\n";
    fs.writeFile(path.join(projectDir, '.gitignore'), ignore);
  }
}

function generateAiAssistPrompt(spec, num) {
  return `# 任务：生成项目功能清单\n\n请根据以下项目规格，生成 ${num} 个详细的功能点，以JSON格式输出。\n\n## 项目规格\n\n${spec}\n\n## 输出格式\n\n请生成一个JSON数组...`;
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
