#!/usr/bin/env python3
"""
Monorepo全局汇总脚本
===================

汇总所有组件的开发进度，生成整体报告
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
        description="生成monorepo全局进度报告",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        "--workspace-root",
        type=Path,
        default=Path.cwd(),
        help="Monorepo根目录（默认当前目录）"
    )
    
    parser.add_argument(
        "--format",
        choices=["terminal", "markdown", "html", "json"],
        default="terminal",
        help="输出格式"
    )
    
    parser.add_argument(
        "--output",
        type=Path,
        help="输出文件路径"
    )
    
    return parser.parse_args()


def discover_components(workspace_root: Path) -> List[str]:
    """发现所有组件"""
    components_dir = workspace_root / "components"
    
    if not components_dir.exists():
        return []
    
    components = []
    for item in components_dir.iterdir():
        if item.is_dir() and (item / "features.json").exists():
            components.append(item.name)
    
    return sorted(components)


def load_component_features(workspace_root: Path, component: str) -> Dict[str, Any]:
    """加载单个组件的功能清单"""
    features_file = workspace_root / "components" / component / "features.json"
    
    try:
        with open(features_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 支持新旧两种格式
        if isinstance(data, list):
            features = data
        elif isinstance(data, dict) and "features" in data:
            features = data["features"]
        else:
            features = []
        
        total = len(features)
        completed = len([f for f in features if f.get("status") in ["completed", "tested"]])
        in_progress = len([f for f in features if f.get("status") == "in_progress"])
        pending = len([f for f in features if f.get("status") == "pending"])
        
        return {
            "name": component,
            "total": total,
            "completed": completed,
            "in_progress": in_progress,
            "pending": pending,
            "percentage": (completed / total * 100) if total > 0 else 0,
            "features": features
        }
    except Exception as e:
        return {
            "name": component,
            "total": 0,
            "completed": 0,
            "in_progress": 0,
            "pending": 0,
            "percentage": 0,
            "error": str(e)
        }


def generate_terminal_report(component_stats: List[Dict[str, Any]]) -> str:
    """生成终端格式报告"""
    
    report = "\n" + "="*80 + "\n"
    report += "  📊 Monorepo 全局进度报告\n"
    report += "="*80 + "\n\n"
    
    # 总体统计
    total_components = len(component_stats)
    total_features = sum(c["total"] for c in component_stats)
    total_completed = sum(c["completed"] for c in component_stats)
    total_in_progress = sum(c["in_progress"] for c in component_stats)
    total_pending = sum(c["pending"] for c in component_stats)
    overall_percentage = (total_completed / total_features * 100) if total_features > 0 else 0
    
    report += "## 总体概览\n\n"
    report += f"组件总数: {total_components}\n"
    report += f"功能总数: {total_features}\n"
    report += f"已完成: {total_completed} ({overall_percentage:.1f}%)\n"
    report += f"进行中: {total_in_progress}\n"
    report += f"待开始: {total_pending}\n"
    
    # 整体进度条
    bar_length = 60
    completed_length = int(bar_length * overall_percentage / 100)
    bar = "█" * completed_length + "░" * (bar_length - completed_length)
    report += f"\n[{bar}] {overall_percentage:.1f}%\n"
    
    # 组件状态分布
    completed_components = len([c for c in component_stats if c["percentage"] >= 100])
    in_progress_components = len([c for c in component_stats if 0 < c["percentage"] < 100])
    not_started_components = len([c for c in component_stats if c["percentage"] == 0])
    
    report += f"\n组件状态:\n"
    report += f"  ✅ 已完成: {completed_components}\n"
    report += f"  🔄 进行中: {in_progress_components}\n"
    report += f"  ⏳ 未开始: {not_started_components}\n"
    
    # 各组件详情
    report += "\n" + "-"*80 + "\n"
    report += "## 组件进度详情\n\n"
    
    # 按完成度排序
    sorted_components = sorted(component_stats, key=lambda x: (-x["percentage"], x["name"]))
    
    for comp in sorted_components:
        status_emoji = ""
        if comp["percentage"] >= 100:
            status_emoji = "✅"
        elif comp["percentage"] > 0:
            status_emoji = "🔄"
        else:
            status_emoji = "⏳"
        
        comp_bar_length = 30
        comp_completed = int(comp_bar_length * comp["percentage"] / 100)
        comp_bar = "█" * comp_completed + "░" * (comp_bar_length - comp_completed)
        
        report += f"{status_emoji} {comp['name']:40} [{comp_bar}] {comp['percentage']:5.1f}% ({comp['completed']}/{comp['total']})\n"
        
        if "error" in comp:
            report += f"   ⚠️  错误: {comp['error']}\n"
    
    # Top贡献者（基于完成的功能数）
    report += "\n" + "-"*80 + "\n"
    report += "## 最活跃组件\n\n"
    
    top_components = sorted(component_stats, key=lambda x: -x["completed"])[:10]
    for i, comp in enumerate(top_components, 1):
        report += f"{i:2}. {comp['name']:40} {comp['completed']:3} 个功能已完成\n"
    
    report += "\n" + "="*80 + "\n"
    report += f"报告生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    report += "="*80 + "\n\n"
    
    return report


def generate_markdown_report(component_stats: List[Dict[str, Any]]) -> str:
    """生成Markdown格式报告"""
    
    total_components = len(component_stats)
    total_features = sum(c["total"] for c in component_stats)
    total_completed = sum(c["completed"] for c in component_stats)
    overall_percentage = (total_completed / total_features * 100) if total_features > 0 else 0
    
    report = f"""# Monorepo 全局进度报告

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## 📊 总体概览

