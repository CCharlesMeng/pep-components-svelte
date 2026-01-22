import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const COMPONENTS_DIR = path.join(PROJECT_ROOT, 'components');
const TEMPLATE_DIR = path.join(PROJECT_ROOT, '.ai-workflow', 'templates', 'component');

class ComponentCopier {
  constructor(source, target, options) {
    this.source = source;
    this.target = target;
    this.cleanSpec = !!options.cleanSpec;
    this.cleanFeatures = !!options.cleanFeatures;
    this.cleanDev = !!options.cleanDev;

    this.sourceDir = path.join(COMPONENTS_DIR, source);
    this.targetDir = path.join(COMPONENTS_DIR, target);
    this.nameMappings = this._generateNameMappings();
  }

  _generateNameMappings() {
    const sourceParts = this.source.split('-');
    const targetParts = this.target.split('-');

    const toPascal = (parts) => parts.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const toCamel = (parts) => parts[0] + parts.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    const toSnake = (parts) => parts.join('_');

    const sourcePascal = toPascal(sourceParts);
    const targetPascal = toPascal(targetParts);

    const sourceCamel = toCamel(sourceParts);
    const targetCamel = toCamel(targetParts);

    const sourceSnake = toSnake(sourceParts);
    const targetSnake = toSnake(targetParts);

    const sourceUpper = sourceSnake.toUpperCase();
    const targetUpper = targetSnake.toUpperCase();

    return [
      [sourceUpper, targetUpper],
      [sourcePascal, targetPascal],
      [sourceCamel, targetCamel],
      [sourceSnake, targetSnake],
      [this.source, this.target],
    ];
  }

  async copy() {
    console.log(`🚀 从 ${this.source} 拷贝组件模板到 ${this.target}`);

    try {
      await fs.access(this.sourceDir);
    } catch {
      console.error(`❌ 源组件不存在: ${this.source}`);
      await this._listAvailableComponents();
      process.exit(1);
    }

    try {
      await fs.access(this.targetDir);
      console.error(`❌ 目标组件已存在: ${this.target}`);
      process.exit(1);
    } catch {}

    console.log(`📦 拷贝文件...`);
    await this._copyDirectory(this.sourceDir, this.targetDir);

    console.log(`✏️  替换组件名...`);
    await this._replaceNamesInDirectory(this.targetDir);

    console.log(`📝 重命名文件...`);
    await this._renameFiles(this.targetDir);

    if (this.cleanSpec || this.cleanFeatures || this.cleanDev) {
      console.log(`🧹 清理内容...`);
      await this._cleanFiles();
    }

    console.log(`📋 更新 package.json...`);
    await this._updatePackageJson();

    if (this.cleanFeatures) {
      console.log(`📝 生成初始 features.json...`);
      await this._generateInitialFeatures();
    }

    console.log(`✅ 组件拷贝完成`);
    console.log(`📂 位置: components/${this.target}`);
    this._printSummary();
  }

  async _listAvailableComponents() {
    try {
      const entries = await fs.readdir(COMPONENTS_DIR, { withFileTypes: true });
      const components = entries.filter(e => e.isDirectory()).map(e => e.name);
      if (components.length > 0) {
        console.log('\n可用的组件列表:');
        components.sort().forEach(c => console.log(`  - ${c}`));
      }
    } catch {}
  }

