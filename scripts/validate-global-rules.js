import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { execSync } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class ValidationError {
  constructor(level, rule, message, fixable = false) {
    this.level = level;
    this.rule = rule;
    this.message = message;
    this.fixable = fixable;
  }

  toString() {
    const emoji = { error: "❌", warning: "⚠️", info: "ℹ️" };
    const fixMark = this.fixable ? " [可修复]" : "";
    return `${emoji[this.level] || '•'} [${this.rule}] ${this.message}${fixMark}`;
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      component: { type: 'string' },
      'workspace-root': { type: 'string', default: process.cwd() },
      all: { type: 'boolean' },
      fix: { type: 'boolean' },
      strict: { type: 'boolean' },
    }
  });

  const workspaceRoot = path.resolve(values['workspace-root']);

  console.log("\n" + "=".repeat(70));
  console.log("  全局规则验证");
  console.log("=".repeat(70) + "\n");

  try {
    const rules = await loadGlobalRules(workspaceRoot);
    console.log(`✓ 已加载全局规则 (版本: ${rules.version || 'unknown'})\n`);

    let components = [];
    if (values.component) {
      components = [values.component];
    } else if (values.all) {
      components = await discoverComponents(workspaceRoot);
      console.log(`发现 ${components.length} 个组件\n`);
    } else {
      console.error("请指定 --component 或 --all");
      process.exit(1);
    }

    let allErrors = {};
    for (const component of components) {
      const errors = await validateComponent(component, workspaceRoot, rules);
      if (errors.length > 0) {
        allErrors[component] = errors;
      }
    }

    if (values.fix) {
      console.log("🔧 自动修复可修复的问题...\n");
      for (const [component, errors] of Object.entries(allErrors)) {
        const componentDir = path.join(workspaceRoot, 'components', component);
        await fixIssues(componentDir, errors);
      }
      // 重新验证
      allErrors = {};
      for (const component of components) {
        const errors = await validateComponent(component, workspaceRoot, rules);
        if (errors.length > 0) {
          allErrors[component] = errors;
        }
      }
    }

    if (Object.keys(allErrors).length === 0) {
      console.log("=".repeat(70));
      console.log("  ✅ 完美！所有组件都符合全局规则");
      console.log("=".repeat(70) + "\n");
      process.exit(0);
    }

    let totalErrors = 0, totalWarnings = 0, totalInfos = 0;
    for (const [component, errors] of Object.entries(allErrors)) {
      console.log(`组件: ${component}`);
      errors.forEach(e => {
        if (e.level === 'error') totalErrors++;
        if (e.level === 'warning') totalWarnings++;
        if (e.level === 'info') totalInfos++;
        console.log(`  ${e.toString()}`);
      });
      console.log();
    }

    console.log("=".repeat(70));
    console.log(`  总计: ${totalErrors} 个错误, ${totalWarnings} 个警告, ${totalInfos} 个提示`);
    console.log("=".repeat(70) + "\n");

    if (totalErrors > 0) {
      console.log("❌ 验证失败，请修复错误后再继续\n");
      process.exit(1);
    } else if (totalWarnings > 0 && values.strict) {
      console.log("⚠️  严格模式：存在警告，验证失败\n");
      process.exit(1);
    } else {
      console.log("✅ 验证通过（有一些警告或提示）\n");
      process.exit(0);
    }

  } catch (err) {
    console.error(`\n❌ 错误: ${err.message}\n`);
    process.exit(1);
  }
}

async function loadGlobalRules(workspaceRoot) {
  const rulesFile = path.join(workspaceRoot, '.ai-workflow', 'global-rules.json');
  try {
    const content = await fs.readFile(rulesFile, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { version: "1.0.0", component_naming: { prefix: "pep-", pattern: "^pep-[a-z0-9-]+$" } };
  }
}

async function discoverComponents(workspaceRoot) {
  const componentsDir = path.join(workspaceRoot, 'components');
  try {
    const entries = await fs.readdir(componentsDir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name).sort();
  } catch {
    return [];
  }
}

async function validateComponent(name, root, rules) {
  const errors = [];
  const componentDir = path.join(root, 'components', name);

  // 1. Naming
  const naming = rules.component_naming || {};
  if (naming.prefix && !name.startsWith(naming.prefix)) {
    errors.push(new ValidationError("error", "naming", `必须以 '${naming.prefix}' 开头`));
  }
  if (naming.pattern && !new RegExp(naming.pattern).test(name)) {
    errors.push(new ValidationError("error", "naming", `名称不符合规范: ${name}`));
  }

  // 2. Required files
  const required = ["package.json", "spec.md", "features.json", "README.md"];
  for (const file of required) {
    try {
      await fs.access(path.join(componentDir, file));
    } catch {
      errors.push(new ValidationError("error", "files", `缺少必需文件: ${file}`, true));
    }
  }

  return errors;
}

async function fixIssues(dir, errors) {
  for (const error of errors) {
    if (!error.fixable) continue;
    if (error.message.includes("README.md")) {
      await fs.writeFile(path.join(dir, "README.md"), `# ${path.basename(dir)}\n\nTODO: Add documentation.`);
    }
  }
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
