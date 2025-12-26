#!/usr/bin/env python3
"""
从 spec.md 生成 features.json

支持生成和合并模式
"""

import argparse
import json
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Optional
import shutil

PROJECT_ROOT = Path(__file__).parent.parent


def main():
    parser = argparse.ArgumentParser(description="从 spec.md 生成 features.json")
    parser.add_argument("--component", required=True, help="组件名称")
    parser.add_argument("--mode", choices=["generate", "merge"], default="generate", help="生成模式")
    
    args = parser.parse_args()
    
    component_dir = PROJECT_ROOT / "components" / args.component
    
    # 检查组件是否存在
    if not component_dir.exists():
        print(f"❌ 组件不存在: {args.component}")
        sys.exit(1)
    
    spec_file = component_dir / "spec.md"
    features_file = component_dir / "features.json"
    
    # 检查 spec.md 是否存在
    if not spec_file.exists():
        print(f"❌ spec.md 不存在")
        print(f"请先创建: {spec_file}")
        sys.exit(1)
    
    # 读取 spec.md
    spec_content = spec_file.read_text(encoding='utf-8')
    
    # 检查 spec.md 是否为空或仅有模板
    if len(spec_content.strip()) < 100 or "<!-- 请描述" in spec_content:
        print(f"⚠️  spec.md 内容不足或仍为模板")
        print(f"请先完善 spec.md 内容，再运行此脚本")
        sys.exit(1)
    
    print(f"📝 读取 spec.md: {len(spec_content)} 字符")
    
    # 备份现有 features.json（如果存在）
    if features_file.exists() and args.mode == "generate":
        backup_dir = component_dir / ".component-dev"
        backup_dir.mkdir(exist_ok=True)
        backup_file = backup_dir / f"features.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        shutil.copy(features_file, backup_file)
        print(f"📦 备份现有 features.json → {backup_file.name}")
    
    # 生成提示信息（由 AI 在 Cursor 中执行）
    print(f"\n{'='*70}")
    print(f"📋 spec.md 内容预览")
    print(f"{'='*70}\n")
    print(spec_content[:500])
    if len(spec_content) > 500:
        print(f"\n... (共 {len(spec_content)} 字符)\n")
    print(f"{'='*70}\n")
    
    print(f"💡 接下来需要 AI 根据上述 spec.md 生成 features.json")
    print(f"\n请在 Cursor 中运行:")
    print(f"  /pep-plan {args.component}")
    print(f"\nAI 会根据 spec.md 自动生成详细的任务列表。")
    print(f"\n{'='*70}")


if __name__ == "__main__":
    main()