  async _copyDirectory(src, dest) {
    const excludePatterns = [
      'node_modules', 'build', 'dist', '.svelte-kit', '__pycache__',
      '.DS_Store', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'
    ];

    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      if (excludePatterns.some(p => entry.name.includes(p))) continue;

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this._copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async _replaceNamesInDirectory(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this._replaceNamesInDirectory(fullPath);
      } else {
        await this._replaceNamesInFile(fullPath);
      }
    }
  }

  async _replaceNamesInFile(filePath) {
    const skipExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf'];
    if (skipExtensions.includes(path.extname(filePath).toLowerCase())) return;

    try {
      let content = await fs.readFile(filePath, 'utf-8');
      for (const [sourceName, targetName] of this.nameMappings) {
        content = content.replaceAll(sourceName, targetName);
      }
      await fs.writeFile(filePath, content, 'utf-8');
    } catch {}
  }

  async _renameFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this._renameFiles(fullPath);
      }
    }

    for (const entry of entries) {
      if (entry.name.includes(this.source)) {
        const oldPath = path.join(directory, entry.name);
        const newName = entry.name.replaceAll(this.source, this.target);
        const newPath = path.join(directory, newName);
        await fs.rename(oldPath, newPath);
      }
    }
  }

  async _cleanFiles() {
    if (this.cleanSpec) {
      const specFile = path.join(this.targetDir, 'spec.md');
      const templateSpec = path.join(TEMPLATE_DIR, 'spec.md');
      try {
        let content = await fs.readFile(templateSpec, 'utf-8');
        for (const [sourceName, targetName] of this.nameMappings) {
          content = content.replaceAll(sourceName, targetName);
        }
        await fs.writeFile(specFile, content, 'utf-8');
      } catch {}
    }

    if (this.cleanFeatures) {
      const featuresFile = path.join(this.targetDir, 'features.json');
      await fs.writeFile(featuresFile, '[]', 'utf-8');
    }

    if (this.cleanDev) {
      const devFile = path.join(this.targetDir, 'DEVELOPMENT.md');
      const templateDev = path.join(TEMPLATE_DIR, 'DEVELOPMENT.md');
      try {
        const content = await fs.readFile(templateDev, 'utf-8');
        await fs.writeFile(devFile, content, 'utf-8');
      } catch {}
    }
  }

  async _updatePackageJson() {
    const packageFile = path.join(this.targetDir, 'package.json');
    try {
      const content = await fs.readFile(packageFile, 'utf-8');
      const pkg = JSON.parse(content);
      pkg.name = this.target;
      pkg.version = '0.1.0';
      pkg.description = `${this.target} 组件（基于 ${this.source} 拷贝）`;
      if (pkg.keywords) {
        pkg.keywords = ['svelte', this.target, 'pep-components'];
      }
      await fs.writeFile(packageFile, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
    } catch {}
  }

  async _generateInitialFeatures() {
    const featuresFile = path.join(this.targetDir, 'features.json');
    const initialFeatures = [
      {
        "id": "INIT-001",
        "category": "setup",
        "priority": "high",
        "title": "组件基础结构",
        "description": `从 ${this.source} 拷贝组件结构并替换名称`,
        "status": "completed",
        "completed_at": new Date().toISOString(),
        "estimated_complexity": 1
      },
      {
        "id": "TODO-001",
        "category": "refactor",
        "priority": "high",
        "title": "根据需求修改组件代码",
        "description": "修改 Props、逻辑和样式以符合新组件的需求",
        "status": "pending",
        "estimated_complexity": 3
      }
    ];
    await fs.writeFile(featuresFile, JSON.stringify(initialFeatures, null, 2) + '\n', 'utf-8');
  }

  _printSummary() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ 拷贝完成\n");
    console.log("✅ 所有文件中的组件名称已替换:");
    console.log(`   ${this.source} → ${this.target}`);
    this.nameMappings.slice(0, 3).forEach(([s, t]) => {
      if (s !== this.source) console.log(`   ${s} → ${t}`);
    });
    console.log("\n✅ 组件可以直接编译运行（需要根据实际需求修改代码）\n");
    console.log("📝 下一步操作:\n");
    console.log(`1️⃣  编写需求规格\n   vim components/${this.target}/spec.md\n`);
    console.log(`2️⃣  修改组件代码\n   vim components/${this.target}/src/${this.target}.svelte\n`);
    console.log(`3️⃣  生成开发任务\n   /pep-plan ${this.target}\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: 'string' },
      target: { type: 'string' },
      'clean-spec': { type: 'boolean' },
      'clean-features': { type: 'boolean' },
      'clean-dev': { type: 'boolean' },
    }
  });

  if (!values.source || !values.target) {
    console.error('用法: node scripts/copy-template.js --source <name> --target <name> [--clean-spec] [--clean-features] [--clean-dev]');
    process.exit(1);
  }

  const copier = new ComponentCopier(values.source, values.target, {
    cleanSpec: values['clean-spec'],
    cleanFeatures: values['clean-features'],
    cleanDev: values['clean-dev'],
  });
  await copier.copy();
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
