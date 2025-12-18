#!/usr/bin/env python3
"""
组件初始化脚本 (Monorepo版本)
===========================

为monorepo中的单个组件初始化功能清单和开发结构
"""

import argparse
import json
import os
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="在monorepo中初始化单个组件的开发流程",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 初始化新组件
  python init_component.py --component pep-button --features 20
  
  # 从规格文件初始化
  python init_component.py --component pep-modal --spec components/pep-modal/SPEC.md
  
  # 使用AI辅助
  python init_component.py --component pep-table --ai-assist
        """
    )
    
    parser.add_argument(
        "--component",
        type=str,
        required=True,
        help="组件名称（例如：pep-button）"
    )
    
    parser.add_argument(
        "--features",
        type=int,
        default=20,
        help="生成的功能数量（默认20，适合单个组件）"
    )
    
    parser.add_argument(
        "--spec",
        type=Path,
        help="组件规格文件路径（可选）"
    )
    
    parser.add_argument(
        "--ai-assist",
        action="store_true",
        help="使用AI辅助生成功能清单"
    )
    
    parser.add_argument(
        "--workspace-root",
        type=Path,
        default=Path.cwd(),
        help="Monorepo根目录（默认当前目录）"
    )
    
    return parser.parse_args()


def get_component_dir(workspace_root: Path, component_name: str) -> Path:
    """获取组件目录"""
    component_dir = workspace_root / "components" / component_name
    
    if not component_dir.exists():
        print(f"⚠️  组件目录不存在: {component_dir}")
        response = input("是否创建新组件目录？(y/N): ")
        if response.lower() == 'y':
            component_dir.mkdir(parents=True, exist_ok=True)
            print(f"✓ 已创建组件目录: {component_dir}")
        else:
            raise FileNotFoundError(f"组件目录不存在: {component_dir}")
    
    return component_dir


def read_spec_file(spec_path: Path) -> str:
    """读取组件规格文件"""
    if spec_path and spec_path.exists():
        return spec_path.read_text(encoding='utf-8')
    return ""


def generate_component_features(component_name: str, num_features: int, spec_content: str = "") -> List[Dict[str, Any]]:
    """
    生成组件的功能清单
    
    组件级别的功能通常包括：
    - 基础结构和样式
    - Props接口
    - 事件处理
    - 状态管理
    - 主题和样式变体
    - 可访问性
    - 文档和示例
    - 测试
    """
    
    features = []
    
    # 组件开发的标准功能模板
    standard_features = [
        {
            "id": 1,
            "category": "structure",
            "priority": "critical",
            "title": f"{component_name} - 基础组件结构",
            "description": f"创建{component_name}组件的基础文件结构，包括主组件文件、类型定义和基础样式",
            "acceptance_criteria": [
                "组件文件已创建",
                "TypeScript类型定义完整",
                "基础样式文件存在",
                "组件可以正常导入",
                "无TypeScript错误"
            ],
            "estimated_complexity": "low",
            "dependencies": [],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 2,
            "category": "props",
            "priority": "critical",
            "title": f"{component_name} - Props接口设计",
            "description": "定义组件的Props接口，包括必需和可选属性，以及默认值",
            "acceptance_criteria": [
                "Props接口类型完整",
                "必需属性已标记",
                "默认值已设置",
                "Props文档已编写",
                "类型检查通过"
            ],
            "estimated_complexity": "medium",
            "dependencies": [1],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 3,
            "category": "styling",
            "priority": "high",
            "title": f"{component_name} - 基础样式实现",
            "description": "实现组件的基础样式，包括布局、颜色、字体等",
            "acceptance_criteria": [
                "样式文件结构清晰",
                "CSS变量定义完整",
                "响应式设计正确",
                "浏览器兼容性良好",
                "样式与设计稿一致"
            ],
            "estimated_complexity": "medium",
            "dependencies": [1, 2],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 4,
            "category": "events",
            "priority": "high",
            "title": f"{component_name} - 事件处理",
            "description": "实现组件的事件系统，包括用户交互事件和自定义事件",
            "acceptance_criteria": [
                "所有交互事件已定义",
                "事件回调正确触发",
                "事件参数类型正确",
                "事件冒泡处理正确",
                "事件文档完整"
            ],
            "estimated_complexity": "medium",
            "dependencies": [2],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 5,
            "category": "variants",
            "priority": "medium",
            "title": f"{component_name} - 样式变体",
            "description": "实现组件的不同样式变体（如大小、颜色主题等）",
            "acceptance_criteria": [
                "所有变体已实现",
                "变体切换流畅",
                "变体样式正确",
                "变体文档完整",
                "变体示例已创建"
            ],
            "estimated_complexity": "medium",
            "dependencies": [3],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 6,
            "category": "accessibility",
            "priority": "high",
            "title": f"{component_name} - 无障碍支持",
            "description": "实现组件的无障碍特性，包括ARIA属性、键盘导航等",
            "acceptance_criteria": [
                "ARIA属性正确",
                "键盘导航完整",
                "屏幕阅读器友好",
                "焦点管理正确",
                "无障碍测试通过"
            ],
            "estimated_complexity": "medium",
            "dependencies": [2, 4],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 7,
            "category": "documentation",
            "priority": "high",
            "title": f"{component_name} - 文档和示例",
            "description": "编写组件的使用文档和代码示例",
            "acceptance_criteria": [
                "README文档完整",
                "API文档详细",
                "使用示例充分",
                "最佳实践说明",
                "常见问题解答"
            ],
            "estimated_complexity": "low",
            "dependencies": [2, 3, 4, 5],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 8,
            "category": "testing",
            "priority": "high",
            "title": f"{component_name} - 单元测试",
            "description": "编写组件的单元测试，覆盖主要功能和边界情况",
            "acceptance_criteria": [
                "测试覆盖率>80%",
                "所有Props测试完整",
                "事件测试完整",
                "边界情况测试",
                "测试全部通过"
            ],
            "estimated_complexity": "medium",
            "dependencies": [2, 4],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        }
    ]
    
    features.extend(standard_features)
    
    # 如果需要更多功能，生成额外的占位符
    current_id = len(features) + 1
    while len(features) < num_features:
        feature = {
            "id": current_id,
            "category": "enhancement",
            "priority": "medium",
            "title": f"{component_name} - 功能 #{current_id}（待定义）",
            "description": f"[根据组件需求定义此功能]",
            "acceptance_criteria": [
                "功能按预期工作",
                "代码质量良好",
                "测试通过",
                "文档已更新"
            ],
            "estimated_complexity": "medium",
            "dependencies": [],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        }
        features.append(feature)
        current_id += 1
    
    return features


def create_component_structure(component_dir: Path, component_name: str):
    """创建组件的开发结构"""
    
    # 创建.component-dev目录
    dev_dir = component_dir / ".component-dev"
    dev_dir.mkdir(exist_ok=True)
    
    # 创建配置文件
    config = {
        "component_name": component_name,
        "created_at": datetime.now().isoformat(),
        "version": "1.0.0",
        "maintainer": os.environ.get("USER", "unknown"),
        "auto_commit": False
    }
    
    config_file = dev_dir / "config.json"
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    # 创建会话历史
    history_file = dev_dir / "session-history.json"
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump([], f, indent=2)
    
    # 创建进度文档
    progress_file = component_dir / "DEVELOPMENT.md"
    if not progress_file.exists():
        content = f"""# {component_name} 开发进度

