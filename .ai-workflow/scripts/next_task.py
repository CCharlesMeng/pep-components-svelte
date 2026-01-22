#!/usr/bin/env python3
"""
获取下一个任务
============

分析功能清单，返回下一个应该完成的任务及详细的开发提示词
"""

import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="获取下一个应该完成的任务",
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
        "--format",
        choices=["markdown", "json", "text"],
        default="markdown",
        help="输出格式"
    )
    
    parser.add_argument(
        "--count",
        type=int,
        default=1,
        help="显示接下来N个任务"
    )
    
    parser.add_argument(
        "--priority",
        choices=["critical", "high", "medium", "low"],
        help="按优先级过滤"
    )
    
    parser.add_argument(
        "--category",
        help="按类别过滤"
    )
    
    parser.add_argument(
        "--save",
        action="store_true",
        help="保存到.cursor-session/current-task.md"
    )
    
    return parser.parse_args()


def get_features_file(project_dir: Path, component: Optional[str] = None) -> Path:
    """获取功能清单文件路径（支持monorepo）"""
    if component:
        # Monorepo模式：在components/{component}/features.json
        features_file = project_dir / "components" / component / "features.json"
        if not features_file.exists():
            raise FileNotFoundError(
                f"组件功能清单不存在: {features_file}\n"
                f"请先运行: python scripts/init-component.js --component {component}"
            )
    else:
        # 标准模式：在项目根目录
        features_file = project_dir / "features.json"
        if not features_file.exists():
            raise FileNotFoundError(
                f"功能清单不存在: {features_file}\n"
                "请先运行: python scripts/init-project.js"
            )
    return features_file


