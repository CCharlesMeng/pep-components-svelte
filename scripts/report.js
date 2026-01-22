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
      format: { type: 'string', default: 'terminal' },
      output: { type: 'string' },
      detailed: { type: 'boolean' },
    }
  });

  const projectDir = path.resolve(values['project-dir']);

  try {
    const featuresFile = await getFeaturesFile(projectDir, values.component);
    const features = await loadFeatures(featuresFile);
    const stats = calculateStatistics(features);

    let report;
    switch (values.format) {
      case 'json':
        report = generateJsonReport(features, stats);
        break;
      case 'html':
        report = generateHtmlReport(features, stats, values.detailed);
        break;
      case 'markdown':
        report = generateMarkdownReport(features, stats, values.detailed);
        break;
      default:
        report = generateTerminalReport(features, stats, values.detailed);
    }

    if (values.output) {
      await fs.writeFile(path.resolve(values.output), report, 'utf-8');
      console.log(`\n✅ 报告已生成: ${values.output}\n`);
    } else {
      console.log(report);
    }

  } catch (err) {
    console.error(`\n❌ 错误: ${err.message}\n`);
    process.exit(1);
  }
}

async function getFeaturesFile(projectDir, component) {
  const featuresFile = component 
    ? path.join(projectDir, 'components', component, 'features.json')
    : path.join(projectDir, 'features.json');

  try {
    await fs.access(featuresFile);
    return featuresFile;
  } catch {
    throw new Error(`功能清单不存在: ${featuresFile}`);
  }
}

async function loadFeatures(featuresFile) {
  const content = await fs.readFile(featuresFile, 'utf-8');
  const data = JSON.parse(content);
  if (Array.isArray(data)) return data;
  if (data && data.features) return data.features;
  throw new Error(`无效的 features.json 格式: ${featuresFile}`);
}

function calculateStatistics(features) {
  const stats = {
    total: features.length,
    completed: 0,
    in_progress: 0,
    pending: 0,
    blocked: 0,
    by_status: {},
    by_priority: {},
    by_category: {},
    by_complexity: {},
    estimated_hours_remaining: 0
  };

  const complexityHours = { low: 2, medium: 4, high: 8 };

  features.forEach(f => {
    stats.by_status[f.status] = (stats.by_status[f.status] || 0) + 1;
    stats.by_priority[f.priority] = (stats.by_priority[f.priority] || 0) + 1;
    stats.by_category[f.category] = (stats.by_category[f.category] || 0) + 1;
    const complexity = f.estimated_complexity || 'medium';
    stats.by_complexity[complexity] = (stats.by_complexity[complexity] || 0) + 1;

    if (['completed', 'tested'].includes(f.status)) {
      stats.completed++;
    } else if (f.status === 'in_progress') {
      stats.in_progress++;
    } else if (f.status === 'pending') {
      stats.pending++;
      stats.estimated_hours_remaining += complexityHours[complexity] || 4;
    } else if (f.status === 'blocked') {
      stats.blocked++;
    }
  });

  stats.percentage = stats.total > 0 ? (stats.completed / stats.total * 100) : 0;
  return stats;
}

function generateTerminalReport(features, stats, detailed) {
  let report = "\n" + "=".repeat(70) + "\n";
  report += "  📊 项目进度报告\n";
  report += "=".repeat(70) + "\n\n";

  report += "## 总体进度\n\n";
  report += `总功能数: ${stats.total}\n`;
  report += `已完成: ${stats.completed} (${stats.percentage.toFixed(1)}%)\n`;
  report += `进行中: ${stats.in_progress}\n`;
  report += `待开始: ${stats.pending}\n`;
  report += `已阻塞: ${stats.blocked}\n`;

  const barLength = 50;
  const completedLength = Math.floor(barLength * stats.percentage / 100);
  const bar = "█".repeat(completedLength) + "░".repeat(barLength - completedLength);
  report += `\n[${bar}] ${stats.percentage.toFixed(1)}%\n`;
  report += `\n预估剩余工作量: ~${stats.estimated_hours_remaining} 小时\n`;

  report += "\n" + "-".repeat(70) + "\n";
  report += "## 按优先级统计\n\n";
  ['critical', 'high', 'medium', 'low'].forEach(p => {
    const count = stats.by_priority[p] || 0;
    if (count > 0) {
      const completed = features.filter(f => f.priority === p && ['completed', 'tested'].includes(f.status)).length;
      const pct = (completed / count * 100).toFixed(1);
      report += `${p.padEnd(10)} ${String(completed).padStart(3)}/${String(count).padEnd(3)} (${pct}%)\n`;
    }
  });

  report += "\n" + "-".repeat(70) + "\n";
  report += "## 按类别统计\n\n";
  Object.entries(stats.by_category)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const completed = features.filter(f => f.category === cat && ['completed', 'tested'].includes(f.status)).length;
      const pct = (completed / count * 100).toFixed(1);
      report += `${cat.padEnd(15)} ${String(completed).padStart(3)}/${String(count).padEnd(3)} (${pct}%)\n`;
    });

  if (detailed) {
    report += "\n" + "-".repeat(70) + "\n";
    report += "## 已完成功能\n\n";
    const completedFeatures = features
      .filter(f => ['completed', 'tested'].includes(f.status))
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))
      .slice(0, 20);

    completedFeatures.forEach(f => {
      const date = f.completed_at ? new Date(f.completed_at).toLocaleString() : '未知';
      const mark = f.tested ? '✓' : ' ';
      report += `[${mark}] #${String(f.id).padStart(3)} ${f.title.slice(0, 50).padEnd(50)} (${date})\n`;
    });

    report += "\n" + "-".repeat(70) + "\n";
    report += "## 待完成功能 (高优先级)\n\n";
    const highPriority = features
      .filter(f => f.status === 'pending' && ['critical', 'high'].includes(f.priority))
      .sort((a, b) => (a.priority === 'critical' ? -1 : 1) || String(a.id).localeCompare(String(b.id)))
      .slice(0, 15);

    highPriority.forEach(f => {
      report += `#${String(f.id).padStart(3)} [${f.priority.padEnd(8)}] ${f.title}\n`;
    });
  }

  report += "\n" + "=".repeat(70) + "\n";
  report += `报告生成时间: ${new Date().toLocaleString()}\n`;
  report += "=".repeat(70) + "\n";

  return report;
}

