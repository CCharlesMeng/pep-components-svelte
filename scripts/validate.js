import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

class ValidationError {
  constructor(level, featureId, message, fixable = false) {
    this.level = level; // error, warning, info
    this.featureId = featureId;
    this.message = message;
    this.fixable = fixable;
  }

  toString() {
    const emoji = { error: "❌", warning: "⚠️", info: "ℹ️" };
    const fixMark = this.fixable ? " [可修复]" : "";
    return `${emoji[this.level] || '•'} 功能 #${this.featureId}: ${this.message}${fixMark}`;
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      component: { type: 'string' },
      'project-dir': { type: 'string', default: process.cwd() },
      fix: { type: 'boolean' },
      strict: { type: 'boolean' },
    }
  });

  const projectDir = path.resolve(values['project-dir']);

  console.log("\n" + "=".repeat(60));
  console.log("  验证功能清单");
  console.log("=".repeat(60) + "\n");

  try {
    const featuresFile = await getFeaturesFile(projectDir, values.component);
    let features = await loadFeatures(featuresFile);
    const componentInfo = values.component ? ` (组件: ${values.component})` : "";
    console.log(`✓ 加载了 ${features.length} 个功能${componentInfo}\n`);

    let allErrors = [];
    console.log("🔍 验证中...");

    console.log("  1. 检查JSON schema...");
    allErrors.push(...validateSchema(features));

    console.log("  2. 检查ID唯一性和连续性...");
    allErrors.push(...validateIds(features));

    console.log("  3. 检查依赖关系...");
    allErrors.push(...validateDependencies(features));

    console.log("  4. 检查状态一致性...");
    allErrors.push(...validateStatusConsistency(features));

    console.log("  5. 检查内容质量...");
    allErrors.push(...validateContentQuality(features));

    console.log();

    if (values.fix && allErrors.some(e => e.fixable)) {
      console.log("🔧 自动修复可修复的问题...");
      const fixedCount = fixIssues(features, allErrors);
      if (fixedCount > 0) {
        await saveFeatures(featuresFile, features);
        console.log(`\n✓ 已修复 ${fixedCount} 个问题并保存\n`);
        
        // 重新验证
        allErrors = [];
        allErrors.push(...validateSchema(features));
        allErrors.push(...validateIds(features));
        allErrors.push(...validateDependencies(features));
        allErrors.push(...validateStatusConsistency(features));
        allErrors.push(...validateContentQuality(features));
      }
    }

    const errors = allErrors.filter(e => e.level === 'error');
    const warnings = allErrors.filter(e => e.level === 'warning');
    const infos = allErrors.filter(e => e.level === 'info');

    console.log("=".repeat(60));
    console.log("  验证结果");
    console.log("=".repeat(60) + "\n");

    if (errors.length > 0) {
      console.log(`❌ 错误 (${errors.length}):\n`);
      errors.forEach(e => console.log(`  ${e.toString()}`));
      console.log();
    }

    if (warnings.length > 0) {
      console.log(`⚠️  警告 (${warnings.length}):\n`);
      warnings.slice(0, 10).forEach(e => console.log(`  ${e.toString()}`));
      if (warnings.length > 10) console.log(`  ... 还有 ${warnings.length - 10} 个警告\n`);
      console.log();
    }

    if (infos.length > 0) {
      console.log(`ℹ️  提示 (${infos.length}):\n`);
      infos.slice(0, 5).forEach(e => console.log(`  ${e.toString()}`));
      if (infos.length > 5) console.log(`  ... 还有 ${infos.length - 5} 个提示\n`);
      console.log();
    }

    if (errors.length === 0 && warnings.length === 0 && infos.length === 0) {
      console.log("✅ 完美！没有发现任何问题。\n");
      process.exit(0);
    } else if (errors.length === 0) {
      if (values.strict) {
        console.log("⚠️  严格模式：存在警告，验证失败。\n");
        process.exit(1);
      } else {
        console.log("✅ 没有错误，但有一些警告或提示。\n");
        process.exit(0);
      }
    } else {
      console.log(`❌ 发现 ${errors.length} 个错误，请修复后再继续。\n`);
      process.exit(1);
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

async function saveFeatures(featuresFile, features) {
  const content = await fs.readFile(featuresFile, 'utf-8');
  const data = JSON.parse(content);
  let dataToSave = Array.isArray(data) ? features : { ...data, features };
  await fs.writeFile(featuresFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
}

function validateSchema(features) {
  const errors = [];
  const requiredFields = ["id", "category", "priority", "title", "description", "status"];
  const validStatuses = ["pending", "in_progress", "completed", "tested", "blocked"];
  const validPriorities = ["critical", "high", "medium", "low"];
  const validComplexities = ["low", "medium", "high"];

  features.forEach(f => {
    const fid = f.id ?? "未知";
    requiredFields.forEach(field => {
      if (!(field in f)) errors.push(new ValidationError("error", fid, `缺少必需字段: ${field}`));
    });

    if (typeof f.id !== 'number') errors.push(new ValidationError("error", fid, "ID必须是整数"));
    if (f.status && !validStatuses.includes(f.status)) errors.push(new ValidationError("error", fid, `无效的status: ${f.status}`));
    if (f.priority && !validPriorities.includes(f.priority)) errors.push(new ValidationError("error", fid, `无效的priority: ${f.priority}`));
    if (f.estimated_complexity && !validComplexities.includes(f.estimated_complexity)) {
      errors.push(new ValidationError("warning", fid, `无效的estimated_complexity: ${f.estimated_complexity}`, true));
    }
    if (f.acceptance_criteria && !Array.isArray(f.acceptance_criteria)) errors.push(new ValidationError("error", fid, "acceptance_criteria必须是数组"));
    if (f.dependencies && !Array.isArray(f.dependencies)) errors.push(new ValidationError("error", fid, "dependencies必须是数组"));
  });
  return errors;
}

function validateIds(features) {
  const errors = [];
  const ids = features.map(f => f.id).filter(id => typeof id === 'number');
  const seen = new Set();
  ids.forEach(id => {
    if (seen.has(id)) errors.push(new ValidationError("error", id, "重复的ID"));
    seen.add(id);
  });

  if (ids.length > 0) {
    const maxId = Math.max(...ids);
    for (let i = 1; i <= maxId; i++) {
      if (!seen.has(i)) errors.push(new ValidationError("warning", 0, `ID不连续，缺失: ${i}`));
    }
  }
  return errors;
}

function validateDependencies(features) {
  const errors = [];
  const validIds = new Set(features.map(f => f.id));

  features.forEach(f => {
    const deps = f.dependencies || [];
    deps.forEach(depId => {
      if (!validIds.has(depId)) errors.push(new ValidationError("error", f.id, `依赖不存在的功能: #${depId}`));
      if (depId === f.id) errors.push(new ValidationError("error", f.id, "不能依赖自己"));
    });
  });

  // 循环依赖检查 (DFS)
  const visited = new Set();
  const recStack = new Set();

  function hasCycle(id) {
    visited.add(id);
    recStack.add(id);
    const feature = features.find(f => f.id === id);
    if (feature) {
      for (const depId of (feature.dependencies || [])) {
        if (!visited.has(depId)) {
          if (hasCycle(depId)) return true;
        } else if (recStack.has(depId)) return true;
      }
    }
    recStack.delete(id);
    return false;
  }

  features.forEach(f => {
    if (!visited.has(f.id)) {
      if (hasCycle(f.id)) errors.push(new ValidationError("error", f.id, "检测到循环依赖"));
    }
  });

  return errors;
}

function validateStatusConsistency(features) {
  const errors = [];
  features.forEach(f => {
    const isDone = ['completed', 'tested'].includes(f.status);
    if (isDone && !f.completed_at) errors.push(new ValidationError("warning", f.id, "已完成但缺少completed_at字段", true));
    if (!isDone && f.completed_at) errors.push(new ValidationError("warning", f.id, `状态为${f.status}但有completed_at字段`));
    if (isDone && !f.commit_hash) errors.push(new ValidationError("info", f.id, "已完成但缺少commit_hash（建议添加）"));
    
    (f.dependencies || []).forEach(depId => {
      const dep = features.find(feat => feat.id === depId);
      if (isDone && dep && !['completed', 'tested'].includes(dep.status)) {
        errors.push(new ValidationError("warning", f.id, `已完成但依赖#${depId}尚未完成`));
      }
    });
  });
  return errors;
}

function validateContentQuality(features) {
  const errors = [];
  features.forEach(f => {
    const title = f.title || "";
    if (!title.trim()) errors.push(new ValidationError("error", f.id, "标题为空"));
    else if (title.length < 5) errors.push(new ValidationError("warning", f.id, "标题过短"));
    else if (title.includes("待定义") || title.toUpperCase().includes("TODO")) errors.push(new ValidationError("info", f.id, "标题包含占位符"));

    const desc = f.description || "";
    if (!desc.trim()) errors.push(new ValidationError("warning", f.id, "描述为空"));
    else if (desc.length < 10) errors.push(new ValidationError("warning", f.id, "描述过短"));

    if (!f.acceptance_criteria || f.acceptance_criteria.length === 0) errors.push(new ValidationError("warning", f.id, "没有验收标准"));
  });
  return errors;
}

function fixIssues(features, errors) {
  let count = 0;
  errors.forEach(e => {
    if (!e.fixable) return;
    const f = features.find(feat => feat.id === e.featureId);
    if (!f) return;

    if (e.message.includes("已完成但缺少completed_at")) {
      f.completed_at = new Date().toISOString();
      count++;
    } else if (e.message.includes("无效的estimated_complexity")) {
      f.estimated_complexity = "medium";
      count++;
    }
  });
  return count;
}

main().catch(err => {
  console.error('脚本执行出错:', err);
  process.exit(1);
});
