# PEP 组件 AI-First 开发流程

一套为 Cursor IDE 设计的 AI 驱动组件开发流程，专为 Monorepo 优化。

## 🚀 快速开始（5分钟）

### 1. 安装 CLI 工具

```bash
# 创建软链接
sudo ln -s $(pwd)/pep-dev /usr/local/bin/pep-dev

# 验证安装
pep-dev help
```

### 2. 开发新组件

```bash
# 创建规格文档
vim components/pep-button/spec.md

# 初始化并生成功能清单
pep-dev init pep-button
pep-dev spec pep-button    # 使用 Cursor AI 生成

# 验证和检查
pep-dev validate pep-button
pep-dev check pep-button

# 开始开发
pep-dev next pep-button --save
# ... 在 Cursor 中开发 ...
pep-dev done pep-button 1 --tested

# 继续下一个
pep-dev next pep-button --save
```

## 📖 核心命令

```bash
pep-dev init <component>       # 初始化组件
pep-dev spec <component>       # 生成 features.json
pep-dev next <component>       # 获取下一个任务
pep-dev done <component> <id>  # 完成任务并归档
pep-dev validate <component>   # 验证功能清单
pep-dev check <component>      # 合规性检查
pep-dev status <component>     # 查看进度
pep-dev summary                # 整体进度
```

## 🎯 核心特性

- **Spec-First** - 从 spec.md 自动生成任务
- **任务归档** - 已完成任务自动归档，清晰的历史记录
- **自动验证** - 技术栈、架构、规范的自动检查
- **统一 CLI** - 简洁强大的命令行界面
- **Monorepo 支持** - 原生支持多组件开发

## 📚 文档导航

### 新手指南
- [快速配置](docs/guides/01-快速配置.md) - 首次使用必读
- [单组件开发](docs/guides/02-单组件开发.md) - 完整开发流程
- [公共逻辑开发](docs/guides/03-公共逻辑开发.md) - Monorepo 公共代码

### 参考文档
- [模板系统说明](docs/reference/模板系统说明.md) - 模板拷贝机制
- [AI-First 工作流](docs/technical/AI-FIRST-WORKFLOW.md) - 详细的工作流程
- [快速参考](docs/quickstart/QUICKSTART.md) - 速查手册

### 完整文档
查看 [文档索引](docs/README.md) 了解所有文档

## 🏗️ 项目结构

```
.ai-workflow/
├── README.md              # 本文件
├── pep-dev                # CLI 工具
├── project-config.json    # 项目配置
├── global-rules.json      # 全局规则
├── requirements.txt       # Python 依赖
├── docs/                  # 文档目录
│   ├── guides/            # 使用指南
│   ├── reference/         # 参考文档
│   ├── technical/         # 技术细节
│   ├── archive/           # 历史文档
│   └── README.md          # 文档索引
├── templates/             # 组件模板
├── scripts/               # Python 脚本
└── prompts/               # AI 提示词
```

## 💡 工作流程

```
1. 编写 spec.md              规格文档
   ↓
2. pep-dev spec             AI 生成任务列表
   ↓
3. pep-dev validate/check   自动验证
   ↓
4. pep-dev next             获取任务
   ↓
5. 在 Cursor 中开发         AI 辅助编码
   ↓
6. pep-dev done             完成并归档
   ↓
7. 重复 4-6                 直到完成
```

## 🎓 设计理念

1. **AI-First** - AI 是第一驱动力，脚本提供后端支持
2. **Spec-Driven** - 规格说明驱动任务生成和开发
3. **State-Aware** - 智能检测状态，避免混乱
4. **Monorepo Friendly** - 原生支持多组件仓库

## 🔗 相关链接

- [Cursor IDE](https://cursor.sh/)
- [项目配置](project-config.json)
- [全局规则](global-rules.json)
- [更新日志](CHANGELOG.md)
- [许可证](LICENSE)

## ❓ 常见问题

### 如何开始？
查看 [快速配置指南](docs/guides/01-快速配置.md)

### 如何开发单个组件？
查看 [单组件开发流程](docs/guides/02-单组件开发.md)

### 命令找不到？
确保已正确安装 `pep-dev` 命令：
```bash
which pep-dev
# 如果没有输出，重新执行安装步骤
```

### 需要更详细的文档？
查看 [完整文档索引](docs/README.md)

---

**版本**: v2.0  
**许可**: MIT  
**维护**: PEP Components Team
