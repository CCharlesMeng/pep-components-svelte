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
      'workspace-root': { type: 'string', default: process.cwd() },
      format: { type: 'string', default: 'terminal' },
      output: { type: 'string' },
    }
  });

  const workspaceRoot = path.resolve(values['workspace-root']);

  console.log("\n📦 扫描monorepo组件...");
  const components = await discoverComponents(workspaceRoot);

  if (components.length === 0) {
    console.error("❌ 未找到任何组件");
    process.exit(1);
  }

  console.log(`✓ 发现 ${components.length} 个组件\n`);
  console.log("📊 加载组件数据...");

  const componentStats = [];
  for (const comp of components) {
    const stats = await loadComponentFeatures(workspaceRoot, comp);
    componentStats.push(stats);
    console.log(`   ✓ ${comp}`);
  }
  console.log();

  let report;
  switch (values.format) {
    case 'json':
      report = generateJsonReport(componentStats);
      break;
    case 'html':
      report = generateHtmlReport(componentStats);
      break;
    case 'markdown':
      report = generateMarkdownReport(componentStats);
      break;
    default:
      report = generateTerminalReport(componentStats);
  }

  if (values.output) {
    await fs.writeFile(path.resolve(values.output), report, 'utf-8');
    console.log(`✅ 报告已生成: ${values.output}\n`);
  } else {
    console.log(report);
  }
}

async function discoverComponents(root) {
  const componentsDir = path.join(root, 'components');
  try {
    const entries = await fs.readdir(componentsDir, { withFileTypes: true });
    const components = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          await fs.access(path.join(componentsDir, entry.name, 'features.json'));
          components.push(entry.name);
        } catch {}
      }
    }
    return components.sort();
  } catch {
    return [];
  }
}

async function loadComponentFeatures(root, component) {
  const featuresFile = path.join(root, 'components', component, 'features.json');
  try {
    const content = await fs.readFile(featuresFile, 'utf-8');
    const data = JSON.parse(content);
    const features = Array.isArray(data) ? data : (data.features || []);

    const total = features.length;
    const completed = features.filter(f => ['completed', 'tested'].includes(f.status)).length;
    const inProgress = features.filter(f => f.status === 'in_progress').length;
    const pending = features.filter(f => f.status === 'pending').length;

    return {
      name: component,
      total,
      completed,
      in_progress: inProgress,
      pending,
      percentage: total > 0 ? (completed / total * 100) : 0
    };
  } catch (e) {
    return { name: component, total: 0, completed: 0, in_progress: 0, pending: 0, percentage: 0, error: e.message };
  }
}

function generateTerminalReport(stats) {
  let report = "\n" + "=".repeat(80) + "\n";
  report += "  📊 Monorepo 全局进度报告\n";
  report += "=".repeat(80) + "\n\n";

  const totalComponents = stats.length;
  const totalFeatures = stats.reduce((acc, c) => acc + c.total, 0);
  const totalCompleted = stats.reduce((acc, c) => acc + c.completed, 0);
  const overallPct = totalFeatures > 0 ? (totalCompleted / totalFeatures * 100) : 0;

  report += "## 总体概览\n\n";
  report += `组件总数: ${totalComponents}\n`;
  report += `功能总数: ${totalFeatures}\n`;
  report += `已完成: ${totalCompleted} (${overallPct.toFixed(1)}%)\n`;

  const barLength = 60;
  const completedLength = Math.floor(barLength * overallPct / 100);
  const bar = "█".repeat(completedLength) + "░".repeat(barLength - completedLength);
  report += `\n[${bar}] ${overallPct.toFixed(1)}%\n`;

  report += "\n" + "-".repeat(80) + "\n";
  report += "## 组件进度详情\n\n";

  stats.sort((a, b) => b.percentage - a.percentage || a.name.localeCompare(b.name)).forEach(c => {
    const status = c.percentage >= 100 ? "✅" : c.percentage > 0 ? "🔄" : "⏳";
    const compBar = "█".repeat(Math.floor(30 * c.percentage / 100)).padEnd(30, "░");
    report += `${status} ${c.name.padEnd(40)} [${compBar}] ${c.percentage.toFixed(1).padStart(5)}% (${c.completed}/${c.total})\n`;
  });

  return report;
}

function generateMarkdownReport(stats) {
  const totalFeatures = stats.reduce((acc, c) => acc + c.total, 0);
  const totalCompleted = stats.reduce((acc, c) => acc + c.completed, 0);
  const overallPct = totalFeatures > 0 ? (totalCompleted / totalFeatures * 100) : 0;

  let report = `# Monorepo 全局进度报告\n\n**生成时间**: ${new Date().toLocaleString()}\n\n## 📊 总体概览\n\n`;
  report += `| 指标 | 数值 |\n|------|------|\n`;
  report += `| 组件总数 | ${stats.length} |\n`;
  report += `| 功能总数 | ${totalFeatures} |\n`;
  report += `| 已完成 | ${totalCompleted} (${overallPct.toFixed(1)}%) |\n\n`;

  report += `## 📦 组件进度详情\n\n| 组件 | 进度 | 已完成/总数 | 完成率 |\n|------|------|------------|--------|\n`;
  stats.sort((a, b) => b.percentage - a.percentage).forEach(c => {
    const status = c.percentage >= 100 ? "✅" : c.percentage > 0 ? "🔄" : "⏳";
    const bar = "█".repeat(Math.floor(20 * c.percentage / 100)).padEnd(20, "░");
    report += `| ${status} ${c.name} | ${bar} | ${c.completed}/${c.total} | ${c.percentage.toFixed(1)}% |\n`;
  });

  return report;
}

function generateJsonReport(stats) {
  return JSON.stringify({ generated_at: new Date().toISOString(), components: stats }, null, 2);
}

function generateHtmlReport(stats) {
  return `<html><body><h1>Monorepo Summary</h1><p>Generated at: ${new Date().toLocaleString()}</p></body></html>`;
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
