#!/usr/bin/env python3
"""
全局规则验证脚本
==============

验证组件是否遵循monorepo的全局规则
"""

import argparse
import json
import re
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Tuple


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="验证组件是否遵循全局规则",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--component",
        type=str,
        help="组件名称（验证单个组件）"
    )
    
    parser.add_argument(
        "--workspace-root",
        type=Path,
        default=Path.cwd(),
        help="Monorepo根目录"
    )
    
    parser.add_argument(
        "--all",
        action="store_true",
        help="验证所有组件"
    )
    
    parser.add_argument(
        "--fix",
        action="store_true",
        help="自动修复可修复的问题"
    )
    
    parser.add_argument(
        "--strict",
        action="store_true",
        help="严格模式（警告也视为错误）"
    )
    
    return parser.parse_args()


def load_global_rules(workspace_root: Path) -> Dict[str, Any]:
    """加载全局规则"""
    rules_file = workspace_root / "cursor-autonomous-coding" / "global-rules.json"
    
    if not rules_file.exists():
        raise FileNotFoundError(f"全局规则文件不存在: {rules_file}")
    
    with open(rules_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def discover_components(workspace_root: Path) -> List[str]:
    """发现所有组件"""
    components_dir = workspace_root / "components"
    
    if not components_dir.exists():
        return []
    
    components = []
    for item in components_dir.iterdir():
        if item.is_dir() and not item.name.startswith('.'):
            components.append(item.name)
    
    return sorted(components)


class ValidationError:
    """验证错误"""
    def __init__(self, level: str, rule: str, message: str, fixable: bool = False):
        self.level = level  # error, warning, info
        self.rule = rule
        self.message = message
        self.fixable = fixable
    
    def __str__(self):
        emoji = {"error": "❌", "warning": "⚠️", "info": "ℹ️"}
        fix_mark = " [可修复]" if self.fixable else ""
        return f"{emoji.get(self.level, '•')} [{self.rule}] {self.message}{fix_mark}"


def validate_component_naming(component_name: str, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证组件命名"""
    errors = []
    naming_rules = rules.get("component_naming", {})
    
    # 检查前缀
    prefix = naming_rules.get("prefix", "")
    if prefix and not component_name.startswith(prefix):
        errors.append(ValidationError(
            "error",
            "component_naming",
            f"组件名称必须以 '{prefix}' 开头，当前: {component_name}"
        ))
    
    # 检查命名模式
    pattern = naming_rules.get("pattern", "")
    if pattern and not re.match(pattern, component_name):
        errors.append(ValidationError(
            "error",
            "component_naming",
            f"组件名称不符合规范: {component_name}，应匹配: {pattern}"
        ))
    
    # 检查禁用名称
    forbidden = naming_rules.get("forbidden", [])
    if component_name in forbidden:
        errors.append(ValidationError(
            "error",
            "component_naming",
            f"禁止使用的组件名称: {component_name}"
        ))
    
    return errors


def validate_required_files(component_dir: Path, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证必需文件"""
    errors = []
    file_rules = rules.get("required_files", {})
    
    required_files = file_rules.get("files", [])
    for file_path in required_files:
        full_path = component_dir / file_path
        if not full_path.exists():
            errors.append(ValidationError(
                "error",
                "required_files",
                f"缺少必需文件: {file_path}",
                fixable=True
            ))
    
    return errors


def validate_features_json(component_dir: Path, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证功能清单"""
    errors = []
    feature_rules = rules.get("feature_requirements", {})
    
    features_file = component_dir / "features.json"
    if not features_file.exists():
        errors.append(ValidationError(
            "error",
            "features",
            "缺少 features.json 文件"
        ))
        return errors
    
    try:
        with open(features_file, 'r', encoding='utf-8') as f:
            features = json.load(f)
        
        # 检查功能数量
        min_features = feature_rules.get("min_features", 0)
        max_features = feature_rules.get("max_features", 999)
        
        if len(features) < min_features:
            errors.append(ValidationError(
                "warning",
                "features",
                f"功能数量过少: {len(features)}，建议至少 {min_features} 个"
            ))
        
        if len(features) > max_features:
            errors.append(ValidationError(
                "warning",
                "features",
                f"功能数量过多: {len(features)}，建议不超过 {max_features} 个"
            ))
        
        # 检查必需类别
        required_categories = feature_rules.get("categories", {}).get("required", [])
        existing_categories = {f.get("category") for f in features}
        missing_categories = set(required_categories) - existing_categories
        
        if missing_categories:
            errors.append(ValidationError(
                "warning",
                "features",
                f"缺少必需的功能类别: {', '.join(missing_categories)}"
            ))
        
        # 检查验收标准
        min_criteria = feature_rules.get("acceptance_criteria", {}).get("min_count", 0)
        for feature in features:
            criteria = feature.get("acceptance_criteria", [])
            if len(criteria) < min_criteria:
                errors.append(ValidationError(
                    "warning",
                    "features",
                    f"功能 #{feature.get('id')} 的验收标准不足 {min_criteria} 条"
                ))
    
    except json.JSONDecodeError:
        errors.append(ValidationError(
            "error",
            "features",
            "features.json 格式错误"
        ))
    
    return errors


def validate_readme(component_dir: Path, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证README文档"""
    errors = []
    doc_rules = rules.get("documentation_requirements", {}).get("readme", {})
    
    readme_file = component_dir / "README.md"
    if not readme_file.exists():
        errors.append(ValidationError(
            "error",
            "documentation",
            "缺少 README.md 文件",
            fixable=True
        ))
        return errors
    
    content = readme_file.read_text(encoding='utf-8').lower()
    
    required_sections = doc_rules.get("required_sections", [])
    for section in required_sections:
        if section.lower() not in content:
            errors.append(ValidationError(
                "warning",
                "documentation",
                f"README缺少必需章节: {section}"
            ))
    
    return errors


def validate_git_branch(component_dir: Path, component_name: str, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证Git分支命名"""
    errors = []
    git_rules = rules.get("git_requirements", {}).get("branch_naming", {})
    
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=component_dir,
            capture_output=True,
            text=True,
            check=True
        )
        
        branch_name = result.stdout.strip()
        pattern = git_rules.get("pattern", "")
        
        if pattern and not re.match(pattern, branch_name):
            expected = f"component/{component_name}"
            errors.append(ValidationError(
                "info",
                "git_branch",
                f"建议使用标准分支名称: {expected}，当前: {branch_name}"
            ))
    
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass
    
    return errors


def validate_package_json(component_dir: Path, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证package.json"""
    errors = []
    
    package_file = component_dir / "package.json"
    if not package_file.exists():
        errors.append(ValidationError(
            "error",
            "package",
            "缺少 package.json 文件"
        ))
        return errors
    
    try:
        with open(package_file, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
        
        # 检查必需字段
        required_fields = ["name", "version", "type", "exports"]
        for field in required_fields:
            if field not in package_data:
                errors.append(ValidationError(
                    "warning",
                    "package",
                    f"package.json缺少字段: {field}"
                ))
    
    except json.JSONDecodeError:
        errors.append(ValidationError(
            "error",
            "package",
            "package.json 格式错误"
        ))
    
    return errors


def validate_component(component_name: str, workspace_root: Path, rules: Dict[str, Any]) -> List[ValidationError]:
    """验证单个组件"""
    errors = []
    component_dir = workspace_root / "components" / component_name
    
    if not component_dir.exists():
        return [ValidationError("error", "component", f"组件目录不存在: {component_name}")]
    
    print(f"  验证组件: {component_name}")
    
    # 1. 验证命名
    errors.extend(validate_component_naming(component_name, rules))
    
    # 2. 验证必需文件
    errors.extend(validate_required_files(component_dir, rules))
    
    # 3. 验证功能清单
    errors.extend(validate_features_json(component_dir, rules))
    
    # 4. 验证文档
    errors.extend(validate_readme(component_dir, rules))
    
    # 5. 验证Git分支
    errors.extend(validate_git_branch(component_dir, component_name, rules))
    
    # 6. 验证package.json
    errors.extend(validate_package_json(component_dir, rules))
    
    return errors


def fix_issues(component_dir: Path, errors: List[ValidationError]) -> int:
    """自动修复问题"""
    fixed = 0
    
    for error in errors:
        if not error.fixable:
            continue
        
        if "缺少必需文件: README.md" in error.message:
            readme_file = component_dir / "README.md"
            component_name = component_dir.name
            
            template = f"""# {component_name}

## Installation

\`\`\`bash
pnpm add {component_name}
\`\`\`

## Usage

\`\`\`svelte
<script>
  import {{ ComponentName }} from '{component_name}';
</script>

<ComponentName />
\`\`\`

## Props

TODO: 添加Props文档

## Events

TODO: 添加Events文档

## Slots

TODO: 添加Slots文档

## Examples

TODO: 添加示例

## Accessibility

TODO: 添加无障碍说明
"""
            
            readme_file.write_text(template, encoding='utf-8')
            fixed += 1
            print(f"    ✓ 已创建 README.md")
        
        elif "缺少必需文件: DEVELOPMENT.md" in error.message:
            dev_file = component_dir / "DEVELOPMENT.md"
            component_name = component_dir.name
            
            template = f"""# {component_name} 开发进度

## 组件信息

**组件名**: {component_name}
**状态**: 开发中

## 开发状态

| 指标 | 数值 |
|------|------|
| 总功能数 | - |
| 已完成 | 0 |
| 完成率 | 0% |

## 最近更新

待更新...
"""
            
            dev_file.write_text(template, encoding='utf-8')
            fixed += 1
            print(f"    ✓ 已创建 DEVELOPMENT.md")
    
    return fixed


def main():
    """主函数"""
    args = parse_args()
    
    print("\n" + "="*70)
    print("  全局规则验证")
    print("="*70 + "\n")
    
    try:
        # 加载全局规则
        rules = load_global_rules(args.workspace_root)
        print(f"✓ 已加载全局规则 (版本: {rules.get('version', 'unknown')})\n")
        
        # 确定要验证的组件
        if args.component:
            components = [args.component]
        elif args.all:
            components = discover_components(args.workspace_root)
            print(f"发现 {len(components)} 个组件\n")
        else:
            print("请指定 --component 或 --all")
            return 1
        
        # 验证每个组件
        all_errors = {}
        for component in components:
            errors = validate_component(component, args.workspace_root, rules)
            if errors:
                all_errors[component] = errors
        
        print()
        
        # 自动修复
        if args.fix:
            print("🔧 自动修复可修复的问题...\n")
            total_fixed = 0
            for component, errors in all_errors.items():
                component_dir = args.workspace_root / "components" / component
                fixed = fix_issues(component_dir, errors)
                total_fixed += fixed
            
            if total_fixed > 0:
                print(f"\n✓ 已修复 {total_fixed} 个问题\n")
                
                # 重新验证
                all_errors = {}
                for component in components:
                    errors = validate_component(component, args.workspace_root, rules)
                    if errors:
                        all_errors[component] = errors
        
        # 显示结果
        if not all_errors:
            print("="*70)
            print("  ✅ 完美！所有组件都符合全局规则")
            print("="*70 + "\n")
            return 0
        
        # 统计错误
        total_errors = sum(
            len([e for e in errors if e.level == "error"])
            for errors in all_errors.values()
        )
        total_warnings = sum(
            len([e for e in errors if e.level == "warning"])
            for errors in all_errors.values()
        )
        total_infos = sum(
            len([e for e in errors if e.level == "info"])
            for errors in all_errors.values()
        )
        
        print("="*70)
        print("  验证结果")
        print("="*70 + "\n")
        
        for component, errors in all_errors.items():
            print(f"组件: {component}")
            
            comp_errors = [e for e in errors if e.level == "error"]
            comp_warnings = [e for e in errors if e.level == "warning"]
            comp_infos = [e for e in errors if e.level == "info"]
            
            if comp_errors:
                print("\n  错误:")
                for error in comp_errors:
                    print(f"    {error}")
            
            if comp_warnings:
                print("\n  警告:")
                for warning in comp_warnings[:5]:  # 最多显示5个
                    print(f"    {warning}")
                if len(comp_warnings) > 5:
                    print(f"    ... 还有 {len(comp_warnings) - 5} 个警告")
            
            if comp_infos:
                print("\n  提示:")
                for info in comp_infos[:3]:  # 最多显示3个
                    print(f"    {info}")
            
            print()
        
        # 总结
        print("="*70)
        print(f"  总计: {total_errors} 个错误, {total_warnings} 个警告, {total_infos} 个提示")
        print("="*70 + "\n")
        
        if total_errors > 0:
            print("❌ 验证失败，请修复错误后再继续\n")
            return 1
        elif total_warnings > 0 and args.strict:
            print("⚠️  严格模式：存在警告，验证失败\n")
            return 1
        else:
            print("✅ 验证通过（有一些警告或提示）\n")
            return 0
    
    except Exception as e:
        print(f"❌ 错误: {e}\n")
        raise


if __name__ == "__main__":
    exit(main())

