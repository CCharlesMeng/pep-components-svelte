import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');
const TEMPLATE_DIR = path.join(PROJECT_ROOT, '.ai-workflow', 'templates', 'component');

class ComponentScaffolder {
  constructor(component, mode, templateData) {
    this.component = component;
    this.mode = mode;
    this.data = templateData;
    this.componentDir = path.join(PROJECT_ROOT, 'components', component);
    this.placeholders = this._generatePlaceholders();
  }

  _generatePlaceholders() {
    const parts = this.component.split('-');
    const pascalCase = parts.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
    
    return {
      '{{COMPONENT_NAME}}': this.component,
      '{{COMPONENT_NAME_PASCAL}}': pascalCase,
      '{{DESCRIPTION}}': this.data.description || `${this.component} 组件`,
      '{{INIT_DATE}}': new Date().toISOString(),
    };
  }

  async generate() {
    console.log(`🏗️  从模板创建 ${this.component}`);

    // 检查模板是否存在
    try {
      await fs.access(TEMPLATE_DIR);
    } catch {
      console.error(`❌ 模板目录不存在: ${TEMPLATE_DIR}`);
      console.error(`请确保 .ai-workflow/templates/component/ 目录存在`);
      process.exit(1);
    }

    // 检查组件是否已存在
    try {
      await fs.access(this.componentDir);
      console.error(`❌ 组件已存在: ${this.component}`);
      process.exit(1);
    } catch {
      // 组件不存在，可以创建
    }

    // 1. 拷贝模板目录
    console.log(`📦 拷贝模板...`);
    await this._copyDir(TEMPLATE_DIR, this.componentDir);

    // 2. 替换所有文件中的占位符
    console.log(`✏️  替换占位符...`);
    await this._replacePlaceholdersInDirectory(this.componentDir);

    // 3. 重命名包含占位符的文件
    console.log(`📝 重命名文件...`);
    await this._renamePlaceholderFiles(this.componentDir);

    // 4. 根据 mode 进行增强
    if (this.mode === 'custom' && this.data) {
      console.log(`🎨 应用定制增强...`);
      await this._applyCustomEnhancements();
    }

    console.log(`✅ 组件脚手架创建完成`);
    console.log(`📂 位置: components/${this.component}`);
  }

  async _copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this._copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  async _replacePlaceholdersInDirectory(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this._replacePlaceholdersInDirectory(fullPath);
      } else if (entry.isFile()) {
        await this._replacePlaceholdersInFile(fullPath);
      }
    }
  }

  async _replacePlaceholdersInFile(filePath) {
    try {
      const ext = path.extname(filePath).toLowerCase();
      const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf'];
      if (binaryExts.includes(ext)) return;

      let content = await fs.readFile(filePath, 'utf-8');
      
      for (const [placeholder, value] of Object.entries(this.placeholders)) {
        content = content.replaceAll(placeholder, value);
      }

      await fs.writeFile(filePath, content, 'utf-8');
    } catch (e) {
      // 忽略
    }
  }

  async _renamePlaceholderFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this._renamePlaceholderFiles(fullPath);
      }
    }

    for (const entry of entries) {
      if (entry.name.includes('{{COMPONENT_NAME}}')) {
        const oldPath = path.join(directory, entry.name);
        const newName = entry.name.replaceAll('{{COMPONENT_NAME}}', this.component);
        const newPath = path.join(directory, newName);
        await fs.rename(oldPath, newPath);
      }
    }
  }

  async _applyCustomEnhancements() {
    const features = this.data.features || [];
    if (features.length === 0) return;

    const specFile = path.join(this.componentDir, 'spec.md');
    try {
      await fs.access(specFile);
      await this._enhanceSpec(specFile, features);
    } catch {}

    const featuresFile = path.join(this.componentDir, 'features.json');
    try {
      await fs.access(featuresFile);
      await this._generateInitialFeatures(featuresFile);
    } catch {}
  }

  async _enhanceSpec(specFile, features) {
    let content = await fs.readFile(specFile, 'utf-8');
    const featuresText = features.map(f => `- ${f}`).join('\n');
    const enhancement = `\n\n提取的核心功能:\n${featuresText}\n`;
    
    content = content.replace(
      "<!-- 请描述组件的核心功能 -->",
      `<!-- 请描述组件的核心功能 -->${enhancement}`
    );
    
    await fs.writeFile(specFile, content, 'utf-8');
  }

  async _generateInitialFeatures(featuresFile) {
    const initialFeatures = [
      {
        "id": "INIT-001",
        "category": "setup",
        "priority": "high",
        "title": "组件基础结构",
        "description": "已从模板创建组件骨架",
        "status": "completed",
        "completed_at": new Date().toISOString(),
        "estimated_complexity": 1
      }
    ];
    
    await fs.writeFile(featuresFile, JSON.stringify(initialFeatures, null, 2), 'utf-8');
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      component: { type: 'string' },
      mode: { type: 'string' },
      'template-data': { type: 'string' },
    }
  });

  if (!values.component || !values.mode || !values['template-data']) {
    console.error('用法: node scripts/scaffold-component.js --component <name> --mode <minimal|standard|custom> --template-data <json>');
    process.exit(1);
  }

  let templateData = {};
  try {
    templateData = JSON.parse(values['template-data']);
  } catch (e) {
    console.error(`❌ 模板数据格式错误: ${e}`);
    process.exit(1);
  }

  const scaffolder = new ComponentScaffolder(
    values.component, 
    values.mode, 
    templateData
  );
  await scaffolder.generate();
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
