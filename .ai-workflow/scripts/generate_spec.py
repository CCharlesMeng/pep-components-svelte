#!/usr/bin/env python3
"""
从 spec.md 生成 features.json
==============================

引导用户通过Cursor AI从规格文档生成功能清单
"""

import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import Optional

def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="从spec.md生成features.json",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
工作流程:
  1. 编写组件规格文档 (spec.md)
  2. 运行此脚本生成AI提示词
  3. 在Cursor中使用AI生成features.json
  4. 验证并开始开发

示例:
  # 生成AI提示词
  python generate_spec.py pep-button
  
  # 强制重新生成
  python generate_spec.py pep-button --regenerate
        """
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
        "--regenerate",
        action="store_true",
        help="强制重新生成（即使features.json已存在）"
    )
    
    parser.add_argument(
        "--num-features",
        type=int,
        default=20,
        help="生成的功能数量（默认20）"
    )
    
    return parser.parse_args()


def get_component_dir(workspace_root: Path, component: str) -> Path:
    """获取组件目录"""
    component_dir = workspace_root / "components" / component
    
    if not component_dir.exists():
        raise FileNotFoundError(f"组件目录不存在: {component_dir}")
    
    return component_dir


def read_spec_file(component_dir: Path) -> Optional[str]:
    """读取spec.md文件"""
    spec_file = component_dir / "spec.md"
    
    if not spec_file.exists():
        return None
    
    return spec_file.read_text(encoding='utf-8')


def generate_ai_prompt(component: str, spec_content: str, num_features: int) -> str:
    """生成AI提示词"""
    
    prompt = f"""# 任务：从规格文档生成功能清单

请根据以下组件规格，生成 **{num_features} 个** 详细的功能点（features），以JSON格式输出。

---

## 📋 组件规格文档

{spec_content}

---

## 🎯 生成要求

### 1. 功能粒度
- 每个功能应该在 **1-3小时** 内可完成
- 功能要具体、可测试、可验证
- 避免过大或过小的功能拆分

### 2. 功能分类（category）
建议按以下比例分配：

- `structure` (5%) - 基础结构搭建
- `props` (15%) - Props接口和配置
- `styling` (20%) - 样式和主题
- `events` (15%) - 事件处理
- `state` (10%) - 状态管理
- `variants` (10%) - 样式变体
- `accessibility` (10%) - 无障碍特性
- `documentation` (10%) - 文档和示例
- `testing` (15%) - 测试用例

### 3. 优先级（priority）
- `critical` - 基础必需功能（2-3个，如基础结构、核心Props）
- `high` - 核心功能（约40%，如主要样式、关键事件）
- `medium` - 重要功能（约40%，如变体、增强特性）
- `low` - 增强功能（约20%，如高级配置、额外文档）

### 4. 依赖关系（dependencies）
- 确保依赖关系合理
- 基础功能（id: 1）通常无依赖
- 后续功能依赖前置功能（如Props依赖基础结构）

### 5. 验收标准（acceptance_criteria）
- 每个功能至少3-5条验收标准
- 标准要具体、可测试
- 示例：
  - ✅ "组件文件已创建且无TypeScript错误"
  - ✅ "Props接口定义完整，包含必需和可选属性"
  - ❌ "完成Props" (太模糊)

---

## 📤 输出格式

请输出以下JSON格式（**仅输出JSON，不要其他解释文字**）：

```json
{{
  "project": {{
    "name": "{component}",
    "description": "从spec.md中提取的简短描述",
    "version": "1.0.0"
  }},
  "spec_version": "{datetime.now().strftime('%Y-%m-%d')}",
  "tech_stack": {{
    "framework": "Svelte",
    "language": "TypeScript",
    "styling": "CSS/SCSS"
  }},
  "features": [
    {{
      "id": 1,
      "category": "structure",
      "priority": "critical",
      "title": "{component} - 基础组件结构",
      "description": "详细描述此功能要实现什么，以及为什么重要",
      "acceptance_criteria": [
        "具体的验收标准1",
        "具体的验收标准2",
        "具体的验收标准3",
        "具体的验收标准4",
        "具体的验收标准5"
      ],
      "estimated_complexity": "low",
      "dependencies": [],
      "status": "pending",
      "completed_at": null,
      "tested": false,
      "commit_hash": null
    }},
    {{
      "id": 2,
      "category": "props",
      "priority": "critical",
      "title": "{component} - Props接口定义",
      "description": "...",
      "acceptance_criteria": ["...", "...", "..."],
      "estimated_complexity": "medium",
      "dependencies": [1],
      "status": "pending",
      "completed_at": null,
      "tested": false,
      "commit_hash": null
    }}
    // ... 继续到第 {num_features} 个功能
  ]
}}
```

