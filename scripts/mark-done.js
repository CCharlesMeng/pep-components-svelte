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
      'feature-id': { type: 'string' },
      component: { type: 'string' },
      'project-dir': { type: 'string', default: process.cwd() },
      'commit-hash': { type: 'string' },
      tested: { type: 'boolean' },
      notes: { type: 'string' },
    }
  });

  if (!values['feature-id']) {
    console.error('用法: node scripts/mark-done.js --feature-id <id> [--component <name>] [--tested] [--notes <text>]');
    process.exit(1);
  }

  const featureId = values['feature-id'];
  const projectDir = path.resolve(values['project-dir']);

  console.log("\n" + "=".repeat(60));
  console.log("  标记功能完成");
  console.log("=".repeat(60) + "\n");

  try {
    const featuresFile = await getFeaturesFile(projectDir, values.component);
    const features = await loadFeatures(featuresFile);
    
    const feature = features.find(f => String(f.id) === String(featureId));
    if (!feature) {
      console.error(`❌ 错误: 功能 #${featureId} 不存在\n`);
      process.exit(1);
    }

    if (['completed', 'tested'].includes(feature.status)) {
      console.warn(`⚠️  警告: 功能 #${featureId} 已经标记为 ${feature.status}`);
      console.warn(`   ${feature.title}\n`);
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => rl.question('是否要更新状态？(y/N): ', resolve));
      rl.close();

      if (answer.toLowerCase() !== 'y') {
        console.log("已取消\n");
        return;
      }
    }

    console.log(`功能: #${feature.id} - ${feature.title}`);
    console.log(`类别: ${feature.category} | 优先级: ${feature.priority}\n`);

    let commitHash = values['commit-hash'];
    if (!commitHash) {
      commitHash = getLatestCommitHash(projectDir);
      if (commitHash) {
        console.log(`✓ 自动获取最新提交: ${commitHash}`);
      } else {
        console.warn("⚠️  无法获取Git提交哈希");
      }
    }

    feature.status = values.tested ? 'tested' : 'completed';
    feature.completed_at = new Date().toISOString();
    feature.commit_hash = commitHash;
    feature.tested = !!values.tested;
    if (values.notes) {
      feature.completion_notes = values.notes;
    }

    await saveFeatures(featuresFile, features);
    console.log(`✓ 功能清单已更新\n`);

    const archiveFile = await archiveCompletedTask(projectDir, feature, values.notes, values.component);
    console.log(`✓ 任务已归档: ${path.basename(archiveFile)}\n`);

    await clearCurrentTask(projectDir, values.component);
    console.log(`✓ 当前任务已清理（准备接收下一个任务）\n`);

    await updateSessionHistory(projectDir, feature, values.component);
    console.log(`✓ 会话历史已更新\n`);

    await updateProgressFile(projectDir, features, feature, values.component);
    console.log(`✓ 进度文档已更新\n`);

    const total = features.length;
    const completed = features.filter(f => ['completed', 'tested'].includes(f.status)).length;
    const percentage = total > 0 ? (completed / total * 100) : 0;

    console.log("=".repeat(60));
    console.log(`  ✅ 完成标记成功！`);
    console.log("=".repeat(60));
    console.log(`\n当前进度: ${completed}/${total} (${percentage.toFixed(1)}%)\n`);

    console.log("💡 下一步:");
    console.log("   1. 确保代码已提交Git");
    console.log("   2. 运行: node scripts/next-task.js");
    console.log("   3. 继续下一个功能\n");

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

async function saveFeatures(featuresFile, features) {
  const content = await fs.readFile(featuresFile, 'utf-8');
  const data = JSON.parse(content);
  
  let dataToSave;
  if (!Array.isArray(data) && data && data.features) {
    data.features = features;
    dataToSave = data;
  } else {
    dataToSave = features;
  }

  await fs.writeFile(featuresFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
}

function getLatestCommitHash(projectDir) {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: projectDir, encoding: 'utf-8' }).trim();
  } catch {
    return null;
  }
}

