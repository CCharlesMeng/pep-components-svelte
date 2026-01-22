# 快速开始 - 10分钟上手

本指南将在10分钟内带你完成第一个功能的开发。

## 步骤 1: 安装检查 (1分钟)

确保你有以下工具：

```bash
# 检查Python版本（需要3.8+）
python3 --version

# 检查Git
git --version

# 检查Cursor
which cursor  # 或者确认Cursor已安装
```

## 步骤 2: 创建示例项目 (2分钟)

```bash
# 创建项目目录
mkdir my-todo-app
cd my-todo-app

# 创建项目规格文件
cat > spec.md << 'EOF'
# 待办事项应用

## 概述
一个简单的待办事项管理应用，帮助用户管理日常任务。

## 技术栈
- Frontend: React 18 + Vite
- Styling: Tailwind CSS
- State: React Hooks
- Storage: LocalStorage

## 核心功能

### 1. 任务管理
- 添加新任务（标题+描述）
- 标记任务完成/未完成
- 删除任务
- 编辑任务内容

### 2. 任务组织
- 按状态筛选（全部/进行中/已完成）
- 按优先级排序（高/中/低）
- 搜索任务

### 3. 持久化
- 数据保存到LocalStorage
- 页面刷新后数据保留
- 导入/导出数据（JSON）

### 4. 用户体验
- 响应式设计（移动端友好）
- 深色/浅色主题切换
- 键盘快捷键支持
- 任务统计显示

## UI要求
- 简洁现代的界面
- 流畅的动画过渡
- 清晰的视觉反馈
- 无障碍支持
EOF

echo "✅ 项目规格已创建"
```

## 步骤 3: 初始化项目 (2分钟)

```bash
# 运行初始化脚本
python3 /path/to/cursor-autonomous-coding/scripts/init-project.js \
  --spec spec.md \
  --features 30

# 你会看到：
# ✓ 功能清单已生成: features.json
# ✓ 会话目录创建成功
# ✓ 进度文档创建成功
# ✓ Git仓库初始化成功

echo "✅ 项目初始化完成"
```

## 步骤 4: 查看第一个任务 (1分钟)

```bash
# 获取第一个任务并保存
python3 /path/to/cursor-autonomous-coding/scripts/next-task.js --save

# 输出会显示类似：
# ╔══════════════════════════════════════════╗
# ║ Next Task: Feature #1                    ║
# ╠══════════════════════════════════════════╣
# ║ Title: 项目初始化和依赖管理                 ║
# ║ Priority: critical | Category: infrastructure ║
# ╚══════════════════════════════════════════╝
# 
# [详细的任务描述和开发指南...]

echo "✅ 任务详情已保存到 .cursor-session/current-task.md"
```

## 步骤 5: 在Cursor中开发 (3分钟)

### 方式1: 使用Composer（推荐）

```bash
# 在Cursor中打开项目
cursor .

# 然后：
# 1. Cmd/Ctrl + Shift + I 打开Composer
# 2. 输入: @.cursor-session/current-task.md 请帮我完成这个任务
# 3. AI会开始生成代码
# 4. 审查并接受更改
```

### 方式2: 手动开发

```bash
# 创建基础结构
mkdir -p src/components src/styles
touch src/App.jsx src/main.jsx

# 创建package.json
npm init -y

# 安装依赖
npm install react react-dom
npm install -D vite @vitejs/plugin-react tailwindcss

# 然后开始编码...
```

## 步骤 6: 测试和提交 (1分钟)

```bash
# 启动开发服务器
npm run dev

# 在浏览器中测试
# 访问 http://localhost:5173

# 如果一切正常，提交代码
git add .
git commit -m "feat: 项目初始化和依赖管理 (#1)

- 创建React + Vite项目结构
- 安装核心依赖
- 配置Tailwind CSS
- 验证开发服务器正常运行

所有验收标准已满足"

echo "✅ 代码已提交"
```

## 步骤 7: 标记完成 (30秒)

