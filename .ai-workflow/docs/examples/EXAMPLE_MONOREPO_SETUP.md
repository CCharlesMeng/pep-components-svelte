# 示例：在pep-components-svelte中使用

这是一个真实的示例，展示如何在您的`pep-components-svelte`项目中使用此工具。

## 项目背景

- **项目类型**: pnpm workspace monorepo
- **组件数量**: 将有100+个Svelte组件
- **团队规模**: 多人协作，每人负责不同组件
- **开发模式**: 每个组件独立分支开发

## 项目结构

```
pep-components-svelte/
├── components/
│   ├── pep-mkp-common-offering/  # 现有组件
│   ├── pep-navigate-link/         # 现有组件
│   ├── pep-button/                # 新组件
│   ├── pep-input/                 # 新组件
│   └── ...                        # 100+ 组件
│
├── cursor-autonomous-coding/      # 本工具
│   └── scripts/
│
├── shared/
├── templates/
├── package.json
└── pnpm-workspace.yaml
```

## 完整使用流程

### 步骤1: 安装和配置

```bash
# 1. 确认工具已在项目中
cd /path/to/pep-components-svelte
ls cursor-autonomous-coding/

# 2. 配置别名（可选但推荐）
echo "
# PEP组件开发别名
export PEP_ROOT='/Users/mengxin/Documents/Code/公司项目/pep-components-svelte'
export CAC_ROOT='\$PEP_ROOT/cursor-autonomous-coding'
alias pep-init='python3 \$CAC_ROOT/scripts/init-component.js --workspace-root \$PEP_ROOT'
alias pep-next='python3 \$CAC_ROOT/scripts/next-task.js --project-dir \$PEP_ROOT'
alias pep-done='python3 \$CAC_ROOT/scripts/mark-done.js --project-dir \$PEP_ROOT'
alias pep-report='python3 \$CAC_ROOT/scripts/report.js --project-dir \$PEP_ROOT'
alias pep-check='python3 \$CAC_ROOT/scripts/validate.js --project-dir \$PEP_ROOT'
alias pep-summary='python3 \$CAC_ROOT/scripts/monorepo-summary.js --workspace-root \$PEP_ROOT'
" >> ~/.zshrc

source ~/.zshrc
```

### 步骤2: 初始化第一个新组件

假设您要创建一个新的按钮组件 `pep-button`:

```bash
# 2.1 创建组件目录（如果不存在）
mkdir -p components/pep-button

# 2.2 初始化SvelteKit结构（使用现有模板或手动创建）
# 这部分按您现有的组件创建流程

# 2.3 初始化开发流程
pep-init --component pep-button --features 20

# 输出：
# ✓ 组件目录: /path/to/components/pep-button
# ✓ 功能清单已生成: features.json
# ✓ 开发结构已创建: .component-dev/
# ✓ 当前分支: main
# 💡 建议: 为此组件创建独立分支
#    git checkout -b component/pep-button
```

### 步骤3: 创建组件分支

```bash
# 3.1 创建并切换到组件分支
git checkout -b component/pep-button

# 3.2 提交初始化
git add components/pep-button/
git commit -m "init(pep-button): 初始化组件开发结构"
git push -u origin component/pep-button
```

### 步骤4: 开始第一个任务

```bash
# 4.1 获取第一个任务
pep-next --component pep-button --save

# 输出：
# ╔══════════════════════════════════════════╗
# ║ Next Task: Feature #1                    ║
# ╠══════════════════════════════════════════╣
# ║ Title: pep-button - 基础组件结构          ║
# ║ Priority: critical | Category: structure  ║
# ╚══════════════════════════════════════════╝
# 
# [详细的开发指南...]
# 
# 💾 任务已保存到: components/pep-button/.component-dev/current-task.md

# 4.2 在Cursor中打开组件
cd components/pep-button
cursor .
```

### 步骤5: 在Cursor中开发

在Cursor的Composer中：

```
@.component-dev/current-task.md 

请帮我完成pep-button组件的基础结构任务，要求：
1. 创建Button.svelte主组件文件
2. 定义TypeScript类型
3. 实现基础样式
4. 确保组件可以正常导入

请遵循Svelte最佳实践和项目规范。
```

Cursor会帮你创建所有必要的文件并实现功能。

### 步骤6: 测试和验证

```bash
# 6.1 运行组件测试
npm test

# 6.2 启动开发服务器检查
pnpm --filter pep-button dev

# 6.3 在浏览器中测试
# 访问 http://localhost:5173
# 验证所有验收标准
```

### 步骤7: 提交和标记完成

```bash
# 7.1 提交代码
cd /path/to/pep-components-svelte
git add components/pep-button/
git commit -m "feat(pep-button): 完成基础组件结构 (#1)

- 创建Button.svelte主组件
- 定义Props类型接口
- 实现基础样式
- 添加基础测试
- 组件可正常导入使用

验收标准已全部通过"

# 7.2 标记功能完成
pep-done --component pep-button --feature-id 1 --tested

# 输出：
# ✓ 功能清单已更新
# ✓ 会话历史已更新
# ✓ 进度文档已更新
# ✅ 完成标记成功！
# 当前进度: 1/20 (5.0%)
```

### 步骤8: 继续下一个功能

```bash
# 8.1 获取下一个任务
pep-next --component pep-button --save

# 8.2 重复步骤5-7
# ...

# 8.3 定期查看进度
pep-report --component pep-button
```

### 步骤9: 组件完成后

当所有20个功能都完成后：

