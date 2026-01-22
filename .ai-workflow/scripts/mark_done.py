#!/usr/bin/env python3
"""
标记功能完成并归档
=================

标记功能为已完成状态，更新功能清单，并归档任务记录
"""

import argparse
import json
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="标记功能为已完成",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--feature-id",
        type=int,
        required=True,
        help="功能ID"
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
        "--commit-hash",
        help="Git提交哈希（可选，自动获取最新提交）"
    )
    
    parser.add_argument(
        "--tested",
        action="store_true",
        help="标记为已测试"
    )
    
    parser.add_argument(
        "--notes",
        help="完成备注"
    )
    
    return parser.parse_args()


def get_features_file(project_dir: Path, component: Optional[str] = None) -> Path:
    """获取功能清单文件路径（支持monorepo）"""
    if component:
        return project_dir / "components" / component / "features.json"
    return project_dir / "features.json"


def load_features(project_dir: Path, component: Optional[str] = None) -> List[Dict[str, Any]]:
    """加载功能清单"""
    features_file = get_features_file(project_dir, component)
    
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
    features_file = get_features_file(project_dir, component)
    
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


def get_latest_commit_hash(project_dir: Path) -> Optional[str]:
    """获取最新的Git提交哈希"""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=project_dir,
            capture_output=True,
            text=True,
            check=True
        )
        return result.stdout.strip()
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None


def archive_completed_task(project_dir: Path, feature: Dict[str, Any], notes: Optional[str], component: Optional[str] = None):
    """归档已完成的任务"""
    if component:
        archive_dir = project_dir / "components" / component / ".cursor-archive"
    else:
        archive_dir = project_dir / ".cursor-archive"
    
    archive_dir.mkdir(parents=True, exist_ok=True)
    
    # 创建归档文件名：YYYYMMDD-featureID-title.md
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    safe_title = "".join(c for c in feature["title"] if c.isalnum() or c in (' ', '-', '_')).strip()
    safe_title = safe_title.replace(' ', '-')[:50]  # 限制长度
    archive_file = archive_dir / f"{timestamp}-{feature['id']:03d}-{safe_title}.md"
    
    # 生成归档内容
    archive_content = f"""# {feature['title']}

## 基本信息

- **功能ID**: {feature['id']}
- **类别**: {feature.get('category', 'N/A')}
- **优先级**: {feature.get('priority', 'N/A')}
- **复杂度**: {feature.get('estimated_complexity', 'N/A')}
- **完成时间**: {feature['completed_at']}
- **提交哈希**: {feature.get('commit_hash', 'N/A')}
- **是否测试**: {'是' if feature.get('tested', False) else '否'}

## 功能描述

{feature.get('description', 'N/A')}

## 验收标准

"""
    
    for i, criteria in enumerate(feature.get('acceptance_criteria', []), 1):
        archive_content += f"{i}. {criteria}\n"
    
    if notes:
        archive_content += f"\n## 完成备注\n\n{notes}\n"
    
    archive_content += f"\n---\n\n*归档时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n"
    
    # 保存归档
    archive_file.write_text(archive_content, encoding='utf-8')
    
    return archive_file


def clear_current_task(project_dir: Path, component: Optional[str] = None):
    """清理当前任务文件"""
    if component:
        session_dir = project_dir / "components" / component / ".cursor-session"
    else:
        session_dir = project_dir / ".cursor-session"
    
    if not session_dir.exists():
        return
    
    # 删除当前任务文件
    current_task_file = session_dir / "current-task.md"
    if current_task_file.exists():
        current_task_file.unlink()


def update_session_history(project_dir: Path, feature: Dict[str, Any], component: Optional[str] = None):
    """更新会话历史（支持monorepo）"""
    if component:
        session_dir = project_dir / "components" / component / ".cursor-session"
    else:
        session_dir = project_dir / ".cursor-session"
    
    session_dir.mkdir(parents=True, exist_ok=True)
    
    history_file = session_dir / "session-history.json"
    
    # 加载现有历史
    history = []
    if history_file.exists():
        try:
            with open(history_file, 'r', encoding='utf-8') as f:
                history = json.load(f)
        except json.JSONDecodeError:
            history = []
    
    # 添加新记录
    history.append({
        "feature_id": feature["id"],
        "title": feature["title"],
        "completed_at": feature["completed_at"],
        "commit_hash": feature.get("commit_hash"),
        "tested": feature.get("tested", False)
    })
    
    # 保存
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump(history, f, indent=2, ensure_ascii=False)


