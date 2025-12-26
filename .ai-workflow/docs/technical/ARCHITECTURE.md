# 架构设计文档

## 设计理念

Cursor自主编码流程基于以下核心理念：

### 1. 单一真实来源 (Single Source of Truth)
`features.json` 是整个系统的核心，记录所有功能状态、依赖关系和元数据。所有脚本都围绕这个文件展开。

### 2. 无状态脚本 (Stateless Scripts)
每个脚本都是独立的、无状态的，只依赖文件系统的数据。这使得：
- 易于理解和维护
- 可以单独使用任何脚本
- 易于扩展和定制

### 3. 渐进式增强 (Progressive Enhancement)
基础功能开箱即用，高级功能可选。用户可以：
- 从简单的功能清单开始
- 逐步添加更多细节
- 根据需要扩展功能

### 4. 与Cursor原生集成
充分利用Cursor的AI能力，而不是重新实现：
- 使用Composer进行复杂功能开发
- 使用Chat进行快速问答
- 使用Cmd+K进行代码生成

---

## 系统架构

```
┌─────────────────────────────────────────────────────────┐
│                     用户项目                             │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  features.json (核心数据)                                │
│  cursor-progress.md (进度追踪)                           │
│  spec.md (项目规格)                                       │
│  .cursor-session/ (会话状态)                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│              Cursor自主编码脚本集                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ init_project │  │  next_task   │  │  mark_done   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   report     │  │   validate   │                    │
│  └──────────────┘  └──────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
                        ↕
┌─────────────────────────────────────────────────────────┐
│                    Cursor IDE                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Composer  →  多文件复杂功能开发                          │
│  Chat      →  快速问答和实现细节                          │
│  Cmd+K     →  单文件代码生成                              │
│  Editor    →  手动编码和调整                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 核心组件

### 1. features.json

**职责**: 功能清单的唯一真实来源

**结构**:
```json
[
  {
    "id": 整数,
    "category": "字符串",
    "priority": "critical|high|medium|low",
    "title": "字符串",
    "description": "字符串",
    "acceptance_criteria": ["字符串数组"],
    "estimated_complexity": "low|medium|high",
    "dependencies": [整数数组],
    "status": "pending|in_progress|completed|tested|blocked",
    "completed_at": "ISO日期字符串或null",
    "tested": 布尔值,
    "commit_hash": "字符串或null"
  }
]
```

**操作规则**:
- ✅ 添加新功能
- ✅ 修改pending功能的任何字段
- ✅ 修改已完成功能的status和tested字段
- ⚠️ 谨慎修改已完成功能的其他字段
- ❌ 不删除功能（除非确实需要）
- ❌ 不修改ID

### 2. init_project.py

**职责**: 初始化项目结构

**输入**:
- `--spec`: 项目规格文件路径
- `--features`: 功能数量
- `--ai-assist`: 是否使用AI辅助

**输出**:
- `features.json`: 功能清单
- `cursor-progress.md`: 进度文档
- `.cursor-session/`: 会话目录
- `.gitignore`: Git忽略文件

**算法**:
1. 读取并解析spec.md
2. 提取技术栈信息
3. 生成基础设施功能（固定的前3个）
4. 生成其他功能占位符
5. 创建会话目录和配置
6. 初始化Git仓库

### 3. next_task.py

**职责**: 获取下一个应该完成的任务

**输入**:
- `--count`: 显示任务数量
- `--priority`: 优先级过滤
- `--category`: 类别过滤
- `--format`: 输出格式
- `--save`: 是否保存

**输出**:
- 终端输出或文件

**算法**:
1. 加载features.json
2. 找出所有已完成功能的ID集合
3. 筛选status=pending且依赖都已完成的功能
4. 应用过滤器（priority/category）
5. 按优先级和ID排序
6. 生成详细的任务提示词
7. 输出或保存

**排序规则**:
```python
priority_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
sort_key = (priority_order[priority], id)
```

### 4. mark_done.py

**职责**: 标记功能为已完成

**输入**:
- `--feature-id`: 功能ID
- `--tested`: 是否已测试
- `--commit-hash`: Git提交哈希
- `--notes`: 完成备注

**输出**:
- 更新features.json
- 更新cursor-progress.md
- 更新session-history.json

**算法**:
1. 验证功能ID存在
2. 检查当前状态
3. 获取Git提交哈希（如未提供）
4. 更新功能状态和元数据
5. 保存features.json
6. 更新会话历史
7. 更新进度文档
8. 显示统计信息

### 5. report.py

**职责**: 生成进度报告

**输入**:
- `--format`: terminal/markdown/html/json
- `--output`: 输出文件路径
- `--detailed`: 是否详细模式

**输出**:
- 格式化的报告

**统计指标**:
- 总功能数
- 已完成数和百分比
- 进行中、待开始、已阻塞数量
- 按优先级统计
- 按类别统计
- 按复杂度统计
- 预估剩余工作量

**复杂度时间映射**:
```python
complexity_hours = {
    "low": 2,
    "medium": 4,
    "high": 8
}
```

### 6. validate.py

**职责**: 验证功能清单的正确性

**输入**:
- `--fix`: 自动修复
- `--strict`: 严格模式

**输出**:
- 验证结果和错误列表

**检查项**:

1. **Schema验证**
   - 必需字段完整性
   - 字段类型正确性
   - 枚举值有效性

2. **ID验证**
   - ID唯一性
   - ID连续性（警告）

3. **依赖验证**
   - 依赖存在性
   - 无自我依赖
   - 无循环依赖（DFS检测）

4. **状态一致性**
   - completed状态需要completed_at
   - pending状态不应有completed_at
   - 依赖完成性

5. **内容质量**
   - 标题非空且合理长度
   - 描述非空且合理长度
   - 验收标准存在

**循环依赖检测算法**:
```python
def has_cycle(feature_id, visited, rec_stack):
    visited.add(feature_id)
    rec_stack.add(feature_id)
    
    for dep_id in feature.dependencies:
        if dep_id not in visited:
            if has_cycle(dep_id, visited, rec_stack):
                return True
        elif dep_id in rec_stack:
            return True
    
    rec_stack.remove(feature_id)
    return False