---

## ⚠️ 重要提醒

1. **基于spec.md内容生成**：功能应该反映spec.md中描述的需求
2. **功能ID连续**：从1开始，连续递增到{num_features}
3. **依赖合理**：确保dependencies中的ID在当前功能之前
4. **所有字段必填**：每个功能的所有字段都必须填写
5. **仅输出JSON**：不要包含任何解释文字或markdown标记

---

开始生成 {num_features} 个功能清单 ↓
"""
    
    return prompt


def save_prompt(component_dir: Path, prompt: str) -> Path:
    """保存AI提示词"""
    prompt_dir = component_dir / ".cursor-prompts"
    prompt_dir.mkdir(exist_ok=True)
    
    prompt_file = prompt_dir / "generate-features.md"
    prompt_file.write_text(prompt, encoding='utf-8')
    
    return prompt_file


def main():
    """主函数"""
    args = parse_args()
    
    print("\n" + "=" * 70)
    print(f"  从 spec.md 生成 features.json")
    print("=" * 70)
    print(f"\n组件: {args.component}\n")
    
    try:
        component_dir = get_component_dir(args.workspace_root, args.component)
        
        # 检查features.json是否已存在
        features_file = component_dir / "features.json"
        if features_file.exists() and not args.regenerate:
            print(f"⚠️  features.json 已存在")
            print(f"   位置: {features_file}")
            print(f"\n💡 如需重新生成，请使用 --regenerate 参数\n")
            return
        
        # 读取spec.md
        print("📄 读取 spec.md...")
        spec_content = read_spec_file(component_dir)
        
        if not spec_content:
            print(f"\n❌ spec.md 不存在！")
            print(f"\n请先创建规格文档:")
            print(f"  vim {component_dir}/spec.md\n")
            print("规格文档应包含:")
            print("  - 组件概述和目标")
            print("  - 主要功能描述")
            print("  - Props和事件说明")
            print("  - 样式要求")
            print("  - 示例用法\n")
            return
        
        print(f"  ✓ spec.md 读取成功 ({len(spec_content)} 字符)\n")
        
        # 生成AI提示词
        print(f"🤖 生成 AI 提示词 ({args.num_features} 个功能)...")
        prompt = generate_ai_prompt(args.component, spec_content, args.num_features)
        
        # 保存提示词
        prompt_file = save_prompt(component_dir, prompt)
        print(f"  ✓ 提示词已保存到: {prompt_file}\n")
        
        # 使用说明
        print("=" * 70)
        print("  📋 下一步操作")
        print("=" * 70)
        print()
        print("1️⃣  在 Cursor 中打开提示词文件:")
        print(f"   {prompt_file}")
        print()
        print("2️⃣  使用 Cursor AI 生成功能清单:")
        print("   • 打开 Composer (Cmd+I 或 Ctrl+I)")
        print("   • 或使用 Chat (Cmd+L 或 Ctrl+L)")
        print("   • 将提示词内容发送给AI")
        print()
        print("3️⃣  保存 AI 生成的 JSON:")
        print(f"   • 复制AI输出的完整JSON")
        print(f"   • 保存到: {features_file}")
        print()
        print("4️⃣  验证生成的功能清单:")
        print(f"   pep-dev validate {args.component}")
        print()
        print("5️⃣  检查合规性:")
        print(f"   pep-dev check {args.component}")
        print()
        print("6️⃣  开始开发:")
        print(f"   pep-dev next {args.component} --save")
        print()
        print("=" * 70)
        print()
        
    except FileNotFoundError as e:
        print(f"\n❌ {e}\n")
    except Exception as e:
        print(f"\n❌ 生成失败: {e}\n")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

