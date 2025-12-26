#!/usr/bin/env python3
"""
组件脚手架生成器 - 基于系统预制模板

从 .ai-workflow/templates/component/ 拷贝干净的标准模板，替换占位符。

这是创建新组件的推荐方式，提供最小化、标准化的组件结构，
保证可编译运行，适合所有组件类型。
"""

import argparse
import json
import sys
import shutil
import re
from pathlib import Path
from datetime import datetime
from typing import Dict

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
TEMPLATE_DIR = PROJECT_ROOT / ".ai-workflow" / "templates" / "component"


class ComponentScaffolder:
    """组件脚手架生成器"""
    
    def __init__(self, component: str, mode: str, template_data: Dict):
        self.component = component
        self.mode = mode
        self.data = template_data
        self.component_dir = PROJECT_ROOT / "components" / component
        
        # 生成占位符映射
        self.placeholders = self._generate_placeholders()
        
    def _generate_placeholders(self) -> Dict[str, str]:
        """生成占位符映射"""
        # 将 pep-my-component 转换为 PepMyComponent
        parts = self.component.split('-')
        pascal_case = ''.join(word.capitalize() for word in parts)
        
        return {
            '{{COMPONENT_NAME}}': self.component,
            '{{COMPONENT_NAME_PASCAL}}': pascal_case,
            '{{DESCRIPTION}}': self.data.get('description', f'{self.component} 组件'),
            '{{INIT_DATE}}': datetime.now().isoformat(),
        }
        
    def generate(self):
        """生成脚手架"""
        print(f"🏗️  从模板创建 {self.component}")
        
        # 检查模板是否存在
        if not TEMPLATE_DIR.exists():
            print(f"❌ 模板目录不存在: {TEMPLATE_DIR}")
            print(f"请确保 .ai-workflow/templates/component/ 目录存在")
            sys.exit(1)
        
        # 检查组件是否已存在
        if self.component_dir.exists():
            print(f"❌ 组件已存在: {self.component}")
            sys.exit(1)
        
        # 1. 拷贝模板目录
        print(f"📦 拷贝模板...")
        shutil.copytree(TEMPLATE_DIR, self.component_dir)
        
        # 2. 替换所有文件中的占位符
        print(f"✏️  替换占位符...")
        self._replace_placeholders_in_directory(self.component_dir)
        
        # 3. 重命名包含占位符的文件
        print(f"📝 重命名文件...")
        self._rename_placeholder_files(self.component_dir)
        
        # 4. 根据 mode 进行增强（如果需要）
        if self.mode == 'custom' and self.data:
            print(f"🎨 应用定制增强...")
            self._apply_custom_enhancements()
        
        print(f"✅ 组件脚手架创建完成")
        print(f"📂 位置: components/{self.component}")
        
    def _replace_placeholders_in_directory(self, directory: Path):
        """递归替换目录中所有文件的占位符"""
        for item in directory.rglob('*'):
            if item.is_file():
                self._replace_placeholders_in_file(item)
                
    def _replace_placeholders_in_file(self, file_path: Path):
        """替换单个文件中的占位符"""
        try:
            # 读取文件内容
            content = file_path.read_text(encoding='utf-8')
            
            # 替换所有占位符
            for placeholder, value in self.placeholders.items():
                content = content.replace(placeholder, value)
            
            # 写回文件
            file_path.write_text(content, encoding='utf-8')
        except Exception as e:
            # 忽略二进制文件或其他无法处理的文件
            pass
            
    def _rename_placeholder_files(self, directory: Path):
        """重命名包含占位符的文件和目录"""
        # 需要重命名的文件（从深到浅处理，避免路径问题）
        items_to_rename = []
        for item in directory.rglob('*'):
            if '{{COMPONENT_NAME}}' in item.name:
                items_to_rename.append(item)
        
        # 按深度排序（深的先处理）
        items_to_rename.sort(key=lambda p: len(p.parts), reverse=True)
        
        for item in items_to_rename:
            new_name = item.name.replace('{{COMPONENT_NAME}}', self.component)
            new_path = item.parent / new_name
            item.rename(new_path)
            
    def _apply_custom_enhancements(self):
        """应用定制增强（根据 AI 理解的需求）"""
        # 这里可以根据 template_data 中的信息，进一步增强组件
        # 例如：添加特定的 Props、生成更详细的 spec.md 等
        
        features = self.data.get('features', [])
        if not features:
            return
        
        # 增强 spec.md
        spec_file = self.component_dir / 'spec.md'
        if spec_file.exists():
            self._enhance_spec(spec_file, features)
        
        # 生成初始 features.json
        features_file = self.component_dir / 'features.json'
        if features_file.exists():
            self._generate_initial_features(features_file)
            
    def _enhance_spec(self, spec_file: Path, features: list):
        """增强 spec.md，添加提取的功能信息"""
        content = spec_file.read_text(encoding='utf-8')
        
        # 在 "核心功能" 部分后添加提取的功能
        features_text = "\n".join([f"- {feature}" for feature in features])
        enhancement = f"\n\n提取的核心功能:\n{features_text}\n"
        
        content = content.replace(
            "<!-- 请描述组件的核心功能 -->",
            f"<!-- 请描述组件的核心功能 -->{enhancement}"
        )
        
        spec_file.write_text(content, encoding='utf-8')
        
    def _generate_initial_features(self, features_file: Path):
        """生成初始的 features.json"""
        initial_features = [
            {
                "id": "INIT-001",
                "category": "setup",
                "priority": "high",
                "title": "组件基础结构",
                "description": "已从模板创建组件骨架",
                "status": "completed",
                "completed_at": datetime.now().isoformat(),
                "estimated_complexity": 1
            }
        ]
        
        features_file.write_text(json.dumps(initial_features, indent=2, ensure_ascii=False))


def main():
    parser = argparse.ArgumentParser(description="组件脚手架生成器（基于模板）")
    parser.add_argument("--component", required=True, help="组件名称")
    parser.add_argument("--mode", required=True, choices=["minimal", "standard", "custom"], help="生成模式")
    parser.add_argument("--template-data", required=True, help="模板数据（JSON 字符串）")
    
    args = parser.parse_args()
    
    # 解析模板数据
    try:
        template_data = json.loads(args.template_data)
    except json.JSONDecodeError as e:
        print(f"❌ 模板数据格式错误: {e}")
        sys.exit(1)
    
    # 生成脚手架
    scaffolder = ComponentScaffolder(args.component, args.mode, template_data)
    scaffolder.generate()


if __name__ == "__main__":
    main()
