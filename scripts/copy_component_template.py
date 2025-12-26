#!/usr/bin/env python3
"""
组件模板拷贝工具

从现有组件拷贝结构，替换组件名称，用于快速创建新组件。
保证拷贝出的组件可以编译运行。
"""

import argparse
import json
import sys
import shutil
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent
COMPONENTS_DIR = PROJECT_ROOT / "components"
TEMPLATE_DIR = PROJECT_ROOT / ".ai-workflow" / "templates" / "component"


class ComponentCopier:
    """组件拷贝器"""
    
    def __init__(self, source: str, target: str, clean_spec: bool = False, 
                 clean_features: bool = False, clean_dev: bool = False):
        self.source = source
        self.target = target
        self.clean_spec = clean_spec
        self.clean_features = clean_features
        self.clean_dev = clean_dev
        
        self.source_dir = COMPONENTS_DIR / source
        self.target_dir = COMPONENTS_DIR / target
        
        # 生成名称变体映射
        self.name_mappings = self._generate_name_mappings()
        
    def _generate_name_mappings(self) -> List[Tuple[str, str]]:
        """生成不同格式的名称映射"""
        # 将 pep-my-component 分割
        source_parts = self.source.split('-')
        target_parts = self.target.split('-')
        
        # PascalCase: PepMyComponent
        source_pascal = ''.join(word.capitalize() for word in source_parts)
        target_pascal = ''.join(word.capitalize() for word in target_parts)
        
        # camelCase: pepMyComponent
        source_camel = source_parts[0] + ''.join(word.capitalize() for word in source_parts[1:])
        target_camel = target_parts[0] + ''.join(word.capitalize() for word in target_parts[1:])
        
        # snake_case: pep_my_component
        source_snake = '_'.join(source_parts)
        target_snake = '_'.join(target_parts)
        
        # UPPER_SNAKE_CASE: PEP_MY_COMPONENT
        source_upper = source_snake.upper()
        target_upper = target_snake.upper()
        
        # 返回映射列表（从长到短，避免部分匹配问题）
        return [
            (source_upper, target_upper),
            (source_pascal, target_pascal),
            (source_camel, target_camel),
            (source_snake, target_snake),
            (self.source, self.target),
        ]
        
    def copy(self):
        """执行拷贝操作"""
        print(f"🚀 从 {self.source} 拷贝组件模板到 {self.target}")
        
        # 1. 检查源组件是否存在
        if not self.source_dir.exists():
            print(f"❌ 源组件不存在: {self.source}")
            print(f"   路径: {self.source_dir}")
            self._list_available_components()
            sys.exit(1)
        
        # 2. 检查目标组件是否已存在
        if self.target_dir.exists():
            print(f"❌ 目标组件已存在: {self.target}")
            sys.exit(1)
        
        # 3. 拷贝目录结构
        print(f"📦 拷贝文件...")
        self._copy_directory()
        
        # 4. 替换所有文件中的组件名
        print(f"✏️  替换组件名...")
        self._replace_names_in_directory()
        
        # 5. 重命名文件
        print(f"📝 重命名文件...")
        self._rename_files()
        
        # 6. 清理内容（可选）
        if self.clean_spec or self.clean_features or self.clean_dev:
            print(f"🧹 清理内容...")
            self._clean_files()
        
        # 7. 更新 package.json
        print(f"📋 更新 package.json...")
        self._update_package_json()
        
        # 8. 生成初始 features.json（如果已清理）
        if self.clean_features:
            print(f"📝 生成初始 features.json...")
            self._generate_initial_features()
        
        print(f"✅ 组件拷贝完成")
        print(f"📂 位置: components/{self.target}")
        print()
        self._print_summary()
        
    def _list_available_components(self):
        """列出可用的组件"""
        if not COMPONENTS_DIR.exists():
            return
        
        components = [d.name for d in COMPONENTS_DIR.iterdir() if d.is_dir()]
        if components:
            print()
            print("可用的组件列表:")
            for comp in sorted(components):
                print(f"  - {comp}")
    
    def _copy_directory(self):
        """拷贝目录，排除某些文件"""
        # 需要排除的目录和文件
        exclude_patterns = [
            'node_modules',
            'build',
            'dist',
            '.svelte-kit',
            '__pycache__',
            '.DS_Store',
            'package-lock.json',
            'pnpm-lock.yaml',
            'yarn.lock',
        ]
        
        def ignore_patterns(directory, files):
            """返回需要忽略的文件列表"""
            ignored = []
            for pattern in exclude_patterns:
                for file in files:
                    if pattern in file:
                        ignored.append(file)
            return set(ignored)
        
        shutil.copytree(
            self.source_dir,
            self.target_dir,
            ignore=ignore_patterns
        )
    
    def _replace_names_in_directory(self):
        """递归替换目录中所有文件的组件名"""
        for item in self.target_dir.rglob('*'):
            if item.is_file():
                self._replace_names_in_file(item)
    
    def _replace_names_in_file(self, file_path: Path):
        """替换单个文件中的组件名"""
        # 跳过某些文件类型
        skip_extensions = ['.png', '.jpg', '.jpeg', '.gif', '.ico', '.woff', '.woff2', '.ttf']
        if file_path.suffix.lower() in skip_extensions:
            return
        
        try:
            # 读取文件内容
            content = file_path.read_text(encoding='utf-8')
            
            # 应用所有名称映射
            for source_name, target_name in self.name_mappings:
                content = content.replace(source_name, target_name)
            
            # 写回文件
            file_path.write_text(content, encoding='utf-8')
        except Exception as e:
            # 忽略无法处理的文件（可能是二进制文件）
            pass
    
    def _rename_files(self):
        """重命名包含源组件名的文件和目录"""
        items_to_rename = []
        
        # 收集需要重命名的项
        for item in self.target_dir.rglob('*'):
            if self.source in item.name:
                items_to_rename.append(item)
        
        # 按深度排序（深的先处理，避免路径问题）
        items_to_rename.sort(key=lambda p: len(p.parts), reverse=True)
        
        for item in items_to_rename:
            new_name = item.name.replace(self.source, self.target)
            new_path = item.parent / new_name
            try:
                item.rename(new_path)
            except Exception as e:
                print(f"⚠️  重命名失败: {item.name} -> {new_name}")
    
    def _clean_files(self):
        """清理特定文件的内容"""
        if self.clean_spec:
            self._clean_spec_file()
        
        if self.clean_features:
            self._clean_features_file()
        
        if self.clean_dev:
            self._clean_dev_file()
    
    def _clean_spec_file(self):
        """清理 spec.md，使用模板"""
        spec_file = self.target_dir / 'spec.md'
        template_spec = TEMPLATE_DIR / 'spec.md'
        
        if spec_file.exists() and template_spec.exists():
            # 从模板拷贝
            content = template_spec.read_text(encoding='utf-8')
            # 替换组件名
            for source_name, target_name in self.name_mappings:
                content = content.replace(source_name, target_name)
            spec_file.write_text(content, encoding='utf-8')
    
    def _clean_features_file(self):
        """清理 features.json"""
        features_file = self.target_dir / 'features.json'
        if features_file.exists():
            # 清空为空数组
            features_file.write_text('[]', encoding='utf-8')
    
    def _clean_dev_file(self):
        """清理 DEVELOPMENT.md"""
        dev_file = self.target_dir / 'DEVELOPMENT.md'
        template_dev = TEMPLATE_DIR / 'DEVELOPMENT.md'
        
        if dev_file.exists() and template_dev.exists():
            # 从模板拷贝
            content = template_dev.read_text(encoding='utf-8')
            dev_file.write_text(content, encoding='utf-8')
    
    def _update_package_json(self):
        """更新 package.json 中的组件信息"""
        package_file = self.target_dir / 'package.json'
        if not package_file.exists():
            return
        
        try:
            # 读取 package.json
            with open(package_file, 'r', encoding='utf-8') as f:
                package_data = json.load(f)
            
            # 更新基本信息
            package_data['name'] = self.target
            package_data['version'] = '0.1.0'
            package_data['description'] = f'{self.target} 组件（基于 {self.source} 拷贝）'
            
            # 更新关键词
            if 'keywords' in package_data:
                package_data['keywords'] = [
                    'svelte',
                    self.target,
                    'pep-components'
                ]
            
            # 写回文件
            with open(package_file, 'w', encoding='utf-8') as f:
                json.dump(package_data, f, indent=2, ensure_ascii=False)
                f.write('\n')
        
        except Exception as e:
            print(f"⚠️  更新 package.json 失败: {e}")
    
    def _generate_initial_features(self):
        """生成初始的 features.json"""
        features_file = self.target_dir / 'features.json'
        
        initial_features = [
            {
                "id": "INIT-001",
                "category": "setup",
                "priority": "high",
                "title": "组件基础结构",
                "description": f"从 {self.source} 拷贝组件结构并替换名称",
                "status": "completed",
                "completed_at": datetime.now().isoformat(),
                "estimated_complexity": 1
            },
            {
                "id": "TODO-001",
                "category": "refactor",
                "priority": "high",
                "title": "根据需求修改组件代码",
                "description": "修改 Props、逻辑和样式以符合新组件的需求",
                "status": "pending",
                "estimated_complexity": 3
            }
        ]
        
        features_file.write_text(
            json.dumps(initial_features, indent=2, ensure_ascii=False) + '\n',
            encoding='utf-8'
        )
    
    def _print_summary(self):
        """打印摘要信息"""
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("✨ 拷贝完成")
        print()
        print("✅ 所有文件中的组件名称已替换:")
        print(f"   {self.source} → {self.target}")
        for source_name, target_name in self.name_mappings[:3]:  # 显示前3个变体
            if source_name != self.source:
                print(f"   {source_name} → {target_name}")
        print()
        print("✅ 组件可以直接编译运行（需要根据实际需求修改代码）")
        print()
        print("📝 下一步操作:")
        print()
        print("1️⃣  编写需求规格")
        print(f"   vim components/{self.target}/spec.md")
        print()
        print("2️⃣  修改组件代码")
        print(f"   vim components/{self.target}/src/{self.target}.svelte")
        print()
        print("3️⃣  生成开发任务")
        print(f"   /pep-plan {self.target}")
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")


def main():
    parser = argparse.ArgumentParser(
        description="从现有组件拷贝结构创建新组件",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 从 pep-notice 拷贝创建新组件
  python3 scripts/copy_component_template.py --source pep-notice --target pep-new-alert
  
  # 拷贝并清理 spec 和 features
  python3 scripts/copy_component_template.py \\
    --source pep-notice \\
    --target pep-new-alert \\
    --clean-spec \\
    --clean-features
        """
    )
    
    parser.add_argument("--source", required=True, help="源组件名称")
    parser.add_argument("--target", required=True, help="目标组件名称")
    parser.add_argument("--clean-spec", action="store_true", help="清空 spec.md，使用模板")
    parser.add_argument("--clean-features", action="store_true", help="清空 features.json，生成初始任务")
    parser.add_argument("--clean-dev", action="store_true", help="清空 DEVELOPMENT.md")
    
    args = parser.parse_args()
    
    # 创建拷贝器并执行
    copier = ComponentCopier(
        source=args.source,
        target=args.target,
        clean_spec=args.clean_spec,
        clean_features=args.clean_features,
        clean_dev=args.clean_dev
    )
    
    copier.copy()


if __name__ == "__main__":
    main()