def update_progress_file(project_dir: Path, features: List[Dict[str, Any]], completed_feature: Dict[str, Any], component: Optional[str] = None):
    """更新进度追踪文档（支持monorepo）"""
    if component:
        progress_file = project_dir / "components" / component / "DEVELOPMENT.md"
    else:
        progress_file = project_dir / "cursor-progress.md"
    
    if not progress_file.exists():
        return
    
    # 统计数据
    total = len(features)
    completed = len([f for f in features if f["status"] in ["completed", "tested"]])
    in_progress = len([f for f in features if f["status"] == "in_progress"])
    pending = len([f for f in features if f["status"] == "pending"])
    percentage = (completed / total * 100) if total > 0 else 0
    
    # 读取现有内容
    content = progress_file.read_text(encoding='utf-8')
    
    # 更新统计表格
    stats_table = f"""| 指标 | 数值 |
|------|------|
| 总功能数 | {total} |
| 已完成 | {completed} |
| 进行中 | {in_progress} |
| 待开始 | {pending} |
| 完成率 | {percentage:.1f}% |"""
    
    # 简单替换（更复杂的实现可以用正则）
    if "| 指标 | 数值 |" in content:
        lines = content.split('\n')
        start_idx = None
        end_idx = None
        
        for i, line in enumerate(lines):
            if line.startswith("| 指标 | 数值 |"):
                start_idx = i
            elif start_idx is not None and not line.startswith("|"):
                end_idx = i
                break
        
        if start_idx is not None:
            if end_idx is None:
                end_idx = len(lines)
            
            lines[start_idx:end_idx] = stats_table.split('\n')
            content = '\n'.join(lines)
    
    # 添加完成记录到最近会话（简单追加）
    session_date = datetime.now().strftime('%Y-%m-%d')
    completion_note = f"\n- [x] 功能 #{completed_feature['id']}: {completed_feature['title']} ({datetime.now().strftime('%H:%M')})"
    
    # 查找最近会话部分
    if f"### Session" in content and session_date in content:
        # 在当前会话中添加
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if "**完成的功能**:" in line:
                # 找到下一个空行或下一个section
                insert_idx = i + 1
                while insert_idx < len(lines) and lines[insert_idx].strip() and not lines[insert_idx].startswith("**"):
                    if lines[insert_idx].startswith(f"- [ ] 功能 #{completed_feature['id']}"):
                        lines[insert_idx] = lines[insert_idx].replace("- [ ]", "- [x]")
                        break
                    insert_idx += 1
                else:
                    lines.insert(insert_idx, completion_note)
                
                content = '\n'.join(lines)
                break
    
    # 保存
    progress_file.write_text(content, encoding='utf-8')


def main():
    """主函数"""
    args = parse_args()
    
    print("\n" + "="*60)
    print("  标记功能完成")
    print("="*60 + "\n")
    
    try:
        # 加载功能清单
        features = load_features(args.project_dir, args.component)
        
        # 查找功能
        feature = next((f for f in features if f["id"] == args.feature_id), None)
        
        if not feature:
            print(f"❌ 错误: 功能 #{args.feature_id} 不存在\n")
            return 1
        
        # 检查当前状态
        if feature["status"] in ["completed", "tested"]:
            print(f"⚠️  警告: 功能 #{args.feature_id} 已经标记为 {feature['status']}")
            print(f"   {feature['title']}\n")
            
            response = input("是否要更新状态？(y/N): ")
            if response.lower() != 'y':
                print("已取消\n")
                return 0
        
        print(f"功能: #{feature['id']} - {feature['title']}")
        print(f"类别: {feature['category']} | 优先级: {feature['priority']}\n")
        
        # 获取提交哈希
        commit_hash = args.commit_hash
        if not commit_hash:
            commit_hash = get_latest_commit_hash(args.project_dir)
            if commit_hash:
                print(f"✓ 自动获取最新提交: {commit_hash}")
            else:
                print("⚠️  无法获取Git提交哈希")
        
        # 更新功能状态
        feature["status"] = "tested" if args.tested else "completed"
        feature["completed_at"] = datetime.now().isoformat()
        feature["commit_hash"] = commit_hash
        feature["tested"] = args.tested
        
        if args.notes:
            feature["completion_notes"] = args.notes
        
        # 保存功能清单
        save_features(args.project_dir, features, args.component)
        print(f"✓ 功能清单已更新\n")
        
        # 归档已完成的任务
        archive_file = archive_completed_task(args.project_dir, feature, args.notes, args.component)
        print(f"✓ 任务已归档: {archive_file.name}\n")
        
        # 清理当前任务文件
        clear_current_task(args.project_dir, args.component)
        print(f"✓ 当前任务已清理（准备接收下一个任务）\n")
        
        # 更新会话历史
        update_session_history(args.project_dir, feature, args.component)
        print(f"✓ 会话历史已更新\n")
        
        # 更新进度文件
        update_progress_file(args.project_dir, features, feature, args.component)
        print(f"✓ 进度文档已更新\n")
        
        # 统计信息
        total = len(features)
        completed = len([f for f in features if f["status"] in ["completed", "tested"]])
        percentage = (completed / total * 100) if total > 0 else 0
        
        print("="*60)
        print(f"  ✅ 完成标记成功！")
        print("="*60)
        print(f"\n当前进度: {completed}/{total} ({percentage:.1f}%)\n")
        
        # 建议下一步
        print("💡 下一步:")
        print("   1. 确保代码已提交Git")
        print("   2. 运行: python scripts/next-task.js")
        print("   3. 继续下一个功能\n")
        
        return 0
        
    except FileNotFoundError as e:
        print(f"❌ 错误: {e}\n")
        return 1
    except Exception as e:
        print(f"❌ 未预期的错误: {e}\n")
        raise


if __name__ == "__main__":
    exit(main())

