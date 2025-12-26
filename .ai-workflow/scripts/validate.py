#!/usr/bin/env python3
"""
验证功能清单
==========

验证功能清单的正确性和完整性
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict, Any, Tuple, Set, Optional


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="验证功能清单",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--component",
        type=str,
        help="组件名称（monorepo模式）"
    )
    
    parser.add_argument(
        "--project-dir",
        type=Path,
        default=Path.cwd(),
        help="项目目录（默认当前目录）"
    )
    
    parser.add_argument(
        "--fix",
        action="store_true",
        help="自动修复可修复的问题"
    )
    
    parser.add_argument(
        "--strict",
        action="store_true",
        help="严格模式（所有警告都视为错误）"
    )
    
    return parser.parse_args()


def load_features(project_dir: Path, component: Optional[str] = None) -> List[Dict[str, Any]]:
    """加载功能清单（支持monorepo）"""
    if component:
        features_file = project_dir / "components" / component / "features.json"
    else:
        features_file = project_dir / "features.json"
    
    if not features_file.exists():
        raise FileNotFoundError(f"功能清单不存在: {features_file}")
    
    with open(features_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # 支持新旧两种格式
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "features" in data:
            return data["features"]
        else:
            raise ValueError(f"无效的 features.json 格式: {features_file}")


def save_features(project_dir: Path, features: List[Dict[str, Any]], component: Optional[str] = None):
    """保存功能清单"""
    if component:
        features_file = project_dir / "components" / component / "features.json"
    else:
        features_file = project_dir / "features.json"
    
    # 读取现有文件以保留其他元数据
    existing_data = None
    if features_file.exists():
        with open(features_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    
    # 确定保存格式
    if existing_data and isinstance(existing_data, dict) and "features" in existing_data:
        # 新格式：保留其他字段，只更新 features
        existing_data["features"] = features
        data_to_save = existing_data
    else:
        # 旧格式或新文件：直接保存数组
        data_to_save = features
    
    with open(features_file, 'w', encoding='utf-8') as f:
        json.dump(data_to_save, f, indent=2, ensure_ascii=False)


class ValidationError:
    """验证错误"""
    def __init__(self, level: str, feature_id: int, message: str, fixable: bool = False):
        self.level = level  # error, warning, info
        self.feature_id = feature_id
        self.message = message
        self.fixable = fixable
    
    def __str__(self):
        emoji = {"error": "❌", "warning": "⚠️", "info": "ℹ️"}
        fix_mark = " [可修复]" if self.fixable else ""
        return f"{emoji.get(self.level, '•')} 功能 #{self.feature_id}: {self.message}{fix_mark}"


def validate_schema(features: List[Dict[str, Any]]) -> List[ValidationError]:
    """验证JSON schema"""
    errors = []
    
    required_fields = ["id", "category", "priority", "title", "description", "status"]
    optional_fields = [
        "acceptance_criteria", "estimated_complexity", "dependencies",
        "completed_at", "tested", "commit_hash", "completion_notes"
    ]
    valid_statuses = ["pending", "in_progress", "completed", "tested", "blocked"]
    valid_priorities = ["critical", "high", "medium", "low"]
    valid_complexities = ["low", "medium", "high"]
    
    for feature in features:
        fid = feature.get("id", "未知")
        
        # 检查必需字段
        for field in required_fields:
            if field not in feature:
                errors.append(ValidationError(
                    "error", fid, f"缺少必需字段: {field}"
                ))
        
        # 检查ID类型
        if not isinstance(feature.get("id"), int):
            errors.append(ValidationError(
                "error", fid, "ID必须是整数"
            ))
        
        # 检查status有效性
        if "status" in feature and feature["status"] not in valid_statuses:
            errors.append(ValidationError(
                "error", fid, f"无效的status: {feature['status']}，应为: {', '.join(valid_statuses)}"
            ))
        
        # 检查priority有效性
        if "priority" in feature and feature["priority"] not in valid_priorities:
            errors.append(ValidationError(
                "error", fid, f"无效的priority: {feature['priority']}，应为: {', '.join(valid_priorities)}"
            ))
        
        # 检查complexity有效性
        if "estimated_complexity" in feature and feature["estimated_complexity"] not in valid_complexities:
            errors.append(ValidationError(
                "warning", fid, f"无效的estimated_complexity: {feature['estimated_complexity']}，应为: {', '.join(valid_complexities)}",
                fixable=True
            ))
        
        # 检查acceptance_criteria是数组
        if "acceptance_criteria" in feature and not isinstance(feature["acceptance_criteria"], list):
            errors.append(ValidationError(
                "error", fid, "acceptance_criteria必须是数组"
            ))
        
        # 检查dependencies是数组
        if "dependencies" in feature and not isinstance(feature["dependencies"], list):
            errors.append(ValidationError(
                "error", fid, "dependencies必须是数组"
            ))
    
    return errors


def validate_ids(features: List[Dict[str, Any]]) -> List[ValidationError]:
    """验证ID唯一性和连续性"""
    errors = []
    
    # 检查唯一性
    ids = [f.get("id") for f in features]
    seen = set()
    for fid in ids:
        if fid in seen:
            errors.append(ValidationError(
                "error", fid, "重复的ID"
            ))
        seen.add(fid)
    
    # 检查连续性（警告）
    if ids:
        expected_ids = set(range(1, max(ids) + 1))
        actual_ids = set(ids)
        missing = expected_ids - actual_ids
        
        if missing:
            errors.append(ValidationError(
                "warning", 0, f"ID不连续，缺失: {sorted(missing)}"
            ))
    
    return errors


def validate_dependencies(features: List[Dict[str, Any]]) -> List[ValidationError]:
    """验证依赖关系"""
    errors = []
    
    # 构建ID集合
    valid_ids = {f["id"] for f in features}
    
    # 检查每个功能的依赖
    for feature in features:
        fid = feature["id"]
        deps = feature.get("dependencies", [])
        
        # 检查依赖是否存在
        for dep_id in deps:
            if dep_id not in valid_ids:
                errors.append(ValidationError(
                    "error", fid, f"依赖不存在的功能: #{dep_id}"
                ))
        
        # 检查自我依赖
        if fid in deps:
            errors.append(ValidationError(
                "error", fid, "不能依赖自己"
            ))
    
    # 检查循环依赖
    def has_cycle(feature_id: int, visited: Set[int], rec_stack: Set[int]) -> bool:
        """DFS检测循环"""
        visited.add(feature_id)
        rec_stack.add(feature_id)
        
        feature = next((f for f in features if f["id"] == feature_id), None)
        if feature:
            for dep_id in feature.get("dependencies", []):
                if dep_id not in visited:
                    if has_cycle(dep_id, visited, rec_stack):
                        return True
                elif dep_id in rec_stack:
                    return True
        
        rec_stack.remove(feature_id)
        return False
    
    visited = set()
    for feature in features:
        fid = feature["id"]
        if fid not in visited:
            if has_cycle(fid, visited, set()):
                errors.append(ValidationError(
                    "error", fid, "检测到循环依赖"
                ))
    
    return errors


def validate_status_consistency(features: List[Dict[str, Any]]) -> List[ValidationError]:
    """验证状态一致性"""
    errors = []
    
    for feature in features:
        fid = feature["id"]
        status = feature.get("status")
        completed_at = feature.get("completed_at")
        commit_hash = feature.get("commit_hash")
        
        # 已完成但没有完成时间
        if status in ["completed", "tested"] and not completed_at:
            errors.append(ValidationError(
                "warning", fid, "已完成但缺少completed_at字段",
                fixable=True
            ))
        
        # 未完成但有完成时间
        if status not in ["completed", "tested"] and completed_at:
            errors.append(ValidationError(
                "warning", fid, f"状态为{status}但有completed_at字段"
            ))
        
        # 已完成但没有commit hash
        if status in ["completed", "tested"] and not commit_hash:
            errors.append(ValidationError(
                "info", fid, "已完成但缺少commit_hash（建议添加）"
            ))
        
        # 检查依赖是否都已完成
        deps = feature.get("dependencies", [])
        if status in ["completed", "tested"] and deps:
            for dep_id in deps:
                dep = next((f for f in features if f["id"] == dep_id), None)
                if dep and dep["status"] not in ["completed", "tested"]:
                    errors.append(ValidationError(
                        "warning", fid, f"已完成但依赖#{dep_id}尚未完成"
                    ))
    
    return errors


def validate_content_quality(features: List[Dict[str, Any]]) -> List[ValidationError]:
    """验证内容质量"""
    errors = []
    
    for feature in features:
        fid = feature["id"]
        
        # 检查标题
        title = feature.get("title", "")
        if not title or title.strip() == "":
            errors.append(ValidationError(
                "error", fid, "标题为空"
            ))
        elif len(title) < 5:
            errors.append(ValidationError(
                "warning", fid, "标题过短（少于5个字符）"
            ))
        elif "待定义" in title or "TODO" in title.upper():
            errors.append(ValidationError(
                "info", fid, "标题包含占位符，需要完善"
            ))
        
        # 检查描述
        desc = feature.get("description", "")
        if not desc or desc.strip() == "":
            errors.append(ValidationError(
                "warning", fid, "描述为空"
            ))
        elif len(desc) < 10:
            errors.append(ValidationError(
                "warning", fid, "描述过短（少于10个字符）"
            ))
        elif "需要定义" in desc or "TODO" in desc.upper():
            errors.append(ValidationError(
                "info", fid, "描述包含占位符，需要完善"
            ))
        
        # 检查验收标准
        criteria = feature.get("acceptance_criteria", [])
        if not criteria:
            errors.append(ValidationError(
                "warning", fid, "没有验收标准"
            ))
        elif len(criteria) < 2:
            errors.append(ValidationError(
                "info", fid, "验收标准较少（少于2条）"
            ))
    
    return errors


def fix_issues(features: List[Dict[str, Any]], errors: List[ValidationError]) -> int:
    """自动修复可修复的问题"""
    fixed_count = 0
    
    for error in errors:
        if not error.fixable:
            continue
        
        feature = next((f for f in features if f["id"] == error.feature_id), None)
        if not feature:
            continue
        
        # 修复completed_at缺失
        if "已完成但缺少completed_at" in error.message:
            from datetime import datetime
            feature["completed_at"] = datetime.now().isoformat()
            fixed_count += 1
            print(f"  ✓ 修复: 功能 #{feature['id']} 添加completed_at")
        
        # 修复invalid complexity
        if "无效的estimated_complexity" in error.message:
            feature["estimated_complexity"] = "medium"
            fixed_count += 1
            print(f"  ✓ 修复: 功能 #{feature['id']} 复杂度设为medium")
    
    return fixed_count


def main():
    """主函数"""
    args = parse_args()
    
    print("\n" + "="*60)
    print("  验证功能清单")
    print("="*60 + "\n")
    
    try:
        # 加载功能清单
        features = load_features(args.project_dir, args.component)
        component_info = f" (组件: {args.component})" if args.component else ""
        print(f"✓ 加载了 {len(features)} 个功能{component_info}\n")
        
        # 执行验证
        all_errors = []
        
        print("🔍 验证中...")
        
        print("  1. 检查JSON schema...")
        all_errors.extend(validate_schema(features))
        
        print("  2. 检查ID唯一性和连续性...")
        all_errors.extend(validate_ids(features))
        
        print("  3. 检查依赖关系...")
        all_errors.extend(validate_dependencies(features))
        
        print("  4. 检查状态一致性...")
        all_errors.extend(validate_status_consistency(features))
        
        print("  5. 检查内容质量...")
        all_errors.extend(validate_content_quality(features))
        
        print()
        
        # 统计错误
        errors = [e for e in all_errors if e.level == "error"]
        warnings = [e for e in all_errors if e.level == "warning"]
        infos = [e for e in all_errors if e.level == "info"]
        
        # 自动修复
        if args.fix and any(e.fixable for e in all_errors):
            print("🔧 自动修复可修复的问题...")
            fixed = fix_issues(features, all_errors)
            
            if fixed > 0:
                save_features(args.project_dir, features, args.component)
                print(f"\n✓ 已修复 {fixed} 个问题并保存\n")
                
                # 重新验证
                all_errors = []
                all_errors.extend(validate_schema(features))
                all_errors.extend(validate_ids(features))
                all_errors.extend(validate_dependencies(features))
                all_errors.extend(validate_status_consistency(features))
                all_errors.extend(validate_content_quality(features))
                
                errors = [e for e in all_errors if e.level == "error"]
                warnings = [e for e in all_errors if e.level == "warning"]
                infos = [e for e in all_errors if e.level == "info"]
        
        # 显示结果
        print("="*60)
        print("  验证结果")
        print("="*60 + "\n")
        
        if errors:
            print(f"❌ 错误 ({len(errors)}):\n")
            for error in errors:
                print(f"  {error}")
            print()
        
        if warnings:
            print(f"⚠️  警告 ({len(warnings)}):\n")
            for warning in warnings[:10]:  # 最多显示10个
                print(f"  {warning}")
            if len(warnings) > 10:
                print(f"  ... 还有 {len(warnings) - 10} 个警告\n")
            print()
        
        if infos:
            print(f"ℹ️  提示 ({len(infos)}):\n")
            for info in infos[:5]:  # 最多显示5个
                print(f"  {info}")
            if len(infos) > 5:
                print(f"  ... 还有 {len(infos) - 5} 个提示\n")
            print()
        
        # 总结
        if not errors and not warnings and not infos:
            print("✅ 完美！没有发现任何问题。\n")
            return 0
        elif not errors:
            if args.strict:
                print("⚠️  严格模式：存在警告，验证失败。\n")
                return 1
            else:
                print("✅ 没有错误，但有一些警告或提示。\n")
                return 0
        else:
            print(f"❌ 发现 {len(errors)} 个错误，请修复后再继续。\n")
            return 1
    
    except FileNotFoundError as e:
        print(f"❌ 错误: {e}\n")
        return 1
    except json.JSONDecodeError as e:
        print(f"❌ JSON格式错误: {e}\n")
        return 1
    except Exception as e:
        print(f"❌ 未预期的错误: {e}\n")
        raise


if __name__ == "__main__":
    exit(main())