def load_features(project_dir: Path, component: Optional[str] = None) -> List[Dict[str, Any]]:
    """加载功能清单"""
    features_file = get_features_file(project_dir, component)
    
    with open(features_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        # 支持新旧两种格式
        if isinstance(data, list):
            return data
        elif isinstance(data, dict) and "features" in data:
            return data["features"]
        else:
            raise ValueError(f"无效的 features.json 格式: {features_file}")


def get_completed_features(features: List[Dict[str, Any]]) -> set:
    """获取已完成的功能ID集合"""
    return {f["id"] for f in features if f["status"] in ["completed", "tested"]}


def can_start_feature(feature: Dict[str, Any], completed: set) -> bool:
    """检查功能是否可以开始（所有依赖都已完成）"""
    dependencies = feature.get("dependencies", [])
    return all(dep_id in completed for dep_id in dependencies)


def get_next_tasks(
    features: List[Dict[str, Any]],
    count: int = 1,
    priority: Optional[str] = None,
    category: Optional[str] = None
) -> List[Dict[str, Any]]:
    """获取接下来应该完成的任务"""
    
    completed = get_completed_features(features)
    
    # 过滤可开始的pending功能
    candidates = [
        f for f in features
        if f["status"] == "pending"
        and can_start_feature(f, completed)
    ]
    
    # 应用过滤器
    if priority:
        candidates = [f for f in candidates if f["priority"] == priority]
    
    if category:
        candidates = [f for f in candidates if f["category"] == category]
    
    # 排序：优先级 > ID
    priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    candidates.sort(
        key=lambda f: (priority_order.get(f["priority"], 99), f["id"])
    )
    
    return candidates[:count]


def generate_task_prompt(feature: Dict[str, Any], features: List[Dict[str, Any]]) -> str:
    """生成任务的详细开发提示词"""
    
    # 统计进度
    total = len(features)
    completed = len([f for f in features if f["status"] in ["completed", "tested"]])
    percentage = (completed / total * 100) if total > 0 else 0
    
    # 获取依赖功能信息
    dependencies_info = []
    for dep_id in feature.get("dependencies", []):
        dep = next((f for f in features if f["id"] == dep_id), None)
        if dep:
            status_emoji = "✅" if dep["status"] in ["completed", "tested"] else "⏳"
            dependencies_info.append(f"  - {status_emoji} #{dep['id']}: {dep['title']}")
    
    dependencies_text = "\n".join(dependencies_info) if dependencies_info else "  无依赖"
    
    # 生成验收标准清单
    criteria_checklist = "\n".join([
        f"- [ ] {criterion}"
        for criterion in feature.get("acceptance_criteria", [])
    ])
    
    prompt = f"""# 功能开发任务 #{feature['id']}

## 📊 项目进度

- **总功能数**: {total}
- **已完成**: {completed} ({percentage:.1f}%)
- **当前功能**: #{feature['id']} / {total}

---

## 🎯 功能详情

**标题**: {feature['title']}

**类别**: `{feature['category']}`  
**优先级**: `{feature['priority']}`  
**复杂度**: `{feature.get('estimated_complexity', 'medium')}`

### 功能描述

{feature['description']}

### 验收标准

{criteria_checklist}

### 依赖关系

{dependencies_text}

---

## 💡 开发指南

### 1. 理解需求
- 仔细阅读功能描述和验收标准
- 查看依赖功能的实现方式
- 明确功能边界和预期行为

### 2. 实现步骤

#### 核心代码
- 创建必要的文件和目录
- 实现核心功能逻辑
- 添加错误处理
- 编写注释和文档字符串

#### 测试验证
- 编写单元测试（如适用）
- 手动测试核心流程
- 验证边界情况
- 检查错误处理

#### 代码质量
- 运行linter检查
- 修复任何警告
- 确保代码风格一致
- 优化性能（如需要）

#### 文档更新
- 更新相关文档
- 添加使用示例
- 更新API文档（如适用）

### 3. 验证清单

在标记功能完成前，请确认：

- [ ] 所有验收标准都已满足
- [ ] 代码通过linter检查，无警告
- [ ] 功能已手动测试，工作正常
- [ ] 边界情况和错误处理已验证
- [ ] 相关文档已更新
- [ ] 代码已格式化，符合项目规范
- [ ] 没有引入新的依赖（或已记录）
- [ ] 提交信息清晰描述变更

---

## 🚀 完成流程

### 1. 实现功能
在Cursor中使用Composer或Chat完成开发

### 2. 本地测试
```bash
# 运行应用并测试功能
# [根据项目类型添加具体命令]
```

### 3. 提交代码
```bash
git add .
git commit -m "feat: {feature['title']} (#{feature['id']})"
```

### 4. 标记完成
```bash
python cursor-autonomous-coding/scripts/mark-done.js --feature-id {feature['id']}
```

---

## 📝 注意事项

- **专注**: 只实现当前功能，不要过度设计
- **质量**: 确保代码质量高于完成速度
- **测试**: 彻底测试后再标记完成
- **文档**: 保持文档与代码同步
- **提交**: 每个功能独立提交

---

## 🔗 相关资源

- 项目规格: `spec.md`
- 功能清单: `features.json`
- 进度追踪: `cursor-progress.md`

---

**开始时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

祝编码愉快！🎉
"""
    
    return prompt


def format_task_json(feature: Dict[str, Any]) -> str:
    """格式化任务为JSON"""
    return json.dumps(feature, indent=2, ensure_ascii=False)


def format_task_text(feature: Dict[str, Any]) -> str:
    """格式化任务为纯文本"""
    text = f"""
下一个任务: 功能 #{feature['id']}
{'='*50}

标题: {feature['title']}
类别: {feature['category']}
优先级: {feature['priority']}
复杂度: {feature.get('estimated_complexity', 'medium')}

描述:
{feature['description']}

验收标准:
"""
    
    for i, criterion in enumerate(feature.get('acceptance_criteria', []), 1):
        text += f"{i}. {criterion}\n"
    
    return text


def save_current_task(project_dir: Path, prompt: str, component: Optional[str] = None):
    """保存当前任务到会话目录（支持monorepo）"""
    if component:
        # Monorepo模式：保存到组件目录
        session_dir = project_dir / "components" / component / ".component-dev"
    else:
        # 标准模式：保存到项目根目录
        session_dir = project_dir / ".cursor-session"
    
    session_dir.mkdir(parents=True, exist_ok=True)
    
    task_file = session_dir / "current-task.md"
    task_file.write_text(prompt, encoding='utf-8')
    
    return task_file


def print_stats(features: List[Dict[str, Any]]):
    """打印统计信息"""
    total = len(features)
    by_status = {}
    by_priority = {}
    by_category = {}
    
    for f in features:
        status = f["status"]
        priority = f["priority"]
        category = f["category"]
        
        by_status[status] = by_status.get(status, 0) + 1
        by_priority[priority] = by_priority.get(priority, 0) + 1
        by_category[category] = by_category.get(category, 0) + 1
    
    completed = by_status.get("completed", 0) + by_status.get("tested", 0)
    percentage = (completed / total * 100) if total > 0 else 0
    
    print("\n" + "="*60)
    print("  📊 项目统计")
    print("="*60)
    print(f"\n总功能数: {total}")
    print(f"已完成: {completed} ({percentage:.1f}%)")
    print(f"进行中: {by_status.get('in_progress', 0)}")
    print(f"待开始: {by_status.get('pending', 0)}")
    print(f"已阻塞: {by_status.get('blocked', 0)}")
    
    print("\n按优先级:")
    for priority in ["critical", "high", "medium", "low"]:
        count = by_priority.get(priority, 0)
        if count > 0:
            print(f"  {priority}: {count}")
    
    print("\n按类别:")
    for category, count in sorted(by_category.items(), key=lambda x: -x[1]):
        print(f"  {category}: {count}")
    print()


def main():
    """主函数"""
    args = parse_args()
    
    try:
        # 加载功能清单
        features = load_features(args.project_dir, args.component)
        
        # 获取下一个任务
        tasks = get_next_tasks(
            features,
            count=args.count,
            priority=args.priority,
            category=args.category
        )
        
        if not tasks:
            print("\n🎉 太棒了！所有功能都已完成或没有可开始的功能！\n")
            print_stats(features)
            return
        
        # 显示统计信息
        print_stats(features)
        
        # 输出任务
        for i, task in enumerate(tasks, 1):
            if args.format == "json":
                print(format_task_json(task))
            elif args.format == "text":
                print(format_task_text(task))
            else:  # markdown
                prompt = generate_task_prompt(task, features)
                print(prompt)
                
                # 保存第一个任务
                if i == 1 and args.save:
                    task_file = save_current_task(args.project_dir, prompt, args.component)
                    print(f"\n💾 任务已保存到: {task_file}\n")
            
            if i < len(tasks):
                print("\n" + "-"*60 + "\n")
        
        # 使用建议
        if args.format == "markdown" and not args.save:
            print("\n" + "="*60)
            print("  💡 提示")
            print("="*60)
            print("\n添加 --save 参数可以将任务保存到 .cursor-session/current-task.md")
            print("\n示例:")
            print("  python scripts/next-task.js --save\n")
    
    except FileNotFoundError as e:
        print(f"\n❌ 错误: {e}\n")
        return 1
    except Exception as e:
        print(f"\n❌ 未预期的错误: {e}\n")
        raise


if __name__ == "__main__":
    exit(main() or 0)

