# PEP 组件开发流程 - 文档索引

完整的文档导航和索引。

## 📖 按角色导航

### 🎯 新手入门
如果你是第一次使用，按顺序阅读：

1. [快速配置](guides/01-快速配置.md) ⭐ 必读
   - 安装 pep-dev 命令
   - 基础配置
   - 验证安装

2. [单组件开发](guides/02-单组件开发.md) ⭐ 核心流程
   - 完整的开发流程
   - 从 spec.md 到完成
   - 最佳实践

3. [快速参考](quickstart/QUICKSTART.md)
   - 常用命令速查
   - 工作流速查

### 🔧 Monorepo 开发者

- [公共逻辑开发](guides/03-公共逻辑开发.md)
  - 开发公共工具包
  - 开发公共样式
  - 全局配置管理

- [Monorepo 示例](examples/EXAMPLE_MONOREPO_SETUP.md)
  - 完整的 Monorepo 配置示例

### 📚 深度理解

- [AI-First 工作流详解](technical/AI-FIRST-WORKFLOW.md)
  - 设计理念和架构
  - AI vs 脚本职责
  - 与 Claude Autonomous Coding 对比
  - 完整场景演示

- [架构说明](technical/ARCHITECTURE.md)
  - 系统架构
  - 技术选型
  - 扩展指南

- [工作流对比](technical/WORKFLOW_COMPARISON.md)
  - 与其他工作流的对比
  - 优势分析

### 🔍 参考资料

- [模板系统说明](reference/模板系统说明.md)
  - 模板拷贝机制
  - 占位符规则
  - 模板维护

- [spec.md 示例](examples/example-spec.md)
  - 规格文档模板
  - 最佳实践

## 📋 按主题导航

### 安装和配置
- [快速配置](guides/01-快速配置.md)
- [快速参考](quickstart/QUICKSTART.md)

### 开发流程
- [单组件开发](guides/02-单组件开发.md)
- [公共逻辑开发](guides/03-公共逻辑开发.md)
- [Monorepo 示例](examples/EXAMPLE_MONOREPO_SETUP.md)

### 技术细节
- [AI-First 工作流](technical/AI-FIRST-WORKFLOW.md)
- [架构说明](technical/ARCHITECTURE.md)
- [模板系统](reference/模板系统说明.md)

### 示例和模板
- [spec.md 示例](examples/example-spec.md)
- [Monorepo 配置示例](examples/EXAMPLE_MONOREPO_SETUP.md)

## 🗂️ 完整文档列表

### guides/ - 使用指南
```
guides/
├── 01-快速配置.md              ⭐ 首次使用
├── 02-单组件开发.md            ⭐ 核心流程
└── 03-公共逻辑开发.md          Monorepo 进阶
```

### quickstart/ - 快速参考
```
quickstart/
├── QUICKSTART.md              速查手册
└── 新功能快速参考.md          新功能说明
```

### examples/ - 示例
```
examples/
├── example-spec.md            规格文档模板
└── EXAMPLE_MONOREPO_SETUP.md  Monorepo 配置示例
```

### technical/ - 技术文档
```
technical/
├── AI-FIRST-WORKFLOW.md       AI-First 工作流详解
├── ARCHITECTURE.md            架构说明
└── WORKFLOW_COMPARISON.md     工作流对比
```

### reference/ - 参考文档
```
reference/
└── 模板系统说明.md            模板拷贝机制
```

### archive/ - 历史文档
```
archive/
├── 交付清单-AI-First.md       V2.0 交付清单
├── 重构完成清单.md            重构清单
├── V2.0-SUMMARY.md            V2.0 总结
└── UPGRADE_V2.md              V2.0 升级指南
```

## 🔗 外部链接

- [主 README](../README.md) - 项目主页
- [项目配置](../project-config.json) - 项目级配置
- [全局规则](../global-rules.json) - 全局开发规则
- [更新日志](../CHANGELOG.md) - 版本更新记录

## 📝 文档约定

### 重要性标记
- ⭐ - 新手必读
- 🔧 - Monorepo 相关
- 📚 - 深度技术文档
- 🗂️ - 历史归档

### 阅读顺序建议

**完全新手**:
1. [快速配置](guides/01-快速配置.md)
2. [单组件开发](guides/02-单组件开发.md)
3. [快速参考](quickstart/QUICKSTART.md)

**有经验的开发者**:
1. [AI-First 工作流](technical/AI-FIRST-WORKFLOW.md)
2. [单组件开发](guides/02-单组件开发.md)
3. [架构说明](technical/ARCHITECTURE.md)

**Monorepo 团队**:
1. [快速配置](guides/01-快速配置.md)
2. [单组件开发](guides/02-单组件开发.md)
3. [公共逻辑开发](guides/03-公共逻辑开发.md)
4. [Monorepo 示例](examples/EXAMPLE_MONOREPO_SETUP.md)

## 🤝 贡献文档

如果你发现文档有问题或需要改进：

1. 标记问题位置
2. 提出改进建议
3. 提交 PR 或 Issue

## 📮 反馈

文档问题或建议：
- 通过 Issues 反馈
- 联系维护团队

---

**文档版本**: v2.0  
**最后更新**: 2025-01-08