```bash
# 标记功能完成
python3 /path/to/cursor-autonomous-coding/scripts/mark-done.js \
  --feature-id 1 \
  --tested

# 输出：
# ✅ 完成标记成功！
# 当前进度: 1/30 (3.3%)

echo "✅ 功能 #1 已完成"
```

## 步骤 8: 查看进度 (30秒)

```bash
# 生成进度报告
python3 /path/to/cursor-autonomous-coding/scripts/report.js

# 你会看到漂亮的进度统计：
# ╔══════════════════════════════════════════╗
# ║ 📊 项目进度报告                           ║
# ╠══════════════════════════════════════════╣
# ║ 总功能数: 30                              ║
# ║ 已完成: 1 (3.3%)                          ║
# ║ 待开始: 29                                ║
# ║ [███░░░░░░░░░...] 3.3%                    ║
# ╚══════════════════════════════════════════╝
```

## 步骤 9: 继续下一个功能

```bash
# 获取下一个任务
python3 /path/to/cursor-autonomous-coding/scripts/next-task.js --save

# 重复步骤 5-8
```

---

## 🎉 恭喜！

你已经完成了第一个功能的完整开发周期！

### 接下来做什么？

1. **继续开发**：重复上述流程完成更多功能
2. **阅读详细文档**：查看 [USAGE_GUIDE.md](./USAGE_GUIDE.md)
3. **自定义工作流**：根据你的需求调整流程
4. **探索高级功能**：查看所有脚本的选项

### 有用的命令速查

```bash
# 查看下一个任务
node scripts/next-task.js

# 查看接下来5个任务
node scripts/next-task.js --count 5

# 只看高优先级任务
node scripts/next-task.js --priority high

# 标记功能完成
node scripts/mark-done.js --feature-id <ID>

# 查看进度
node scripts/report.js

# 生成HTML报告
node scripts/report.js --format html --output report.html

# 验证功能清单
node scripts/validate.js

# 自动修复问题
node scripts/validate.js --fix
```

### 小技巧

**💡 在 .zshrc 或 .bashrc 中添加别名**：

```bash
# 添加到 ~/.zshrc 或 ~/.bashrc
alias cac-next="python3 /path/to/cursor-autonomous-coding/scripts/next-task.js --save"
alias cac-done="python3 /path/to/cursor-autonomous-coding/scripts/mark-done.js"
alias cac-report="python3 /path/to/cursor-autonomous-coding/scripts/report.js"
alias cac-validate="python3 /path/to/cursor-autonomous-coding/scripts/validate.js"

# 然后就可以这样用：
# cac-next
# cac-done --feature-id 5
# cac-report
```

**💡 在Cursor中设置.cursorrules**：

创建 `.cursorrules` 文件：

```
项目使用Cursor自主编码流程管理。

开始新功能前：
1. 运行 `node scripts/next-task.js --save`
2. 查看 .cursor-session/current-task.md
3. 理解所有验收标准
4. 询问我任何不清楚的地方

开发时：
- 严格遵循验收标准
- 每个功能独立提交
- 保持代码质量
- 及时更新文档

完成后：
1. 测试所有验收标准
2. 提交代码
3. 运行 `node scripts/mark-done.js --feature-id <id>`
```

---

## 常见问题速答

**Q: 脚本路径太长，每次都要写很麻烦？**

A: 创建符号链接：
```bash
cd your-project
ln -s /path/to/cursor-autonomous-coding/scripts ./scripts
# 然后就可以：node scripts/next-task.js
```

**Q: 可以直接修改features.json吗？**

A: 可以！修改后运行 `node scripts/validate.js` 确保没问题。

**Q: 功能太大怎么办？**

A: 在features.json中把它分解成多个小功能，设置好依赖关系。

**Q: 可以跳过某些功能吗？**

A: 可以，使用 `--priority` 或 `--category` 参数过滤任务。

---

## 需要帮助？

- 📖 详细文档：[USAGE_GUIDE.md](./USAGE_GUIDE.md)
- 📋 主README：[README.md](./README.md)
- 🐛 问题反馈：创建Issue或直接联系

**开始你的高效开发之旅吧！** 🚀

