# Skills Changelog

## 2026-01-08

### 新增 @pep-init skill

基于 `/pep-start` command 创建了一个简化的非交互式 skill：`@pep-init`

**主要特性**：
- ✅ 无需交互，直接执行
- ✅ 自动创建组件基础框架
- ✅ 使用标准模板（minimal 模式）
- ✅ 适合 AI IDE 自动调用

**文件**：
- `.cursor/skills/pep-init.md` - skill 定义
- `.cursor/skills/README.md` - skills 目录说明

**与 pep-start 的区别**：
| 特性 | pep-start | pep-init |
|------|-----------|----------|
| 类型 | Command | Skill |
| 交互 | 多轮对话 | 无交互 |
| 模式 | 3种可选 | 仅标准模板 |
| 适用 | 手动使用 | AI自动调用 |

**使用方式**：
```
@pep-init pep-button
@pep-init pep-common-card
```

**技术实现**：
- 调用 `scripts/scaffold_component.py` 脚本
- 使用 `--mode minimal` 参数
- 自动处理占位符替换
- 生成所有必需的文件和目录

**后续步骤**：
组件初始化后，可以依次使用：
1. `/pep-spec <component-name>` - 完善需求规格
2. `/pep-plan <component-name>` - 生成开发任务
3. `/pep-next <component-name>` - 开始开发
