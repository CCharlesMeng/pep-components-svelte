import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execSync, spawnSync } from 'node:child_process';
import readline from 'node:readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const { values } = parseArgs({
    options: {
      component: { type: 'string' },
      'project-dir': { type: 'string', default: process.cwd() },
      'max-iterations': { type: 'string' },
      delay: { type: 'string', default: '10' },
      'auto-commit': { type: 'boolean' },
      'auto-test': { type: 'boolean' },
      'cursor-prompt-only': { type: 'boolean' },
    }
  });

  const projectDir = path.resolve(values['project-dir']);
  const maxIterations = values['max-iterations'] ? parseInt(values['max-iterations'], 10) : Infinity;
  const delay = parseInt(values.delay, 10);

  printBanner();

  console.log(`\n📦 ${values.component ? `组件: ${values.component}` : "标准项目"}`);
  console.log(`📁 项目目录: ${projectDir}`);
  console.log(`🔄 最大迭代: ${maxIterations === Infinity ? "无限" : maxIterations}`);
  console.log(`⏱️  延迟: ${delay}秒`);

  if (!values['cursor-prompt-only']) {
    console.log("\n按 Enter 开始，Ctrl+C 停止...");
    await waitForKey();
  }

  let iteration = 0;
  while (iteration < maxIterations) {
    iteration++;
    console.log("\n" + "=".repeat(70));
    console.log(`  迭代 #${iteration}`);
    console.log("=".repeat(70) + "\n");

    console.log("📋 获取下一个任务...");
    const task = await getNextTask(projectDir, values.component);
    if (!task) {
      console.log("\n🎉 太棒了！所有功能都已完成！");
      break;
    }

    console.log(`\n✨ 下一个任务: 功能 #${task.id} - ${task.title}`);

    console.log("\n📝 生成Cursor提示词...");
    const prompt = generateCursorPrompt(task, values.component);
    const promptFile = await saveCursorPrompt(prompt, projectDir, values.component);
    console.log(`✓ 提示词已保存: ${promptFile}`);

    if (values['cursor-prompt-only']) {
      console.log("\n💡 提示词已生成，请在Cursor中使用:");
      console.log(`   1. 打开Cursor Composer`);
      console.log(`   2. 引用: @${path.basename(promptFile)}`);
      console.log(`   3. 说: 请帮我完成这个任务`);
      break;
    }

    console.log("\n" + "-".repeat(70));
    console.log("🎨 请在Cursor中完成开发:");
    console.log(`   1. 打开Cursor Composer`);
    console.log(`   2. 引用: @${path.basename(promptFile)}`);
    console.log(`   3. 让AI帮你完成任务`);
    console.log("-".repeat(70));

    await sleep(delay * 1000);

    if (!await promptUserAction("✅ 功能开发完成了吗？")) {
      console.log("跳过此功能，继续下一个...");
      continue;
    }

    let testPassed = true;
    if (values['auto-test']) {
      testPassed = runTests(projectDir, values.component);
      if (!testPassed && !await promptUserAction("⚠️  测试失败，是否继续？")) break;
    } else if (!await promptUserAction("🧪 测试通过了吗？")) {
      console.log("请修复测试后再继续...");
      continue;
    }

    if (values['auto-commit']) {
      commitChanges(projectDir, task, values.component);
    } else if (!await promptUserAction("📝 代码已提交了吗？")) {
      console.log("请先提交代码...");
      continue;
    }

    if (await markTaskDone(projectDir, task.id, values.component)) {
      console.log(`\n✓ 功能 #${task.id} 完成！`);
    }

    console.log(`\n等待 ${delay} 秒后继续下一个任务...`);
    await sleep(delay * 1000);
  }

  console.log("\n" + "=".repeat(70));
  console.log("  自动化开发会话结束");
  console.log("=".repeat(70));
}

function printBanner() {
  console.log(`
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🤖 Cursor 全自动化开发模式                             ║
║                                                                    ║
║  此模式会自动循环：获取任务 → 等待开发 → 测试 → 提交 → 下一个      ║
║                                                                    ║
║  ⚠️  实验性功能，请谨慎使用！                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
`);
}

async function getNextTask(projectDir, component) {
  const args = ['scripts/next-task.js', '--format', 'json', '--project-dir', projectDir];
  if (component) args.push('--component', component);
  
  try {
    const result = spawnSync('node', args, { encoding: 'utf-8' });
    if (result.status === 0 && result.stdout) {
      const tasks = JSON.parse(result.stdout);
      return tasks[0];
    }
  } catch {}
  return null;
}

function generateCursorPrompt(task, component) {
  return `# 🤖 自动开发任务\n\n${component ? `组件: ${component}\n` : ""}功能 #${task.id}: ${task.title}\n\n## 📋 任务详情...`;
}

async function saveCursorPrompt(prompt, projectDir, component) {
  const file = component 
    ? path.join(projectDir, 'components', component, '.component-dev', 'current-task.md')
    : path.join(projectDir, '.cursor-session', 'current-task.md');
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, prompt, 'utf-8');
  return file;
}

async function promptUserAction(msg) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise(resolve => rl.question(`${msg} (y/N): `, resolve));
  rl.close();
  return answer.toLowerCase() === 'y';
}

function runTests(projectDir, component) {
  const cwd = component ? path.join(projectDir, 'components', component) : projectDir;
  try {
    spawnSync('npm', ['test'], { cwd, stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}

function commitChanges(projectDir, task, component) {
  const msg = `feat${component ? `(${component})` : ""}: ${task.title} (#${task.id})`;
  try {
    spawnSync('git', ['add', '.'], { cwd: projectDir });
    spawnSync('git', ['commit', '-m', msg], { cwd: projectDir });
    return true;
  } catch {
    return false;
  }
}

async function markTaskDone(projectDir, id, component) {
  const args = ['scripts/mark-done.js', '--project-dir', projectDir, '--feature-id', String(id), '--tested'];
  if (component) args.push('--component', component);
  const result = spawnSync('node', args, { stdio: 'inherit' });
  return result.status === 0;
}

function waitForKey() {
  return new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