| 指标 | 数值 |
|------|------|
| 组件总数 | {total_components} |
| 功能总数 | {total_features} |
| 已完成 | {total_completed} ({overall_percentage:.1f}%) |
| 进行中 | {sum(c["in_progress"] for c in component_stats)} |
| 待开始 | {sum(c["pending"] for c in component_stats)} |

### 整体进度

```
{'█' * int(60 * overall_percentage / 100)}{'░' * (60 - int(60 * overall_percentage / 100))}
{overall_percentage:.1f}% 完成
```

## 📦 组件进度详情

| 组件 | 进度 | 已完成/总数 | 完成率 |
|------|------|------------|--------|
"""
    
    sorted_components = sorted(component_stats, key=lambda x: (-x["percentage"], x["name"]))
    
    for comp in sorted_components:
        status = "✅" if comp["percentage"] >= 100 else "🔄" if comp["percentage"] > 0 else "⏳"
        bar = "█" * int(20 * comp["percentage"] / 100) + "░" * (20 - int(20 * comp["percentage"] / 100))
        report += f"| {status} {comp['name']} | {bar} | {comp['completed']}/{comp['total']} | {comp['percentage']:.1f}% |\n"
    
    report += "\n## 🏆 最活跃组件\n\n"
    
    top_components = sorted(component_stats, key=lambda x: -x["completed"])[:10]
    for i, comp in enumerate(top_components, 1):
        report += f"{i}. **{comp['name']}**: {comp['completed']} 个功能已完成\n"
    
    return report


def generate_html_report(component_stats: List[Dict[str, Any]]) -> str:
    """生成HTML格式报告"""
    
    total_components = len(component_stats)
    total_features = sum(c["total"] for c in component_stats)
    total_completed = sum(c["completed"] for c in component_stats)
    overall_percentage = (total_completed / total_features * 100) if total_features > 0 else 0
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monorepo 全局进度报告</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1400px;
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
        .component-row {{ transition: background 0.2s; }}
        .component-row:hover {{ background: #f9f9f9; }}
        .progress-mini {{
            display: inline-block;
            width: 150px;
            height: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
            vertical-align: middle;
        }}
        .progress-mini-fill {{
            height: 100%;
            background: #4CAF50;
        }}
        .status-badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
        }}
        .status-completed {{ background: #4CAF50; color: white; }}
        .status-inprogress {{ background: #2196F3; color: white; }}
        .status-pending {{ background: #9E9E9E; color: white; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Monorepo 全局进度报告</h1>
        <p style="color: #999;">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <div class="stats">
            <div class="stat-card">
                <h3>组件总数</h3>
                <div class="value">{total_components}</div>
            </div>
            <div class="stat-card">
                <h3>功能总数</h3>
                <div class="value">{total_features}</div>
            </div>
            <div class="stat-card">
                <h3>已完成</h3>
                <div class="value">{total_completed}</div>
            </div>
            <div class="stat-card">
                <h3>整体完成率</h3>
                <div class="value">{overall_percentage:.1f}%</div>
            </div>
        </div>
        
        <div class="progress-bar">
            <div class="progress-fill" style="width: {overall_percentage}%">
                {overall_percentage:.1f}%
            </div>
        </div>
        
        <h2>组件进度详情</h2>
        <table>
            <thead>
                <tr>
                    <th>状态</th>
                    <th>组件名称</th>
                    <th>进度</th>
                    <th>已完成</th>
                    <th>总数</th>
                    <th>完成率</th>
                </tr>
            </thead>
            <tbody>
"""
    
    sorted_components = sorted(component_stats, key=lambda x: (-x["percentage"], x["name"]))
    
    for comp in sorted_components:
        if comp["percentage"] >= 100:
            status_class = "status-completed"
            status_text = "✅ 完成"
        elif comp["percentage"] > 0:
            status_class = "status-inprogress"
            status_text = "🔄 进行中"
        else:
            status_class = "status-pending"
            status_text = "⏳ 待开始"
        
        html += f"""
                <tr class="component-row">
                    <td><span class="{status_class} status-badge">{status_text}</span></td>
                    <td><strong>{comp['name']}</strong></td>
                    <td>
                        <div class="progress-mini">
                            <div class="progress-mini-fill" style="width: {comp['percentage']}%"></div>
                        </div>
                    </td>
                    <td>{comp['completed']}</td>
                    <td>{comp['total']}</td>
                    <td>{comp['percentage']:.1f}%</td>
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


def generate_json_report(component_stats: List[Dict[str, Any]]) -> str:
    """生成JSON格式报告"""
    
    total_components = len(component_stats)
    total_features = sum(c["total"] for c in component_stats)
    total_completed = sum(c["completed"] for c in component_stats)
    overall_percentage = (total_completed / total_features * 100) if total_features > 0 else 0
    
    report_data = {
        "generated_at": datetime.now().isoformat(),
        "summary": {
            "total_components": total_components,
            "total_features": total_features,
            "total_completed": total_completed,
            "total_in_progress": sum(c["in_progress"] for c in component_stats),
            "total_pending": sum(c["pending"] for c in component_stats),
            "overall_percentage": round(overall_percentage, 2)
        },
        "components": component_stats
    }
    
    return json.dumps(report_data, indent=2, ensure_ascii=False)


def main():
    """主函数"""
    args = parse_args()
    
    print("\n📦 扫描monorepo组件...")
    components = discover_components(args.workspace_root)
    
    if not components:
        print("❌ 未找到任何组件")
        print(f"   请确保在 {args.workspace_root}/components/ 目录下有组件")
        return 1
    
    print(f"✓ 发现 {len(components)} 个组件\n")
    
    print("📊 加载组件数据...")
    component_stats = []
    for comp in components:
        stats = load_component_features(args.workspace_root, comp)
        component_stats.append(stats)
        print(f"   ✓ {comp}")
    
    print()
    
    # 生成报告
    if args.format == "json":
        report = generate_json_report(component_stats)
    elif args.format == "html":
        report = generate_html_report(component_stats)
    elif args.format == "markdown":
        report = generate_markdown_report(component_stats)
    else:  # terminal
        report = generate_terminal_report(component_stats)
    
    # 输出报告
    if args.output:
        args.output.write_text(report, encoding='utf-8')
        print(f"✅ 报告已生成: {args.output}\n")
    else:
        print(report)
    
    return 0


if __name__ == "__main__":
    exit(main())

