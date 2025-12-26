#!/usr/bin/env python3
"""
生成进度报告
==========

生成详细的项目进度报告，支持多种格式
"""

import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
from collections import defaultdict


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="生成项目进度报告",
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
        choices=["html", "markdown", "json", "terminal"],
        default="terminal",
        help="输出格式"
    )
    
    parser.add_argument(
        "--output",
        type=Path,
        help="输出文件路径（不指定则输出到终端）"
    )
    
    parser.add_argument(
        "--detailed",
        action="store_true",
        help="生成详细报告"
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


def calculate_statistics(features: List[Dict[str, Any]]) -> Dict[str, Any]:
    """计算统计数据"""
    total = len(features)
    
    # 按状态统计
    by_status = defaultdict(int)
    by_priority = defaultdict(int)
    by_category = defaultdict(int)
    by_complexity = defaultdict(int)
    
    for feature in features:
        by_status[feature["status"]] += 1
        by_priority[feature["priority"]] += 1
        by_category[feature["category"]] += 1
        by_complexity[feature.get("estimated_complexity", "medium")] += 1
    
    completed = by_status.get("completed", 0) + by_status.get("tested", 0)
    in_progress = by_status.get("in_progress", 0)
    pending = by_status.get("pending", 0)
    blocked = by_status.get("blocked", 0)
    
    percentage = (completed / total * 100) if total > 0 else 0
    
    # 计算预估剩余工作量
    complexity_hours = {"low": 2, "medium": 4, "high": 8}
    remaining_features = [f for f in features if f["status"] == "pending"]
    estimated_hours = sum(
        complexity_hours.get(f.get("estimated_complexity", "medium"), 4)
        for f in remaining_features
    )
    
    return {
        "total": total,
        "completed": completed,
        "in_progress": in_progress,
        "pending": pending,
        "blocked": blocked,
        "percentage": percentage,
        "by_status": dict(by_status),
        "by_priority": dict(by_priority),
        "by_category": dict(by_category),
        "by_complexity": dict(by_complexity),
        "estimated_hours_remaining": estimated_hours
    }


def generate_terminal_report(features: List[Dict[str, Any]], stats: Dict[str, Any], detailed: bool = False) -> str:
    """生成终端格式报告"""
    
    report = "\n" + "="*70 + "\n"
    report += "  📊 项目进度报告\n"
    report += "="*70 + "\n\n"
    
    # 总体进度
    report += "## 总体进度\n\n"
    report += f"总功能数: {stats['total']}\n"
    report += f"已完成: {stats['completed']} ({stats['percentage']:.1f}%)\n"
    report += f"进行中: {stats['in_progress']}\n"
    report += f"待开始: {stats['pending']}\n"
    report += f"已阻塞: {stats['blocked']}\n"
    
    # 进度条
    bar_length = 50
    completed_length = int(bar_length * stats['percentage'] / 100)
    bar = "█" * completed_length + "░" * (bar_length - completed_length)
    report += f"\n[{bar}] {stats['percentage']:.1f}%\n"
    
    # 预估剩余时间
    report += f"\n预估剩余工作量: ~{stats['estimated_hours_remaining']} 小时\n"
    
    # 按优先级
    report += "\n" + "-"*70 + "\n"
    report += "## 按优先级统计\n\n"
    for priority in ["critical", "high", "medium", "low"]:
        count = stats["by_priority"].get(priority, 0)
        if count > 0:
            completed_in_priority = len([
                f for f in features
                if f["priority"] == priority and f["status"] in ["completed", "tested"]
            ])
            pct = (completed_in_priority / count * 100) if count > 0 else 0
            report += f"{priority:10} {completed_in_priority:3}/{count:3} ({pct:5.1f}%)\n"
    
    # 按类别
    report += "\n" + "-"*70 + "\n"
    report += "## 按类别统计\n\n"
    for category, count in sorted(stats["by_category"].items(), key=lambda x: -x[1]):
        completed_in_category = len([
            f for f in features
            if f["category"] == category and f["status"] in ["completed", "tested"]
        ])
        pct = (completed_in_category / count * 100) if count > 0 else 0
        report += f"{category:15} {completed_in_category:3}/{count:3} ({pct:5.1f}%)\n"
    
    # 详细模式
    if detailed:
        report += "\n" + "-"*70 + "\n"
        report += "## 已完成功能\n\n"
        
        completed_features = [f for f in features if f["status"] in ["completed", "tested"]]
        completed_features.sort(key=lambda f: f.get("completed_at", ""), reverse=True)
        
        for feature in completed_features[:20]:  # 最近20个
            completed_at = feature.get("completed_at", "未知")
            if completed_at != "未知":
                try:
                    dt = datetime.fromisoformat(completed_at)
                    completed_at = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
            
            tested_mark = "✓" if feature.get("tested") else " "
            report += f"[{tested_mark}] #{feature['id']:3} {feature['title'][:50]:50} ({completed_at})\n"
        
        if len(completed_features) > 20:
            report += f"\n... 还有 {len(completed_features) - 20} 个已完成功能\n"
        
        # 待完成功能（高优先级）
        report += "\n" + "-"*70 + "\n"
        report += "## 待完成功能 (高优先级)\n\n"
        
        high_priority = [
            f for f in features
            if f["status"] == "pending" and f["priority"] in ["critical", "high"]
        ]
        high_priority.sort(key=lambda f: (0 if f["priority"] == "critical" else 1, f["id"]))
        
        for feature in high_priority[:15]:  # 最多15个
            report += f"#{feature['id']:3} [{feature['priority']:8}] {feature['title']}\n"
        
        if len(high_priority) > 15:
            report += f"\n... 还有 {len(high_priority) - 15} 个高优先级功能\n"
    
    report += "\n" + "="*70 + "\n"
    report += f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    report += "="*70 + "\n\n"
    
    return report


def generate_markdown_report(features: List[Dict[str, Any]], stats: Dict[str, Any], detailed: bool = False) -> str:
    """生成Markdown格式报告"""
    
    report = f"""# 项目进度报告

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📊 总体进度

| 指标 | 数值 |
|------|------|
| 总功能数 | {stats['total']} |
| 已完成 | {stats['completed']} ({stats['percentage']:.1f}%) |
| 进行中 | {stats['in_progress']} |
| 待开始 | {stats['pending']} |
| 已阻塞 | {stats['blocked']} |
| 预估剩余 | ~{stats['estimated_hours_remaining']} 小时 |

### 进度可视化

```
{'█' * int(50 * stats['percentage'] / 100)}{'░' * (50 - int(50 * stats['percentage'] / 100))}
{stats['percentage']:.1f}% 完成
```

## 📈 按优先级统计

| 优先级 | 已完成/总数 | 完成率 |
|--------|-------------|--------|
"""
    
    for priority in ["critical", "high", "medium", "low"]:
        count = stats["by_priority"].get(priority, 0)
        if count > 0:
            completed_in_priority = len([
                f for f in features
                if f["priority"] == priority and f["status"] in ["completed", "tested"]
            ])
            pct = (completed_in_priority / count * 100) if count > 0 else 0
            report += f"| {priority} | {completed_in_priority}/{count} | {pct:.1f}% |\n"
    
    report += "\n## 🗂️ 按类别统计\n\n"
    report += "| 类别 | 已完成/总数 | 完成率 |\n"
    report += "|------|-------------|--------|\n"
    
    for category, count in sorted(stats["by_category"].items(), key=lambda x: -x[1]):
        completed_in_category = len([
            f for f in features
            if f["category"] == category and f["status"] in ["completed", "tested"]
        ])
        pct = (completed_in_category / count * 100) if count > 0 else 0
        report += f"| {category} | {completed_in_category}/{count} | {pct:.1f}% |\n"
    
    if detailed:
        report += "\n## ✅ 最近完成的功能\n\n"
        
        completed_features = [f for f in features if f["status"] in ["completed", "tested"]]
        completed_features.sort(key=lambda f: f.get("completed_at", ""), reverse=True)
        
        for feature in completed_features[:20]:
            completed_at = feature.get("completed_at", "未知")
            if completed_at != "未知":
                try:
                    dt = datetime.fromisoformat(completed_at)
                    completed_at = dt.strftime("%Y-%m-%d %H:%M")
                except:
                    pass
            
            tested_mark = "🧪" if feature.get("tested") else ""
            report += f"- {tested_mark} **#{feature['id']}**: {feature['title']} _{completed_at}_\n"
        
        report += "\n## 🎯 待完成功能 (高优先级)\n\n"
        
        high_priority = [
            f for f in features
            if f["status"] == "pending" and f["priority"] in ["critical", "high"]
        ]
        high_priority.sort(key=lambda f: (0 if f["priority"] == "critical" else 1, f["id"]))
        
        for feature in high_priority[:15]:
            priority_emoji = "🔴" if feature["priority"] == "critical" else "🟠"
            report += f"- {priority_emoji} **#{feature['id']}**: {feature['title']}\n"
    
    return report


def generate_json_report(features: List[Dict[str, Any]], stats: Dict[str, Any]) -> str:
    """生成JSON格式报告"""
    
    report_data = {
        "generated_at": datetime.now().isoformat(),
        "statistics": stats,
        "features": features
    }
    
    return json.dumps(report_data, indent=2, ensure_ascii=False)


def generate_html_report(features: List[Dict[str, Any]], stats: Dict[str, Any], detailed: bool = False) -> str:
    """生成HTML格式报告"""
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目进度报告</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }}
        .container {{
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }}
        h1 {{ color: #333; border-bottom: 3px solid #4CAF50; padding-bottom: 10px; }}
        h2 {{ color: #555; margin-top: 30px; }}
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        .stat-card {{
            background: #f9f9f9;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #4CAF50;
        }}
        .stat-card h3 {{ margin: 0 0 10px 0; color: #666; font-size: 14px; }}
        .stat-card .value {{ font-size: 32px; font-weight: bold; color: #333; }}
        .progress-bar {{
            width: 100%;
            height: 30px;
            background: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin: 20px 0;
        }}
        .progress-fill {{
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th, td {{
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }}
        th {{ background: #f5f5f5; font-weight: 600; }}
        .priority-critical {{ color: #f44336; }}
        .priority-high {{ color: #ff9800; }}
        .priority-medium {{ color: #2196F3; }}
        .priority-low {{ color: #9E9E9E; }}
        .feature-item {{
            padding: 10px;
            margin: 5px 0;
            background: #f9f9f9;
            border-radius: 4px;
        }}
        .timestamp {{ color: #999; font-size: 0.9em; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 项目进度报告</h1>
        <p class="timestamp">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <div class="stats">
            <div class="stat-card">
                <h3>总功能数</h3>
                <div class="value">{stats['total']}</div>
            </div>
            <div class="stat-card">
                <h3>已完成</h3>
                <div class="value">{stats['completed']}</div>
            </div>
            <div class="stat-card">
                <h3>进行中</h3>
                <div class="value">{stats['in_progress']}</div>
            </div>
            <div class="stat-card">
                <h3>完成率</h3>
                <div class="value">{stats['percentage']:.1f}%</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: {stats['percentage']}%">
                {stats['percentage']:.1f}%
            </div>
        </div>
        
        <h2>按优先级统计</h2>
        <table>
            <thead>
                <tr>
                    <th>优先级</th>
                    <th>已完成</th>
                    <th>总数</th>
                    <th>完成率</th>
                </tr>
            </thead>
            <tbody>
"""
    
    for priority in ["critical", "high", "medium", "low"]:
        count = stats["by_priority"].get(priority, 0)
        if count > 0:
            completed_in_priority = len([
                f for f in features
                if f["priority"] == priority and f["status"] in ["completed", "tested"]
            ])
            pct = (completed_in_priority / count * 100) if count > 0 else 0
            html += f"""
                <tr>
                    <td class="priority-{priority}">{priority}</td>
                    <td>{completed_in_priority}</td>
                    <td>{count}</td>
                    <td>{pct:.1f}%</td>
                </tr>
"""
    
    html += """
            </tbody>
        </table>
        
        <h2>按类别统计</h2>
        <table>
            <thead>
                <tr>
                    <th>类别</th>
                    <th>已完成</th>
                    <th>总数</th>
                    <th>完成率</th>
                </tr>
            </thead>
            <tbody>
"""
    
    for category, count in sorted(stats["by_category"].items(), key=lambda x: -x[1]):
        completed_in_category = len([
            f for f in features
            if f["category"] == category and f["status"] in ["completed", "tested"]
        ])
        pct = (completed_in_category / count * 100) if count > 0 else 0
        html += f"""
                <tr>
                    <td>{category}</td>
                    <td>{completed_in_category}</td>
                    <td>{count}</td>
                    <td>{pct:.1f}%</td>
                </tr>
"""
    
    html += """
            </tbody>
        </table>
    </div>
</body>
</html>
"""
    
    return html


def main():
    """主函数"""
    args = parse_args()
    
    try:
        # 加载功能清单
        features = load_features(args.project_dir, args.component)
        
        # 计算统计数据
        stats = calculate_statistics(features)
        
        # 生成报告
        if args.format == "json":
            report = generate_json_report(features, stats)
        elif args.format == "html":
            report = generate_html_report(features, stats, args.detailed)
        elif args.format == "markdown":
            report = generate_markdown_report(features, stats, args.detailed)
        else:  # terminal
            report = generate_terminal_report(features, stats, args.detailed)
        
        # 输出报告
        if args.output:
            args.output.write_text(report, encoding='utf-8')
            print(f"\n✅ 报告已生成: {args.output}\n")
        else:
            print(report)
        
        return 0
        
    except FileNotFoundError as e:
        print(f"\n❌ 错误: {e}\n")
        return 1
    except Exception as e:
        print(f"\n❌ 未预期的错误: {e}\n")
        raise


if __name__ == "__main__":
    exit(main())