```

---

## 数据流

### 初始化流程

```
用户编写spec.md
       ↓
运行 init_project.py
       ↓
生成 features.json (模板或AI生成)
       ↓
用户完善 features.json
       ↓
运行 validate.py 确保正确
       ↓
提交到Git
```

### 开发迭代流程

```
运行 next_task.py
       ↓
获取任务提示词
       ↓
在Cursor中开发
       ↓
测试验证
       ↓
Git提交
       ↓
运行 mark_done.py
       ↓
更新 features.json
       ↓
更新 cursor-progress.md
       ↓
运行 report.py 查看进度
       ↓
循环到下一个任务
```

### 会话状态流

```
.cursor-session/
├── config.json          (会话配置，不变)
├── current-task.md      (当前任务，每次next_task更新)
└── session-history.json (历史记录，每次mark_done追加)
```

---

## 扩展点

### 1. 自定义验证规则

在 `validate.py` 中添加新的验证函数：

```python
def validate_custom_rule(features):
    """自定义验证规则"""
    errors = []
    # 你的验证逻辑
    return errors

# 在main函数中调用
all_errors.extend(validate_custom_rule(features))
```

### 2. 自定义报告格式

在 `report.py` 中添加新的生成函数：

```python
def generate_custom_report(features, stats):
    """生成自定义格式报告"""
    # 你的报告逻辑
    return report_string
```

### 3. 集成外部工具

创建新脚本集成外部服务：

```python
# scripts/sync_jira.py
def sync_to_jira(features):
    """同步到JIRA"""
    for feature in features:
        if feature['status'] == 'pending':
            create_jira_issue(feature)

# scripts/export_notion.py
def export_to_notion(features):
    """导出到Notion"""
    # 使用Notion API