## 组件信息

**组件名**: {component_name}
**创建时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**维护者**: {os.environ.get("USER", "unknown")}

## 开发状态

| 指标 | 数值 |
|------|------|
| 总功能数 | - |
| 已完成 | 0 |
| 进行中 | 0 |
| 待开始 | - |
| 完成率 | 0% |

## 最近更新

### {datetime.now().strftime('%Y-%m-%d')}

**进度**: 项目初始化

**完成的功能**:
- [ ] 待开始

**下一步**: 开始基础结构开发

## 注意事项

- 遵循monorepo的代码规范
- 及时更新功能清单
- 每完成一个功能提交一次
- 保持文档同步
"""
        with open(progress_file, 'w', encoding='utf-8') as f:
            f.write(content)
    
    print(f"  ✓ 开发结构已创建: {dev_dir}")


def init_component_git(component_dir: Path, component_name: str):
    """为组件创建独立分支（如果需要）"""
    try:
        # 检查是否在Git仓库中
        result = subprocess.run(
            ["git", "rev-parse", "--git-dir"],
            cwd=component_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            # 获取当前分支
            current_branch = subprocess.run(
                ["git", "branch", "--show-current"],
                cwd=component_dir,
                capture_output=True,
                text=True,
                check=True
            ).stdout.strip()
            
            print(f"  ✓ 当前分支: {current_branch}")
            
            # 询问是否创建组件专用分支
            suggested_branch = f"component/{component_name}"
            if current_branch != suggested_branch:
                print(f"\n  💡 建议: 为此组件创建独立分支")
                print(f"     git checkout -b {suggested_branch}")
    
    except subprocess.CalledProcessError:
        pass
    except FileNotFoundError:
        print("  ⚠️  Git未安装，跳过Git操作")


def generate_ai_assist_prompt(component_name: str, num_features: int, spec_content: str = "") -> str:
    """生成组件级别的AI辅助提示词"""
    
    spec_section = f"""
## 组件规格

{spec_content}
""" if spec_content else ""
    
    prompt = f"""# 任务：为Svelte组件生成功能清单

请为 **{component_name}** 组件生成 {num_features} 个详细的功能点，以JSON格式输出。

