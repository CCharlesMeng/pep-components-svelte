#!/usr/bin/env python3
"""
全自动化开发脚本
==============

类似Claude SDK的自动迭代模式，但在Cursor环境中运行
"""

import argparse
import json
import subprocess
import time
import os
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional


def parse_args() -> argparse.Namespace:
    """解析命令行参数"""
    parser = argparse.ArgumentParser(
        description="全自动化开发模式（实验性）",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
⚠️  注意：全自动化模式是实验性功能！

此模式会尝试自动：
1. 获取下一个任务
2. 生成Cursor提示词
3. 等待用户在Cursor中完成（需要手动）
4. 提示测试和提交
5. 自动标记完成
6. 循环到下一个任务

使用场景：
- 想要自动化流程但保留人工审查
- 减少手动输入命令的次数
- 适合专注开发的工作流

示例：
  # 单个组件自动开发
  python auto_develop.py --component pep-button
  
  # 限制迭代次数
  python auto_develop.py --component pep-button --max-iterations 5
  
  # 自动测试和提交
  python auto_develop.py --component pep-button --auto-commit
        """
    )
    
    parser.add_argument(
        "--component",
        type=str,
        help="组件名称（Monorepo模式）"
    )
    
    parser.add_argument(
        "--project-dir",
        type=Path,
        default=Path.cwd(),
        help="项目目录"
    )
    
    parser.add_argument(
        "--max-iterations",
        type=int,
        help="最大迭代次数（不指定则无限循环）"
    )
    
    parser.add_argument(
        "--delay",
        type=int,
        default=10,
        help="每次迭代之间的延迟秒数（默认10秒）"
    )
    
    parser.add_argument(
        "--auto-commit",
        action="store_true",
        help="自动提交代码（危险！请确保已测试）"
    )
    
    parser.add_argument(
        "--auto-test",
        action="store_true",
        help="自动运行测试"
    )
    
    parser.add_argument(
        "--cursor-prompt-only",
        action="store_true",
        help="只生成Cursor提示词，不自动循环"
    )
    
    return parser.parse_args()


def get_script_dir() -> Path:
    """获取脚本目录"""
    return Path(__file__).parent


def run_command(cmd: List[str], cwd: Path = None, check: bool = True) -> subprocess.CompletedProcess:
    """运行命令"""
    return subprocess.run(
        cmd,
        cwd=cwd,
        capture_output=True,
        text=True,
        check=check
    )


def get_next_task(project_dir: Path, component: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """获取下一个任务"""
    script_dir = get_script_dir()
    next_task_script = script_dir / "next_task.py"
    
    cmd = ["python3", str(next_task_script), "--format", "json", "--project-dir", str(project_dir)]
    if component:
        cmd.extend(["--component", component])
    
    try:
        result = run_command(cmd, check=False)
        if result.returncode == 0 and result.stdout:
            # 解析JSON输出
            tasks = json.loads(result.stdout)
            return tasks[0] if tasks else None
        return None
    except Exception as e:
        print(f"获取任务失败: {e}")
        return None


def generate_cursor_prompt(task: Dict[str, Any], component: Optional[str] = None) -> str:
    """生成Cursor使用的提示词"""
    
    comp_info = f"组件: {component}\n" if component else ""
    
    prompt = f"""# 🤖 自动开发任务

{comp_info}功能 #{task['id']}: {task['title']}

## 📋 任务详情

**类别**: {task.get('category', 'unknown')}
**优先级**: {task.get('priority', 'medium')}
**复杂度**: {task.get('estimated_complexity', 'medium')}

### 功能描述

{task.get('description', '无描述')}

### 验收标准

"""
    
    for i, criterion in enumerate(task.get('acceptance_criteria', []), 1):
        prompt += f"{i}. {criterion}\n"
    
    prompt += """

## 🎯 实现要求

请按照以下步骤实现此功能：

1. **阅读理解** - 仔细理解功能描述和验收标准
2. **设计方案** - 思考实现方案和文件结构
3. **编写代码** - 实现核心功能逻辑
4. **添加测试** - 编写必要的单元测试
5. **更新文档** - 更新README和API文档
6. **验证功能** - 确保所有验收标准都满足

## ⚡ 快速开始

在Cursor Composer中：
1. 引用此文件: @current-task.md
2. 说："请帮我完成这个任务"
3. 审查AI生成的代码
4. 调整和完善

## ✅ 完成检查清单

完成后请确认：
- [ ] 所有验收标准都已满足
- [ ] 代码通过linter检查
- [ ] 测试全部通过
- [ ] 文档已更新
- [ ] 代码已格式化

---

准备好后，让我们开始吧！🚀
"""
    
    return prompt


def save_cursor_prompt(prompt: str, project_dir: Path, component: Optional[str] = None) -> Path:
    """保存Cursor提示词"""
    if component:
        prompt_file = project_dir / "components" / component / ".component-dev" / "current-task.md"
    else:
        prompt_file = project_dir / ".cursor-session" / "current-task.md"
    
    prompt_file.parent.mkdir(parents=True, exist_ok=True)
    prompt_file.write_text(prompt, encoding='utf-8')
    
    return prompt_file


def wait_for_user_completion(delay: int):
    """等待用户完成开发"""
    print(f"\n⏱️  等待 {delay} 秒...")
    print("   在此期间，请在Cursor中完成开发")
    print("   按 Ctrl+C 可以随时停止\n")
    
    try:
        time.sleep(delay)
    except KeyboardInterrupt:
        print("\n\n⏸️  用户中断")
        raise


def prompt_user_action(message: str, default: str = "n") -> bool:
    """提示用户操作"""
    response = input(f"{message} (y/N): ").strip().lower()
    return response == 'y' if default == 'n' else response != 'n'


def run_tests(project_dir: Path, component: Optional[str] = None) -> bool:
    """运行测试"""
    print("\n🧪 运行测试...")
    
    if component:
        test_dir = project_dir / "components" / component
    else:
        test_dir = project_dir
    
    try:
        result = run_command(["npm", "test"], cwd=test_dir, check=False)
        
        if result.returncode == 0:
            print("✅ 测试通过")
            return True
        else:
            print("❌ 测试失败")
            print(result.stdout)
            return False
    except Exception as e:
        print(f"⚠️  无法运行测试: {e}")
        return False


def commit_changes(project_dir: Path, task: Dict[str, Any], component: Optional[str] = None) -> bool:
    """提交代码"""
    print("\n📝 提交代码...")
    
    comp_prefix = f"({component})" if component else ""
    commit_msg = f"feat{comp_prefix}: {task['title']} (#{task['id']})"
    
    try:
        # Git add
        run_command(["git", "add", "."], cwd=project_dir)
        
        # Git commit
        run_command(["git", "commit", "-m", commit_msg], cwd=project_dir)
        
        print(f"✅ 已提交: {commit_msg}")
        return True
    except Exception as e:
        print(f"❌ 提交失败: {e}")
        return False


def mark_task_done(project_dir: Path, task_id: int, component: Optional[str] = None) -> bool:
    """标记任务完成"""
    print(f"\n✓ 标记功能 #{task_id} 为已完成...")
    
    script_dir = get_script_dir()
    mark_done_script = script_dir / "mark_done.py"
    
    cmd = [
        "python3", str(mark_done_script),
        "--project-dir", str(project_dir),
        "--feature-id", str(task_id),
        "--tested"
    ]
    
    if component:
        cmd.extend(["--component", component])
    
    try:
        result = run_command(cmd, check=False)
        if result.returncode == 0:
            print(f"✅ 功能 #{task_id} 已标记完成")
            return True
        else:
            print(f"❌ 标记失败: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ 标记失败: {e}")
        return False


def print_banner():
    """打印banner"""
    banner = """
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🤖 Cursor 全自动化开发模式                             ║
║                                                                    ║
║  此模式会自动循环：获取任务 → 等待开发 → 测试 → 提交 → 下一个      ║
║                                                                    ║
║  ⚠️  实验性功能，请谨慎使用！                                       ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝
"""
    print(banner)


def main():
    """主函数"""
    args = parse_args()
    
    print_banner()
    
    # 确认模式
    comp_info = f"组件: {args.component}" if args.component else "标准项目"
    print(f"\n📦 {comp_info}")
    print(f"📁 项目目录: {args.project_dir}")
    
    if args.max_iterations:
        print(f"🔄 最大迭代: {args.max_iterations}")
    else:
        print("🔄 无限循环（直到所有功能完成或Ctrl+C）")
    
    print(f"⏱️  延迟: {args.delay}秒")
    print(f"🚀 自动提交: {'是' if args.auto_commit else '否'}")
    print(f"🧪 自动测试: {'是' if args.auto_test else '否'}")
    
    if not args.cursor_prompt_only and not args.auto_commit:
        print("\n⚠️  提示: 没有启用 --auto-commit，需要手动提交代码")
    
    if not args.cursor_prompt_only:
        print("\n按 Enter 开始，Ctrl+C 停止...")
        try:
            input()
        except KeyboardInterrupt:
            print("\n已取消")
            return 0
    
    # 主循环
    iteration = 0
    
    try:
        while True:
            iteration += 1
            
            # 检查最大迭代次数
            if args.max_iterations and iteration > args.max_iterations:
                print(f"\n✅ 已达到最大迭代次数 ({args.max_iterations})")
                break
            
            print("\n" + "="*70)
            print(f"  迭代 #{iteration}")
            print("="*70 + "\n")
            
            # 1. 获取下一个任务
            print("📋 获取下一个任务...")
            task = get_next_task(args.project_dir, args.component)
            
            if not task:
                print("\n🎉 太棒了！所有功能都已完成！")
                break
            
            print(f"\n✨ 下一个任务: 功能 #{task['id']} - {task['title']}")
            
            # 2. 生成Cursor提示词
            print("\n📝 生成Cursor提示词...")
            prompt = generate_cursor_prompt(task, args.component)
            prompt_file = save_cursor_prompt(prompt, args.project_dir, args.component)
            print(f"✓ 提示词已保存: {prompt_file}")
            
            # 仅生成提示词模式
            if args.cursor_prompt_only:
                print("\n💡 提示词已生成，请在Cursor中使用:")
                print(f"   1. 打开Cursor Composer")
                print(f"   2. 引用: @{prompt_file.name}")
                print(f"   3. 说: 请帮我完成这个任务")
                break
            
            # 3. 等待用户完成
            print("\n" + "-"*70)
            print("🎨 请在Cursor中完成开发:")
            print(f"   1. 打开Cursor Composer")
            print(f"   2. 引用: @{prompt_file.name}")
            print(f"   3. 让AI帮你完成任务")
            print("-"*70)
            
            wait_for_user_completion(args.delay)
            
            # 4. 提示验证
            print("\n" + "-"*70)
            if not prompt_user_action("✅ 功能开发完成了吗？", "n"):
                print("跳过此功能，继续下一个...")
                continue
            
            # 5. 运行测试
            test_passed = True
            if args.auto_test:
                test_passed = run_tests(args.project_dir, args.component)
                if not test_passed:
                    if not prompt_user_action("⚠️  测试失败，是否继续？"):
                        print("中止...")
                        break
            else:
                if not prompt_user_action("🧪 测试通过了吗？"):
                    print("请修复测试后再继续...")
                    continue
            
            # 6. 提交代码
            if args.auto_commit:
                if not commit_changes(args.project_dir, task, args.component):
                    print("⚠️  提交失败，但继续标记完成...")
            else:
                if not prompt_user_action("📝 代码已提交了吗？"):
                    print("请先提交代码...")
                    continue
            
            # 7. 标记完成
            if not mark_task_done(args.project_dir, task['id'], args.component):
                print("⚠️  标记失败")
                if not prompt_user_action("是否继续下一个任务？"):
                    break
            
            # 8. 准备下一轮
            print(f"\n✓ 功能 #{task['id']} 完成！")
            print(f"\n等待 {args.delay} 秒后继续下一个任务...")
            print("(按 Ctrl+C 可以停止)")
            
            try:
                time.sleep(args.delay)
            except KeyboardInterrupt:
                print("\n\n⏸️  已暂停")
                if not prompt_user_action("继续下一个任务？"):
                    break
    
    except KeyboardInterrupt:
        print("\n\n🛑 用户停止")
    
    # 最终总结
    print("\n" + "="*70)
    print("  自动化开发会话结束")
    print("="*70)
    print(f"\n完成迭代数: {iteration - 1}")
    print("\n💡 提示:")
    print("   - 运行 report.py 查看进度")
    print("   - 运行此脚本继续开发")
    print("\n")
    
    return 0


if __name__ == "__main__":
    try:
        exit(main())
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        raise

