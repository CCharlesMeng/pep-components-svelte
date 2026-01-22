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
      mode: { type: 'string', default: 'generate' },
    }
  });

  if (!values.component) {
    console.error('用法: node scripts/generate-features.js --component <name> [--mode generate|merge]');
    process.exit(1);
  }

  const componentDir = path.join(PROJECT_ROOT, 'components', values.component);
  
  try {
    await fs.access(componentDir);
  } catch {
    console.error(`❌ 组件不存在: ${values.component}`);
    process.exit(1);
  }

  const specFile = path.join(componentDir, 'spec.md');
  const featuresFile = path.join(componentDir, 'features.json');

  try {
    await fs.access(specFile);
  } catch {
    console.error(`❌ spec.md 不存在`);
    console.error(`请先创建: ${specFile}`);
    process.exit(1);
  }

  const specContent = await fs.readFile(specFile, 'utf-8');

  if (specContent.trim().length < 100 || specContent.includes('<!-- 请描述')) {
    console.warn(`⚠️  spec.md 内容不足或仍为模板`);
    console.warn(`请先完善 spec.md 内容，再运行此脚本`);
    process.exit(1);
  }

  console.log(`📝 读取 spec.md: ${specContent.length} 字符`);

  if (values.mode === 'generate') {
    try {
      await fs.access(featuresFile);
      const backupDir = path.join(componentDir, '.component-dev');
      await fs.mkdir(backupDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19).replace('T', '_');
      const backupFile = path.join(backupDir, `features.backup.${timestamp}.json`);
      await fs.copyFile(featuresFile, backupFile);
      console.log(`📦 备份现有 features.json → ${path.basename(backupFile)}`);
    } catch {}
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`📋 spec.md 内容预览`);
  console.log(`${'='.repeat(70)}\n`);
  console.log(specContent.slice(0, 500));
  if (specContent.length > 500) {
    console.log(`\n... (共 ${specContent.length} 字符)\n`);
  }
  console.log(`${'='.repeat(70)}\n`);
  
  console.log(`💡 接下来需要 AI 根据上述 spec.md 生成 features.json`);
  console.log(`\n请在 Cursor 中运行:`);
  console.log(`  /pep-plan ${values.component}`);
  console.log(`\nAI 会根据 spec.md 自动生成详细的任务列表。`);
  console.log(`\n${'='.repeat(70)}`);
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
