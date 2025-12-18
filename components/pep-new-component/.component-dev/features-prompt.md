# 任务：为Svelte组件生成功能清单

请为 **pep-new-component** 组件生成 20 个详细的功能点，以JSON格式输出。



## 组件上下文

这是一个Svelte组件，位于pnpm monorepo中。组件应该：
- 可复用、独立
- 遵循Svelte最佳实践
- 支持TypeScript
- 具有良好的可访问性
- 有完整的文档和示例

## 功能分类建议

1. **structure** (5%) - 基础结构
2. **props** (15%) - Props接口和配置
3. **styling** (20%) - 样式和主题
4. **events** (15%) - 事件处理
5. **state** (10%) - 状态管理
6. **variants** (10%) - 样式变体
7. **accessibility** (10%) - 无障碍
8. **documentation** (10%) - 文档
9. **testing** (15%) - 测试

## 输出格式

```json
[
  {
    "id": 1,
    "category": "structure|props|styling|events|state|variants|accessibility|documentation|testing",
    "priority": "critical|high|medium|low",
    "title": "pep-new-component - 简洁的功能标题",
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
  }
]
```

## 要求

1. **功能要细**: 每个功能1-3小时可完成
2. **优先级明确**: 
   - critical: 基础必需功能（2-3个）
   - high: 核心功能（40%）
   - medium: 重要功能（40%）
   - low: 增强功能（20%）
3. **依赖清晰**: 确保依赖关系合理
4. **验收标准具体**: 可测试、可验证

请直接输出JSON数组，不要包含其他解释文字。