{spec_section}

## 组件上下文

这是一个Svelte组件，位于pnpm monorepo中。组件应该：
- 可复用、独立
- 遵循Svelte最佳实践
- 支持TypeScript
- 具有良好的可访问性
- 有完整的文档和示例

## 功能分类建议

1. **structure** (5%) - 基础结构
2. **props** (15%) - Props接口和配置
3. **styling** (20%) - 样式和主题
4. **events** (15%) - 事件处理
5. **state** (10%) - 状态管理
6. **variants** (10%) - 样式变体
7. **accessibility** (10%) - 无障碍
8. **documentation** (10%) - 文档
9. **testing** (15%) - 测试

## 输出格式

```json
[
  {{
    "id": 1,
    "category": "structure|props|styling|events|state|variants|accessibility|documentation|testing",
    "priority": "critical|high|medium|low",
    "title": "{component_name} - 简洁的功能标题",
    "description": "详细描述此功能要实现什么，为什么重要",
    "acceptance_criteria": [
      "具体的验收标准1",
      "具体的验收标准2",
      "具体的验收标准3"
    ],
    "estimated_complexity": "low|medium|high",
    "dependencies": [依赖的功能ID列表],
    "status": "pending",
    "completed_at": null,
    "tested": false,
    "commit_hash": null
  }}
]
```

## 要求

1. **功能要细**: 每个功能1-3小时可完成
2. **优先级明确**: 
   - critical: 基础必需功能（2-3个）
   - high: 核心功能（40%）
   - medium: 重要功能（40%）
   - low: 增强功能（20%）
3. **依赖清晰**: 确保依赖关系合理
4. **验收标准具体**: 可测试、可验证

请直接输出JSON数组，不要包含其他解释文字。
"""
    
    return prompt


def main():
    """主函数"""
    args = parse_args()
    
    print("\n" + "="*70)
    print(f"  初始化组件: {args.component}")
    print("="*70 + "\n")
    
    # 获取组件目录
    print(f"📁 定位组件目录...")
    component_dir = get_component_dir(args.workspace_root, args.component)
    print(f"  ✓ 组件目录: {component_dir}\n")
    
    # 读取规格文件（如果提供）
    spec_content = ""
    if args.spec:
        print(f"📄 读取规格文件: {args.spec}")
        spec_content = read_spec_file(args.spec)
        if spec_content:
            print(f"  ✓ 规格文件读取成功 ({len(spec_content)} 字符)\n")
    
    # 生成功能清单
    if args.ai_assist:
        print("🤖 生成AI辅助提示词...")
        prompt = generate_ai_assist_prompt(args.component, args.features, spec_content)
        
        # 保存提示词
        dev_dir = component_dir / ".component-dev"
        dev_dir.mkdir(exist_ok=True)
        prompt_file = dev_dir / "features-prompt.md"
        prompt_file.write_text(prompt, encoding='utf-8')
        
        print(f"\n  ✓ AI提示词已保存到: {prompt_file}")
        print("\n  📋 请按以下步骤操作：")
        print(f"     1. 在Cursor中打开: {prompt_file}")
        print("     2. 使用Composer或Chat，粘贴提示词")
        print(f"     3. 将生成的JSON保存到: {component_dir}/features.json")
        print(f"     4. 运行验证: python scripts/validate.py --component {args.component}\n")
        
        return
    
    print(f"⚙️  生成功能清单 ({args.features} 个功能)...")
    features = generate_component_features(args.component, args.features, spec_content)
    
    # 保存功能清单
    features_file = component_dir / "features.json"
    with open(features_file, 'w', encoding='utf-8') as f:
        json.dump(features, f, indent=2, ensure_ascii=False)
    
    print(f"  ✓ 功能清单已生成: {features_file}")
    if args.features > 8:
        print(f"  ⚠️  部分功能需要手动完善或使用 --ai-assist 选项\n")
    
    # 创建组件开发结构
    print("📁 创建开发结构...")
    create_component_structure(component_dir, args.component)
    print()
    
    # Git操作提示
    print("🔧 Git设置...")
    init_component_git(component_dir, args.component)
    print()
    
    # 总结
    print("="*70)
    print("  ✅ 组件初始化完成！")
    print("="*70)
    print(f"\n📋 创建的文件:")
    print(f"  • {component_dir}/features.json")
    print(f"  • {component_dir}/DEVELOPMENT.md")
    print(f"  • {component_dir}/.component-dev/")
    
    print(f"\n🚀 下一步:")
    print(f"  1. cd {component_dir}")
    print(f"  2. 完善功能清单（features.json）")
    print(f"  3. 运行: python ../../cursor-autonomous-coding/scripts/next_task.py --component {args.component}")
    print(f"  4. 在Cursor中开始开发\n")


if __name__ == "__main__":
    main()