async function archiveCompletedTask(projectDir, feature, notes, component) {
  const archiveDir = component 
    ? path.join(projectDir, 'components', component, '.cursor-archive')
    : path.join(projectDir, '.cursor-archive');

  await fs.mkdir(archiveDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');
  const safeTitle = (feature.title || 'untitled').replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 50);
  const archiveFile = path.join(archiveDir, `${timestamp}-${String(feature.id).padStart(3, '0')}-${safeTitle}.md`);

  const archiveContent = `# ${feature.title}

## 基本信息

- **功能ID**: ${feature.id}
- **类别**: ${feature.category || 'N/A'}
- **优先级**: ${feature.priority || 'N/A'}
- **复杂度**: ${feature.estimated_complexity || 'N/A'}
- **完成时间**: ${feature.completed_at}
- **提交哈希**: ${feature.commit_hash || 'N/A'}
- **是否测试**: ${feature.tested ? '是' : '否'}

## 功能描述

${feature.description || 'N/A'}

## 验收标准

${(feature.acceptance_criteria || []).map((c, i) => `${i + 1}. ${c}`).join('\n')}
${notes ? `\n## 完成备注\n\n${notes}\n` : ''}
---

*归档时间: ${new Date().toLocaleString()}*
`;

  await fs.writeFile(archiveFile, archiveContent, 'utf-8');
  return archiveFile;
}

async function clearCurrentTask(projectDir, component) {
  const sessionDir = component 
    ? path.join(projectDir, 'components', component, '.cursor-session')
    : path.join(projectDir, '.cursor-session');

  const taskFile = path.join(sessionDir, 'current-task.md');
  try {
    await fs.unlink(taskFile);
  } catch {}
}

async function updateSessionHistory(projectDir, feature, component) {
  const sessionDir = component 
    ? path.join(projectDir, 'components', component, '.cursor-session')
    : path.join(projectDir, '.cursor-session');

  await fs.mkdir(sessionDir, { recursive: true });
  const historyFile = path.join(sessionDir, 'session-history.json');

  let history = [];
  try {
    const content = await fs.readFile(historyFile, 'utf-8');
    history = JSON.parse(content);
  } catch {}

  history.push({
    feature_id: feature.id,
    title: feature.title,
    completed_at: feature.completed_at,
    commit_hash: feature.commit_hash,
    tested: feature.tested
  });

  await fs.writeFile(historyFile, JSON.stringify(history, null, 2), 'utf-8');
}

async function updateProgressFile(projectDir, features, completedFeature, component) {
  const progressFile = component 
    ? path.join(projectDir, 'components', component, 'DEVELOPMENT.md')
    : path.join(projectDir, 'cursor-progress.md');

  try {
    await fs.access(progressFile);
    let content = await fs.readFile(progressFile, 'utf-8');

    const total = features.length;
    const completed = features.filter(f => ['completed', 'tested'].includes(f.status)).length;
    const inProgress = features.filter(f => f.status === 'in_progress').length;
    const pending = features.filter(f => f.status === 'pending').length;
    const percentage = total > 0 ? (completed / total * 100) : 0;

    const statsTable = `| 指标 | 数值 |
|------|------|
| 总功能数 | ${total} |
| 已完成 | ${completed} |
| 进行中 | ${inProgress} |
| 待开始 | ${pending} |
| 完成率 | ${percentage.toFixed(1)}% |`;

    if (content.includes("| 指标 | 数值 |")) {
      content = content.replace(/\| 指标 \| 数值 \|[\s\S]*?\| 完成率 \|.*% \|/, statsTable);
    }

    const sessionDate = new Date().toISOString().split('T')[0];
    const completionNote = `\n- [x] 功能 #${completedFeature.id}: ${completedFeature.title} (${new Date().toLocaleTimeString()})`;

    if (content.includes("### Session") && content.includes(sessionDate)) {
      if (content.includes("**完成的功能**:")) {
        content = content.replace("**完成的功能**:", `**完成的功能**:${completionNote}`);
      }
    }

    await fs.writeFile(progressFile, content, 'utf-8');
  } catch {}
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
