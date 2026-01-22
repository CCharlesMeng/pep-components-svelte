#!/usr/bin/env python3
"""
项目初始化脚本
=============

根据项目规格文件生成功能清单和项目结构
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
        description="初始化Cursor自主编码项目",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 基础用法
  python init-project.js --spec spec.md
  
  # 指定功能数量和项目目录
  python init-project.js --spec spec.md --features 200 --project-dir ./my-app
  
  # 使用AI辅助生成功能清单
  python init-project.js --spec spec.md --ai-assist
        """
    )
    
    parser.add_argument(
        "--spec",
        type=Path,
        required=True,
        help="项目规格文件路径（markdown格式）"
    )
    
    parser.add_argument(
        "--features",
        type=int,
        default=150,
        help="生成的功能数量（默认150）"
    )
    
    parser.add_argument(
        "--project-dir",
        type=Path,
        default=Path.cwd(),
        help="项目目录（默认当前目录）"
    )
    
    parser.add_argument(
        "--ai-assist",
        action="store_true",
        help="使用AI辅助生成功能清单（需要在Cursor中运行）"
    )
    
    return parser.parse_args()


def read_spec_file(spec_path: Path) -> str:
    """读取项目规格文件"""
    if not spec_path.exists():
        raise FileNotFoundError(f"规格文件不存在: {spec_path}")
    
    return spec_path.read_text(encoding='utf-8')


def extract_tech_stack(spec_content: str) -> Dict[str, str]:
    """从规格中提取技术栈信息"""
    tech_stack = {
        "frontend": "未指定",
        "backend": "未指定",
        "database": "未指定",
        "testing": "未指定"
    }
    
    # 简单的关键词匹配
    content_lower = spec_content.lower()
    
    # Frontend
    if "react" in content_lower:
        tech_stack["frontend"] = "React"
    elif "vue" in content_lower:
        tech_stack["frontend"] = "Vue"
    elif "svelte" in content_lower:
        tech_stack["frontend"] = "Svelte"
    elif "angular" in content_lower:
        tech_stack["frontend"] = "Angular"
    
    # Backend
    if "express" in content_lower or "node" in content_lower:
        tech_stack["backend"] = "Node.js/Express"
    elif "fastapi" in content_lower:
        tech_stack["backend"] = "FastAPI"
    elif "django" in content_lower:
        tech_stack["backend"] = "Django"
    elif "flask" in content_lower:
        tech_stack["backend"] = "Flask"
    
    # Database
    if "postgresql" in content_lower or "postgres" in content_lower:
        tech_stack["database"] = "PostgreSQL"
    elif "mongodb" in content_lower or "mongo" in content_lower:
        tech_stack["database"] = "MongoDB"
    elif "sqlite" in content_lower:
        tech_stack["database"] = "SQLite"
    elif "mysql" in content_lower:
        tech_stack["database"] = "MySQL"
    
    return tech_stack


