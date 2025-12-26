#!/usr/bin/env python3
"""
组件合规性检查
==============

检查组件是否符合项目规范：
- 技术栈一致性
- 架构规范
- 需求一致性
- 代码质量
"""

import argparse
import json
from pathlib import Path
from typing import Dict, List, Any, Tuple

def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="检查组件合规性",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "component",
        type=str,
        help="组件名称"
    )
    
    parser.add_argument(
        "--workspace-root",
        type=Path,
        default=Path.cwd(),
        help="Monorepo根目录"
    )
    
    parser.add_argument(
        "--strict",
        action="store_true",
        help="严格模式（任何警告都返回错误）"
    )
    
    parser.add_argument(
        "--fix",
        action="store_true",
        help="自动修复可修复的问题"
    )
    
    return parser.parse_args()


def get_component_dir(workspace_root: Path, component: str) -> Path:
    """获取组件目录"""
    component_dir = workspace_root / "components" / component
    
    if not component_dir.exists():
        raise FileNotFoundError(f"组件目录不存在: {component_dir}")
    
    return component_dir


def load_project_config(workspace_root: Path) -> Dict[str, Any]:
    """加载项目配置"""
    config_file = workspace_root / "cursor-autonomous-coding" / "project-config.json"
    
    if not config_file.exists():
        # 返回默认配置
        return {
            "tech_stack": {
                "framework": "Svelte",
                "language": "TypeScript",
                "styling": "CSS/SCSS",
                "testing": "Vitest"
            },
            "architecture": {
                "component_pattern": "SFC",
                "state_management": "Svelte stores",
                "props_validation": "TypeScript interfaces"
            },
            "required_files": [
                "README.md",
                "spec.md",
                "features.json",
                "package.json"
            ],
            "naming_conventions": {
                "component": "^pep-[a-z0-9-]+$",
                "files": "kebab-case",
                "exports": "PascalCase"
            }
        }
    
    with open(config_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def check_required_files(component_dir: Path, required_files: List[str]) -> Tuple[List[str], List[str]]:
    """检查必需文件"""
    missing = []
    found = []
    
    for file in required_files:
        file_path = component_dir / file
        if file_path.exists():
            found.append(file)
        else:
            missing.append(file)
    
    return found, missing


def check_spec_features_consistency(component_dir: Path) -> Tuple[bool, List[str]]:
    """检查spec.md与features.json的一致性"""
    spec_file = component_dir / "spec.md"
    features_file = component_dir / "features.json"
    
    issues = []
    
    if not spec_file.exists():
        issues.append("spec.md文件不存在")
        return False, issues
    
    if not features_file.exists():
        issues.append("features.json文件不存在")
        return False, issues
    
    # 读取spec内容
    spec_content = spec_file.read_text(encoding='utf-8')
    
    # 读取features
    with open(features_file, 'r', encoding='utf-8') as f:
        features = json.load(f)
    
    # 检查features是否有源自spec的标记
    if isinstance(features, dict) and "spec_version" not in features:
        issues.append("features.json缺少spec_version字段（建议从spec.md生成）")
    
    # 检查是否有足够的功能
    feature_list = features if isinstance(features, list) else features.get("features", [])
    if len(feature_list) < 5:
        issues.append(f"功能数量过少（{len(feature_list)}个），建议从spec.md重新生成")
    
    # 检查是否有待定义的占位符功能
    placeholder_count = sum(1 for f in feature_list if "待定义" in f.get("title", "") or "待定义" in f.get("description", ""))
    if placeholder_count > 0:
        issues.append(f"存在{placeholder_count}个占位符功能，建议完善或从spec.md重新生成")
    
    return len(issues) == 0, issues


def check_tech_stack(component_dir: Path, expected_tech: Dict[str, str]) -> Tuple[bool, List[str]]:
    """检查技术栈一致性"""
    issues = []
    
    # 检查package.json
    package_json = component_dir / "package.json"
    if package_json.exists():
        with open(package_json, 'r', encoding='utf-8') as f:
            pkg = json.load(f)
        
        # 检查依赖
        deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
        
        # 检查Svelte
        if expected_tech.get("framework") == "Svelte":
            if "svelte" not in deps:
                issues.append("未找到svelte依赖")
        
        # 检查TypeScript
        if expected_tech.get("language") == "TypeScript":
            if "typescript" not in deps and "@types/node" not in deps:
                issues.append("未找到TypeScript相关依赖")
    
    # 检查源码文件
    src_dir = component_dir / "src"
    if src_dir.exists():
        svelte_files = list(src_dir.glob("**/*.svelte"))
        ts_files = list(src_dir.glob("**/*.ts"))
        
        if expected_tech.get("framework") == "Svelte" and len(svelte_files) == 0:
            issues.append("未找到.svelte文件")
        
        if expected_tech.get("language") == "TypeScript" and len(ts_files) == 0 and len(svelte_files) == 0:
            issues.append("未找到TypeScript文件")
    
    return len(issues) == 0, issues


def check_architecture(component_dir: Path, arch_rules: Dict[str, str]) -> Tuple[bool, List[str]]:
    """检查架构规范"""
    issues = []
    
    src_dir = component_dir / "src"
    if not src_dir.exists():
        issues.append("缺少src目录")
        return False, issues
    
    # 检查是否有主组件文件
    component_name = component_dir.name
    expected_main_file = src_dir / f"{component_name}.svelte"
    
    if not expected_main_file.exists():
        # 尝试查找其他可能的主文件
        svelte_files = list(src_dir.glob("*.svelte"))
        if len(svelte_files) == 0:
            issues.append(f"未找到主组件文件: {expected_main_file.name}")
        elif len(svelte_files) > 1:
            issues.append(f"找到多个.svelte文件，不确定哪个是主组件")
    
    return len(issues) == 0, issues


def check_documentation(component_dir: Path) -> Tuple[bool, List[str]]:
    """检查文档完整性"""
    issues = []
    
    readme = component_dir / "README.md"
    if readme.exists():
        content = readme.read_text(encoding='utf-8')
        
        required_sections = ["## 概述", "## 用法", "## Props", "## 示例"]
        missing_sections = [s for s in required_sections if s not in content]
        
        if missing_sections:
            issues.append(f"README.md缺少必要章节: {', '.join(missing_sections)}")
    
    spec = component_dir / "spec.md"
    if not spec.exists():
        issues.append("缺少spec.md规格文档")
    elif spec.stat().st_size < 200:
        issues.append("spec.md内容过少（<200字节），可能不完整")
    
    return len(issues) == 0, issues


def generate_report(
    component: str,
    checks: Dict[str, Tuple[bool, List[str]]],
    strict: bool
) -> Tuple[bool, str]:
    """生成检查报告"""
    report_lines = [
        "",
        "=" * 70,
        f"  合规性检查报告: {component}",
        "=" * 70,
        ""
    ]
    
    all_passed = True
    total_issues = 0
    
    check_names = {
        "required_files": "📄 必需文件",
        "spec_consistency": "📋 规格一致性",
        "tech_stack": "🔧 技术栈",
        "architecture": "🏗️  架构规范",
        "documentation": "📖 文档完整性"
    }
    
    for check_key, (passed, issues) in checks.items():
        check_name = check_names.get(check_key, check_key)
        
        if passed:
            report_lines.append(f"✅ {check_name}: 通过")
        else:
            all_passed = False
            total_issues += len(issues)
            report_lines.append(f"❌ {check_name}: 发现 {len(issues)} 个问题")
            for issue in issues:
                report_lines.append(f"   • {issue}")
        
        report_lines.append("")
    
    # 总结
    report_lines.append("=" * 70)
    if all_passed:
        report_lines.append("  ✅ 所有检查通过！")
    else:
        report_lines.append(f"  ⚠️  发现 {total_issues} 个问题需要修复")
    report_lines.append("=" * 70)
    report_lines.append("")
    
    # 建议
    if not all_passed:
        report_lines.append("💡 修复建议:")
        report_lines.append("")
        
        if not checks.get("spec_consistency", (True, []))[0]:
            report_lines.append("  1. 完善 spec.md 规格文档")
            report_lines.append(f"     pep-dev spec {component}")
            report_lines.append("")
        
        if not checks.get("required_files", (True, []))[0]:
            report_lines.append("  2. 创建缺失的必需文件")
            report_lines.append(f"     pep-dev init {component}")
            report_lines.append("")
        
        report_lines.append("  3. 重新运行检查")
        report_lines.append(f"     pep-dev check {component}")
        report_lines.append("")
    
    return all_passed or not strict, "\n".join(report_lines)


def main():
    """主函数"""
    args = parse_args()
    
    print(f"\n🔍 检查组件合规性: {args.component}")
    print(f"   模式: {'严格' if args.strict else '标准'}\n")
    
    try:
        component_dir = get_component_dir(args.workspace_root, args.component)
        config = load_project_config(args.workspace_root)
        
        # 执行各项检查
        checks = {}
        
        # 1. 必需文件
        found, missing = check_required_files(component_dir, config["required_files"])
        checks["required_files"] = (len(missing) == 0, [f"缺少文件: {f}" for f in missing])
        
        # 2. 规格一致性
        checks["spec_consistency"] = check_spec_features_consistency(component_dir)
        
        # 3. 技术栈
        checks["tech_stack"] = check_tech_stack(component_dir, config["tech_stack"])
        
        # 4. 架构规范
        checks["architecture"] = check_architecture(component_dir, config["architecture"])
        
        # 5. 文档完整性
        checks["documentation"] = check_documentation(component_dir)
        
        # 生成报告
        passed, report = generate_report(args.component, checks, args.strict)
        print(report)
        
        # 返回退出码
        sys.exit(0 if passed else 1)
        
    except Exception as e:
        print(f"\n❌ 检查失败: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    import sys
    main()