```

### 4. 添加钩子系统

```python
# scripts/hooks.py
HOOKS = {
    'pre_mark_done': [],
    'post_mark_done': [],
    'pre_next_task': [],
    'post_next_task': [],
}

def register_hook(event, func):
    HOOKS[event].append(func)

def run_hooks(event, **kwargs):
    for func in HOOKS[event]:
        func(**kwargs)

# 使用
register_hook('post_mark_done', send_slack_notification)
```

---

## 性能考虑

### 当前实现
- 所有操作都是文件读写，性能瓶颈在磁盘I/O
- 对于<1000个功能的项目，性能非常好
- 对于>1000个功能的项目，可能需要优化

### 优化方向

1. **缓存**
```python
# 添加简单的内存缓存
_cache = {}

def load_features_cached(project_dir):
    cache_key = str(project_dir)
    if cache_key in _cache:
        return _cache[cache_key]
    
    features = load_features(project_dir)
    _cache[cache_key] = features
    return features
```

2. **索引**
```python
# 创建ID索引加速查找
def build_index(features):
    return {f['id']: f for f in features}

feature_index = build_index(features)
feature = feature_index[feature_id]  # O(1) 查找
```

3. **增量更新**
```python
# 只更新变更的部分而不是整个文件
def update_feature(project_dir, feature_id, updates):
    features = load_features(project_dir)
    feature = next(f for f in features if f['id'] == feature_id)
    feature.update(updates)
    save_features(project_dir, features)
```

---

## 安全考虑

### 1. 输入验证
所有用户输入都应验证：
- 文件路径：检查是否在项目目录内
- JSON数据：验证schema
- 命令行参数：类型和范围检查

### 2. 文件操作
- 使用绝对路径避免路径遍历
- 检查文件权限
- 原子性写入（写临时文件再重命名）

### 3. Git操作
- 检查Git命令执行结果
- 捕获异常避免崩溃
- 不执行用户提供的Git命令

---

## 测试策略

### 单元测试
```python
# tests/test_validate.py
def test_validate_schema():
    features = [
        {"id": 1, "title": "Test", "status": "pending"}
    ]
    errors = validate_schema(features)
    assert len(errors) == 0

def test_detect_cycle():
    features = [
        {"id": 1, "dependencies": [2]},
        {"id": 2, "dependencies": [1]}
    ]
    errors = validate_dependencies(features)
    assert any("循环依赖" in e.message for e in errors)
```

### 集成测试
```python
# tests/test_integration.py
def test_full_workflow(tmp_path):
    # 1. 初始化
    spec = tmp_path / "spec.md"
    spec.write_text("# Test Project")
    
    init_project(spec, project_dir=tmp_path)
    
    # 2. 获取任务
    task = next_task(tmp_path)
    assert task is not None
    
    # 3. 标记完成
    mark_done(tmp_path, task['id'])
    
    # 4. 验证
    features = load_features(tmp_path)
    feature = next(f for f in features if f['id'] == task['id'])
    assert feature['status'] == 'completed'
```

---

## 未来改进

### v1.1
- [ ] 添加配置文件支持（.cacrc）
- [ ] 支持功能模板
- [ ] 添加批量操作命令
- [ ] 改进错误提示

### v1.2
- [ ] Web UI界面
- [ ] 实时协作支持
- [ ] 云端同步
- [ ] 移动端应用

### v2.0
- [ ] 重写为TypeScript
- [ ] 插件系统
- [ ] 工作流引擎
- [ ] AI增强功能

---

## 贡献指南

欢迎贡献！请遵循：

1. **代码风格**：遵循PEP 8
2. **提交信息**：使用Conventional Commits
3. **测试**：添加相应测试
4. **文档**：更新相关文档

提交PR前：
```bash
# 运行测试
python -m pytest

# 代码检查
flake8 scripts/
black scripts/

# 类型检查
mypy scripts/
```

---

这份架构文档描述了系统的设计理念、组件交互和扩展方式。如有问题，欢迎提Issue讨论。