def generate_features_from_spec(spec_content: str, num_features: int) -> List[Dict[str, Any]]:
    """
    根据规格内容生成功能清单
    
    这是一个模板生成器，实际使用时应该结合AI或手动完善
    """
    
    features = []
    
    # 基础设施功能（优先级最高）
    infrastructure_features = [
        {
            "id": 1,
            "category": "infrastructure",
            "priority": "critical",
            "title": "项目初始化和依赖管理",
            "description": "设置项目结构，初始化包管理器，安装核心依赖",
            "acceptance_criteria": [
                "项目目录结构清晰合理",
                "依赖配置文件完整（package.json/requirements.txt等）",
                "开发环境可以成功启动",
                "README包含基本的设置说明"
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
            "category": "infrastructure",
            "priority": "critical",
            "title": "开发环境配置",
            "description": "配置开发服务器、热重载、环境变量等",
            "acceptance_criteria": [
                "开发服务器可以正常启动",
                "文件修改后自动重载",
                "环境变量正确加载",
                "开发工具配置完成（ESLint/Prettier等）"
            ],
            "estimated_complexity": "low",
            "dependencies": [1],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        },
        {
            "id": 3,
            "category": "infrastructure",
            "priority": "critical",
            "title": "数据库设置和迁移系统",
            "description": "初始化数据库，设置迁移工具，创建基础表结构",
            "acceptance_criteria": [
                "数据库连接成功",
                "迁移系统正常工作",
                "基础表结构创建成功",
                "可以执行CRUD操作"
            ],
            "estimated_complexity": "medium",
            "dependencies": [1, 2],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        }
    ]
    
    features.extend(infrastructure_features)
    
    # 生成核心功能占位符
    current_id = len(features) + 1
    categories = ["core", "api", "ui", "auth", "data", "integration", "testing", "optimization"]
    
    while len(features) < num_features:
        category = categories[(current_id - 1) % len(categories)]
        
        feature = {
            "id": current_id,
            "category": category,
            "priority": "high" if current_id < num_features * 0.3 else "medium",
            "title": f"功能 #{current_id} - 待定义",
            "description": f"[需要根据项目规格定义此功能的具体内容]",
            "acceptance_criteria": [
                "功能按预期工作",
                "代码质量良好",
                "已通过测试",
                "文档已更新"
            ],
            "estimated_complexity": "medium",
            "dependencies": [max(1, current_id - 5)] if current_id > 10 else [],
            "status": "pending",
            "completed_at": None,
            "tested": False,
            "commit_hash": None
        }
        
        features.append(feature)
        current_id += 1
    
    return features


def create_session_directory(project_dir: Path) -> Path:
    """创建会话配置目录"""
    session_dir = project_dir / ".cursor-session"
    session_dir.mkdir(exist_ok=True)
    
    # 创建配置文件
    config = {
        "created_at": datetime.now().isoformat(),
        "version": "1.0.0",
        "auto_commit": False,
        "validation_enabled": True
    }
    
    config_file = session_dir / "config.json"
    with open(config_file, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    # 创建空的会话历史
    history_file = session_dir / "session-history.json"
    with open(history_file, 'w', encoding='utf-8') as f:
        json.dump([], f, indent=2)
    
    return session_dir


def create_progress_file(project_dir: Path, spec_content: str, tech_stack: Dict[str, str]):
    """创建进度追踪文档"""
    progress_file = project_dir / "cursor-progress.md"
    
    content = f"""# 项目开发进度

## 项目信息

**创建时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**技术栈**:
- Frontend: {tech_stack['frontend']}
- Backend: {tech_stack['backend']}
- Database: {tech_stack['database']}

## 开发状态

| 指标 | 数值 |
|------|------|
| 总功能数 | - |
| 已完成 | 0 |
| 进行中 | 0 |
| 待开始 | - |
| 完成率 | 0% |

## 最近会话

### Session 1 - {datetime.now().strftime('%Y-%m-%d')}

**目标**: 项目初始化

**完成的功能**:
- [ ] 功能 #1: 项目初始化和依赖管理
- [ ] 功能 #2: 开发环境配置
- [ ] 功能 #3: 数据库设置和迁移系统

**遇到的问题**: 无

**下一步计划**: 完成基础设施设置后，开始核心功能开发

## 里程碑

- [ ] 基础设施完成 (0/3)
- [ ] 核心功能完成 (0/?)
- [ ] API端点完成 (0/?)
- [ ] UI组件完成 (0/?)
- [ ] 测试覆盖 (0%)
- [ ] 生产环境部署

## 注意事项

- 每完成一个功能立即提交Git
- 保持功能清单更新
- 及时记录遇到的问题和解决方案
"""
    
    with open(progress_file, 'w', encoding='utf-8') as f:
        f.write(content)


def init_git_repo(project_dir: Path):
    """初始化Git仓库"""
    try:
        # 检查是否已经是Git仓库
        result = subprocess.run(
            ["git", "rev-parse", "--git-dir"],
            cwd=project_dir,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("  ✓ Git仓库已存在")
            return
        
        # 初始化Git
        subprocess.run(["git", "init"], cwd=project_dir, check=True)
        print("  ✓ Git仓库初始化成功")
        
        # 创建.gitignore
        gitignore_content = """# 依赖
node_modules/
__pycache__/
venv/
.venv/
*.pyc
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# 构建输出
dist/
build/
*.egg-info/

# 日志
*.log
logs/

# OS
.DS_Store
Thumbs.db

# 测试
.coverage
htmlcov/
.pytest_cache/

# Cursor会话（可选保留）
.cursor-session/session-history.json
"""
        
        gitignore_file = project_dir / ".gitignore"
        if not gitignore_file.exists():
            with open(gitignore_file, 'w', encoding='utf-8') as f:
                f.write(gitignore_content)
            print("  ✓ .gitignore 创建成功")
        
    except subprocess.CalledProcessError as e:
        print(f"  ✗ Git初始化失败: {e}")
    except FileNotFoundError:
        print("  ✗ Git未安装，跳过仓库初始化")


def generate_ai_assist_prompt(spec_content: str, num_features: int) -> str:
    """生成AI辅助提示词"""
    prompt = f"""# 任务：生成项目功能清单

请根据以下项目规格，生成 {num_features} 个详细的功能点，以JSON格式输出。

## 项目规格

{spec_content}

## 输出格式

请生成一个JSON数组，每个功能包含以下字段：

```json
[
  {{
    "id": 1,
    "category": "infrastructure|core|api|ui|auth|data|integration|testing|optimization",
    "priority": "critical|high|medium|low",
    "title": "简洁的功能标题",
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

1. **功能分解要细**：每个功能应该是可以在2-4小时内完成的独立单元
2. **优先级明确**：
   - critical: 基础设施，其他功能依赖的核心功能（约5-10个）
   - high: 核心业务功能（约30%）
   - medium: 重要但非核心功能（约50%）
   - low: 优化和增强功能（约20%）
3. **类别分布合理**：
   - infrastructure: 项目基础（约5%）
   - core: 核心业务逻辑（约20%）
   - api: API端点（约15%）
   - ui: 用户界面组件（约20%）
   - auth: 认证授权（约5%）
   - data: 数据处理（约10%）
   - integration: 第三方集成（约10%）
   - testing: 测试（约10%）
   - optimization: 性能优化（约5%）
4. **依赖关系清晰**：确保依赖关系形成有向无环图（DAG）
5. **验收标准具体**：每个标准都应该是可测试、可验证的

请直接输出JSON数组，不要包含其他解释文字。
"""
    
    return prompt


def main():
    """主函数"""
    args = parse_args()
    
    print("\n" + "="*60)
    print("  Cursor 自主编码项目初始化")
    print("="*60 + "\n")
    
    # 读取规格文件
    print(f"📄 读取项目规格: {args.spec}")
    spec_content = read_spec_file(args.spec)
    print(f"  ✓ 规格文件读取成功 ({len(spec_content)} 字符)\n")
    
    # 提取技术栈
    print("🔍 分析技术栈...")
    tech_stack = extract_tech_stack(spec_content)
    for key, value in tech_stack.items():
        print(f"  {key}: {value}")
    print()
    
    # 确保项目目录存在
    args.project_dir.mkdir(parents=True, exist_ok=True)
    
    # 复制规格文件到项目目录
    spec_dest = args.project_dir / "spec.md"
    if not spec_dest.exists():
        spec_dest.write_text(spec_content, encoding='utf-8')
        print(f"  ✓ 规格文件已复制到: {spec_dest}\n")
    
    # 生成功能清单
    if args.ai_assist:
        print("🤖 生成AI辅助提示词...")
        prompt = generate_ai_assist_prompt(spec_content, args.features)
        
        # 保存提示词到文件
        prompt_file = args.project_dir / ".cursor-session" / "features-prompt.md"
        prompt_file.parent.mkdir(exist_ok=True)
        prompt_file.write_text(prompt, encoding='utf-8')
        
        print(f"\n  ✓ AI提示词已保存到: {prompt_file}")
        print("\n  📋 请按以下步骤操作：")
        print(f"     1. 在Cursor中打开: {prompt_file}")
        print("     2. 使用Composer或Chat功能，粘贴提示词")
        print("     3. 将生成的JSON保存到: features.json")
        print("     4. 运行验证: python scripts/validate.js\n")
        
        return
    
    print(f"⚙️  生成功能清单 ({args.features} 个功能)...")
    features = generate_features_from_spec(spec_content, args.features)
    
    # 保存功能清单
    features_file = args.project_dir / "features.json"
    with open(features_file, 'w', encoding='utf-8') as f:
        json.dump(features, f, indent=2, ensure_ascii=False)
    
    print(f"  ✓ 功能清单已生成: {features_file}")
    print(f"  ⚠️  注意: 大部分功能需要手动完善或使用 --ai-assist 选项\n")
    
    # 创建会话目录
    print("📁 创建会话配置目录...")
    session_dir = create_session_directory(args.project_dir)
    print(f"  ✓ 会话目录创建成功: {session_dir}\n")
    
    # 创建进度文件
    print("📊 创建进度追踪文档...")
    create_progress_file(args.project_dir, spec_content, tech_stack)
    print(f"  ✓ 进度文档创建成功: cursor-progress.md\n")
    
    # 初始化Git
    print("🔧 初始化Git仓库...")
    init_git_repo(args.project_dir)
    print()
    
    # 总结
    print("="*60)
    print("  ✅ 初始化完成！")
    print("="*60)
    print("\n📋 创建的文件:")
    print(f"  • {features_file.relative_to(Path.cwd()) if features_file.is_relative_to(Path.cwd()) else features_file}")
    print(f"  • {args.project_dir}/cursor-progress.md")
    print(f"  • {args.project_dir}/.cursor-session/")
    
    print("\n🚀 下一步:")
    print("  1. 完善功能清单（features.json）")
    print("  2. 运行: python scripts/next-task.js")
    print("  3. 在Cursor中开始开发\n")


if __name__ == "__main__":
    main()