function generateMarkdownReport(features, stats, detailed) {
  let report = `# 项目进度报告\n\n**生成时间**: ${new Date().toLocaleString()}\n\n## 📊 总体进度\n\n`;
  report += `| 指标 | 数值 |\n|------|------|\n`;
  report += `| 总功能数 | ${stats.total} |\n`;
  report += `| 已完成 | ${stats.completed} (${stats.percentage.toFixed(1)}%) |\n`;
  report += `| 进行中 | ${stats.in_progress} |\n`;
  report += `| 待开始 | ${stats.pending} |\n`;
  report += `| 已阻塞 | ${stats.blocked} |\n`;
  report += `| 预估剩余 | ~${stats.estimated_hours_remaining} 小时 |\n\n`;

  const barLength = 50;
  const completedLength = Math.floor(barLength * stats.percentage / 100);
  report += `### 进度可视化\n\n\`\`\`\n${"█".repeat(completedLength)}${"░".repeat(barLength - completedLength)}\n${stats.percentage.toFixed(1)}% 完成\n\`\`\`\n\n`;

  report += `## 📈 按优先级统计\n\n| 优先级 | 已完成/总数 | 完成率 |\n|--------|-------------|--------|\n`;
  ['critical', 'high', 'medium', 'low'].forEach(p => {
    const count = stats.by_priority[p] || 0;
    if (count > 0) {
      const completed = features.filter(f => f.priority === p && ['completed', 'tested'].includes(f.status)).length;
      report += `| ${p} | ${completed}/${count} | ${(completed / count * 100).toFixed(1)}% |\n`;
    }
  });

  report += `\n## 🗂️ 按类别统计\n\n| 类别 | 已完成/总数 | 完成率 |\n|------|-------------|--------|\n`;
  Object.entries(stats.by_category)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const completed = features.filter(f => f.category === cat && ['completed', 'tested'].includes(f.status)).length;
      report += `| ${cat} | ${completed}/${count} | ${(completed / count * 100).toFixed(1)}% |\n`;
    });

  if (detailed) {
    report += `\n## ✅ 最近完成的功能\n\n`;
    features
      .filter(f => ['completed', 'tested'].includes(f.status))
      .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))
      .slice(0, 20)
      .forEach(f => {
        const date = f.completed_at ? new Date(f.completed_at).toLocaleString() : '未知';
        const mark = f.tested ? '🧪' : '';
        report += `- ${mark} **#${f.id}**: ${f.title} _${date}_\n`;
      });

    report += `\n## 🎯 待完成功能 (高优先级)\n\n`;
    features
      .filter(f => f.status === 'pending' && ['critical', 'high'].includes(f.priority))
      .sort((a, b) => (a.priority === 'critical' ? -1 : 1) || String(a.id).localeCompare(String(b.id)))
      .slice(0, 15)
      .forEach(f => {
        const emoji = f.priority === 'critical' ? '🔴' : '🟠';
        report += `- ${emoji} **#${f.id}**: ${f.title}\n`;
      });
  }

  return report;
}

function generateJsonReport(features, stats) {
  return JSON.stringify({
    generated_at: new Date().toISOString(),
    statistics: stats,
    features: features
  }, null, 2);
}

function generateHtmlReport(features, stats, detailed) {
  // 简化版 HTML 生成
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>项目进度报告</title>
    <style>
        body { font-family: sans-serif; max-width: 1000px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        .stats { display: flex; gap: 20px; margin-bottom: 20px; }
        .card { flex: 1; padding: 15px; border: 1px solid #ddd; border-radius: 8px; text-align: center; }
        .progress { height: 25px; background: #eee; border-radius: 12px; overflow: hidden; margin: 20px 0; }
        .fill { height: 100%; background: #4CAF50; text-align: center; color: white; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f4f4f4; }
    </style>
</head>
<body>
    <h1>📊 项目进度报告</h1>
    <p>生成时间: ${new Date().toLocaleString()}</p>
    <div class="stats">
        <div class="card"><h3>总数</h3><p>${stats.total}</p></div>
        <div class="card"><h3>已完成</h3><p>${stats.completed}</p></div>
        <div class="card"><h3>进行中</h3><p>${stats.in_progress}</p></div>
        <div class="card"><h3>完成率</h3><p>${stats.percentage.toFixed(1)}%</p></div>
    </div>
    <div class="progress"><div class="fill" style="width: ${stats.percentage}%">${stats.percentage.toFixed(1)}%</div></div>
    <h2>按优先级统计</h2>
    <table>
        <tr><th>优先级</th><th>已完成</th><th>总数</th><th>完成率</th></tr>
        ${['critical', 'high', 'medium', 'low'].map(p => {
          const count = stats.by_priority[p] || 0;
          if (count === 0) return '';
          const completed = features.filter(f => f.priority === p && ['completed', 'tested'].includes(f.status)).length;
          return `<tr><td>${p}</td><td>${completed}</td><td>${count}</td><td>${(completed/count*100).toFixed(1)}%</td></tr>`;
        }).join('')}
    </table>
</body>
</html>`;
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
