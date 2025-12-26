# 功能开发任务 #{feature_id}

## 📊 项目进度

- **总功能数**: {total_features}
- **已完成**: {completed_features} ({completion_percentage}%)
- **当前功能**: #{feature_id} / {total_features}

---

## 🎯 功能详情

**标题**: {feature_title}

**类别**: `{feature_category}`  
**优先级**: `{feature_priority}`  
**复杂度**: `{feature_complexity}`

### 功能描述

{feature_description}

### 验收标准

{acceptance_criteria}

### 依赖关系

{dependencies}

---

## 💡 开发指南

### 1. 理解需求
- 仔细阅读功能描述和验收标准
- 查看依赖功能的实现方式
- 明确功能边界和预期行为

### 2. 实现步骤

#### 核心代码
- 创建必要的文件和目录
- 实现核心功能逻辑
- 添加错误处理
- 编写注释和文档字符串

#### 测试验证
- 编写单元测试（如适用）
- 手动测试核心流程
- 验证边界情况
- 检查错误处理

#### 代码质量
- 运行linter检查
- 修复任何警告
- 确保代码风格一致
- 优化性能（如需要）

#### 文档更新
- 更新相关文档
- 添加使用示例
- 更新API文档（如适用）

### 3. 验证清单

在标记功能完成前，请确认：

- [ ] 所有验收标准都已满足
- [ ] 代码通过linter检查，无警告
- [ ] 功能已手动测试，工作正常
- [ ] 边界情况和错误处理已验证
- [ ] 相关文档已更新
- [ ] 代码已格式化，符合项目规范
- [ ] 没有引入新的依赖（或已记录）
- [ ] 提交信息清晰描述变更

---

## 🚀 完成流程

### 1. 实现功能
在Cursor中使用Composer或Chat完成开发

### 2. 本地测试
```bash
# 根据项目类型运行测试
# 例如：npm test, python -m pytest, etc.
```

### 3. 提交代码
```bash
git add .
git commit -m "feat: {feature_title} (#{feature_id})"
```

### 4. 标记完成
```bash
python cursor-autonomous-coding/scripts/mark_done.py --feature-id {feature_id}
```

---

## 📝 注意事项

- **专注**: 只实现当前功能，不要过度设计
- **质量**: 确保代码质量高于完成速度
- **测试**: 彻底测试后再标记完成
- **文档**: 保持文档与代码同步
- **提交**: 每个功能独立提交

---

## 🔗 相关资源

- 项目规格: `spec.md`
- 功能清单: `features.json`
- 进度追踪: `cursor-progress.md`

---

**开始时间**: {current_time}

祝编码愉快！🎉