```bash
# 9.1 生成最终报告
pep-report --component pep-button --detailed --format html \
  --output components/pep-button/final-report.html

# 9.2 验证清单
pep-check --component pep-button

# 9.3 合并到main
git checkout main
git merge component/pep-button

# 或创建PR
git push origin component/pep-button
# 在GitHub/GitLab创建PR

# 9.4 更新组件README
cd components/pep-button
# 添加使用文档、API说明等
```

## 批量初始化多个组件

如果您要同时初始化多个组件：

```bash
#!/bin/bash
# scripts/init_components.sh

components=(
    "pep-button"
    "pep-input"
    "pep-textarea"
    "pep-select"
    "pep-checkbox"
    "pep-radio"
    "pep-modal"
    "pep-toast"
    "pep-tooltip"
    "pep-dropdown"
)

for comp in "${components[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "初始化组件: $comp"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 创建组件目录
    mkdir -p "components/$comp"
    
    # 初始化开发流程
    pep-init --component "$comp" --features 20
    
    # 创建分支
    git checkout -b "component/$comp"
    git add "components/$comp/"
    git commit -m "init($comp): 初始化组件开发结构"
    git push -u origin "component/$comp"
    
    # 回到main
    git checkout main
    
    echo ""
done

echo "✅ 所有组件初始化完成！"
```

运行：

```bash
chmod +x scripts/init_components.sh
./scripts/init_components.sh
```

## 查看全局进度

```bash
# 终端查看
pep-summary

# 输出示例：
# ╔═════════════════════════════════════════╗
# ║ 📊 Monorepo 全局进度报告                ║
# ╠═════════════════════════════════════════╣
# ║ 组件总数: 10                            ║
# ║ 功能总数: 200                           ║
# ║ 已完成: 45 (22.5%)                      ║
# ║ 进行中: 5                               ║
# ║ 待开始: 150                             ║
# ╚═════════════════════════════════════════╝
#
# 组件进度详情：
# ✅ pep-button         [████████████░░░░░░] 60.0% (12/20)
# 🔄 pep-input          [██████░░░░░░░░░░░░] 30.0% (6/20)
# 🔄 pep-modal          [███░░░░░░░░░░░░░░░] 15.0% (3/20)
# ⏳ pep-select         [░░░░░░░░░░░░░░░░░░]  0.0% (0/20)
# ...

# 生成HTML报告（团队分享）
pep-summary --format html --output weekly-progress.html
open weekly-progress.html
```

## 每日开发流程

### 作为组件维护者

```bash
# 早上
cd /path/to/pep-components-svelte

# 1. 同步代码
git checkout component/pep-button
git pull origin component/pep-button

# 2. 查看进度
pep-report --component pep-button

# 3. 获取今天的任务
pep-next --component pep-button --save

# 4. 开发
cd components/pep-button
cursor .
# 在Cursor中编码...

# 晚上
# 5. 测试
npm test

# 6. 提交
cd /path/to/pep-components-svelte
git add components/pep-button/
git commit -m "feat(pep-button): 完成XX功能 (#N)"

# 7. 标记
pep-done --component pep-button --feature-id N --tested

# 8. 推送
git push origin component/pep-button
```

### 作为项目负责人

```bash
# 每周生成全局报告
pep-summary --format html --output reports/week-$(date +%U).html

# 检查所有组件状态
for comp in components/*/; do
    comp_name=$(basename "$comp")
    [ -f "$comp/features.json" ] && pep-check --component "$comp_name"
done

# 查看哪些组件需要关注
pep-summary | grep "⏳"  # 未开始的组件
pep-summary | grep "🔄" | sort  # 进行中的组件，按进度排序
```

## 与现有工作流集成

### 与pnpm命令集成

在根目录 `package.json` 中添加：

```json
{
  "scripts": {
    "dev": "pnpm --filter",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    
    "comp:init": "node scripts/init-component.js",
    "comp:next": "node scripts/next-task.js",
    "comp:done": "node scripts/mark-done.js",
    "comp:report": "node scripts/report.js",
    "comp:summary": "node scripts/monorepo-summary.js"
  }
}
```

使用：

```bash
npm run comp:init -- --component pep-button
npm run comp:next -- --component pep-button --save
npm run comp:done -- --component pep-button --feature-id 1
npm run comp:summary
```

### 与CI/CD集成

创建 `.github/workflows/component-progress.yml`:

```yaml
name: Component Progress Report

on:
  schedule:
    - cron: '0 0 * * 1'  # 每周一生成报告
  workflow_dispatch:

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Generate Progress Report
        run: |
          node scripts/monorepo-summary.js \
            --format html \
            --output weekly-progress.html
      
      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: progress-report
          path: weekly-progress.html
```

## 团队协作示例

### 场景：10人团队，100个组件

**分工**:
- 每人负责10个组件
- 独立分支开发
- 每周合并review

**工作流**:

```bash
# 张三（负责表单组件）
pep-init --component pep-input
pep-init --component pep-textarea
pep-init --component pep-select
# ...10个组件

# 每天选一个组件开发
pep-next --component pep-input --save
# 开发...
pep-done --component pep-input --feature-id 1

# 李四（负责反馈组件）
pep-init --component pep-toast
pep-init --component pep-modal
pep-init --component pep-alert
# ...

# 项目经理（每周查看全局进度）
pep-summary --format html --output team-progress.html
# 在周会上分享报告
```

## 总结

这套工具完美适配您的`pep-components-svelte`项目：

✅ **支持pnpm workspace结构**
✅ **每个组件独立管理**
✅ **适合多人协作**
✅ **支持独立分支开发**
✅ **全局进度一目了然**

**立即开始**：

```bash
cd /path/to/pep-components-svelte
node scripts/init-component.js \
  --component pep-button
```

祝开发顺利！🚀

