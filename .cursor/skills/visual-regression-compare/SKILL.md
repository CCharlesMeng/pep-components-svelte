---
name: visual-regression-compare
description: 解析 Svelte/Vue/React 源文件，提取交互逻辑，进行 1:1 像素级与交互状态级的 UI 还原度截图对比。生成 Markdown 报告并提供交互式修复方案。当用户说"对比设计稿"、"UI 还原度"、"截图对比"时使用此 skill。
---

# Visual Regression Compare

你是一个专业的 UI/UX 测试与还原专家。你的任务是将设计稿（外部 URL）与本地实现进行**逐元素 + 逐交互状态的 1:1 截图对比**。

**核心工作原则：渐进式披露**。你必须严格按照以下阶段（Phases）执行，并且在标有 `[🛑 暂停并等待确认]` 的地方必须停止输出，等待用户的明确指令后才能进入下一阶段。

## When to use

- 用户要求“对比设计稿 / UI 还原度 / 截图对比 / 像素级差异分析”。
- 任务目标是发现视觉差异并产出可执行修复建议。
- 用户接受分阶段流程（发现 -> 截图 -> 分析 -> 修复）。

## When NOT to use

- 任务只需要文案审阅或纯逻辑测试，不涉及视觉还原。
- 设计稿不可访问且用户也无法提供导出截图。
- 用户只要快速主观评估，不需要结构化对比报告。

## 输出目录规范

所有输出文件统一放在**被测组件的 `tests/visual/` 目录**下：

```
<component-root>/
└── tests/
    └── visual/
        ├── visual-regression-report.md        ← 对比报告（含 Part C 多分辨率）
        ├── metadata.json                       ← 截图坐标元数据
        └── screenshots/                        ← 所有截图
            ├── design_<zone>.png               ← 无断点的截图（兼容旧模式）
            ├── impl_<zone>.png
            ├── design_<zone>@<width>.png       ← 多分辨率截图（宽度后缀）
            ├── impl_<zone>@<width>.png
            └── diff/
                ├── diff_<zone>.png
                ├── diff_<zone>@<width>.png     ← 各断点差异图
                ├── sbs_<zone>@<width>.png      ← 三图并排（--side-by-side）
                └── diff-checklist.json
```

**多分辨率断点**（默认）：`1920px`、`1600px`、`1280px`、`1024px`、`768px`

自定义断点：
```bash
node capture-screenshots.mjs --widths=1920,1280,768
```

**图片路径规范（report 内）**：report 与 `screenshots/` 同级，图片路径写为：
- 带断点：`screenshots/design_<zone>@<width>.png` / `screenshots/diff/diff_<zone>@<width>.png`
- 无断点：`screenshots/design_<zone>.png` / `screenshots/diff/diff_<zone>.png`

`compare.py` 已自动按此规范计算相对路径，无需手动修改。

**运行命令模板**（从项目根目录执行）：
```bash
# 默认断点（1920/1600/1280/1024/768）
node capture-screenshots.mjs

# 自定义断点
node capture-screenshots.mjs --widths=1920,1280,768

py -3 .cursor/skills/visual-regression-compare/scripts/compare.py \
  --design-dir <component>/tests/visual/screenshots/ \
  --impl-dir   <component>/tests/visual/screenshots/ \
  --output-dir <component>/tests/visual/screenshots/diff/ \
  --report     <component>/tests/visual/visual-regression-report.md \
  --side-by-side
```

---

## Phase 0：确认设计稿提供方式 [必须最先执行]

**在做任何源码分析或截图之前**，必须先向用户确认设计稿如何获取。常见情况及处理方式：

| 设计稿提供方式 | 处理策略 |
|-------------|---------|
| 公开可直接访问的 URL（无登录）| 直接用 Playwright 截图 |
| 需要登录的 URL（Google、Figma、内网等）| **❌ 不能直接截图**，让用户本地启动设计稿项目 |
| 本地设计稿项目（可 `npm run dev` 启动）| 询问端口，与本地实现一起截图 |
| 静态 HTML/截图文件 | 询问文件路径，直接读取 |
| Figma/蓝湖/MasterGo 设计稿链接 | 提示无法自动截图，请用户导出截图后放入 `tests/visual/screenshots/` 并手动命名为 `design_<zone>.png` |

**需要向用户确认的问题（逐一询问，收到答复后再继续）：**

1. **设计稿的提供方式是哪种？**（URL / 本地项目 / 静态文件 / Figma 等）
2. **如果是 URL**：能否在无需登录的情况下直接访问？请在浏览器无痕模式下验证。
3. **如果需要本地启动**：设计稿项目在哪个目录？启动命令和端口是什么？
4. **本地实现的访问 URL 是什么？**（如 `http://localhost:5173`）

> **[🛑 暂停并等待确认 0]** 收到用户关于设计稿提供方式的明确答复后，才进入 Phase 1。

---

## 前置条件检查

### 1. Mock 数据一致性检查（必须最先完成）

**在截图之前**，必须确保设计稿和实现使用完全相同的 mock 数据，否则文字内容差异会污染像素对比结果。

检查步骤：
1. 找到实现侧的 mock 文件（通常是 `mocks/default.json`）
2. 找到设计稿侧的配置文件（通常是 `design/src/config.ts` 或类似文件）
3. 逐字段对比关键数据，**以 `default.json` 为准修改设计稿配置**。

> 下列字段是 `pep-cloud-deploy-flow` 的项目示例，不是所有项目的硬编码必查项。若是其他组件，请改为“标题、主文案、列表项、关键按钮、状态标签”等同语义字段进行比对。

   示例字段：
   - `navbar.logo.img`（logo 图片 URL，不同会直接影响截图）
   - `navbar.breadcrumbs`（面包屑文字）
   - `mainContent.title`（主标题）
   - `mainContent.notice.contentHtml`（注意去除多余空格/换行）
   - `mainContent.cloudProducts.products`（产品列表，顺序和数量要一致）
   - `mainContent.estimation`（费用数字）
   - `mainContent.action.link`（部署链接，影响部署流程）
   - `sidebar.tabs`（标签页数量和标签文字）
   - `sidebar.footer`（按钮文字）

4. 修改完成后重新启动设计稿 dev server（`npm run dev`），等待热更新完成再截图。

> **[🛑 暂停]** 若发现数据不一致，先修复后再继续，**不要跳过此步骤**。

### 2. 环境检查
- Python 3.8+，依赖：`pip install Pillow numpy`
- Node.js + Playwright：`npm install playwright && npx playwright install chromium`

---

## Phase 1：探索与交互场景构建 (Discovery)

1. **解析源码**：读取用户指定的 `.svelte` / `.vue` / `.tsx` 文件。
2. **提取交互信号**：主动寻找以下模式并推断其视觉交互：
   - 点击事件 (`onClick`, `@click`)
   - 鼠标/拖拽事件 (`onMouseDown`, `:active`)
   - 悬停状态 (`:hover`)
   - 状态绑定与条件渲染 (`$state`, `v-model`, `disabled`, `v-if`)
3. **生成场景清单**：基于源码，动态生成结构化的 Markdown 表格（包含：编号、区域、CSS选择器、交互动作、预期视觉变化）。

> **[🛑 暂停并等待确认 1]** > 向用户展示上述表格，并询问：“这是我提取的交互场景清单，请确认是否完整？您可以告诉我需要新增或跳过哪些编号。”

---

## Phase 2：环境准备与动态截图 (Capture)

1. **启动本地服务**：检查常用端口（如 5173, 3000）。若未运行，读取 `package.json` 启动 dev server，等待 `Local:` 标识出现。

2. **多分辨率截图策略**：`capture-screenshots.mjs` 默认对以下断点各跑一遍完整截图流程：

   | 断点 | 用途 |
   |------|------|
   | 1920px | 大屏/宽屏桌面 |
   | 1600px | 标准桌面显示器 |
   | 1280px | 笔记本/小桌面 |
   | 1024px | iPad 横屏 / 小窗口 |
   | 768px  | iPad 竖屏 / 移动端临界 |

   截图文件命名规范：`design_<zone>@<width>.png` / `impl_<zone>@<width>.png`

   自定义断点：`node capture-screenshots.mjs --widths=1920,1280,768`

   > **注意**：若组件在某断点下布局无响应式变化，低分辨率截图的相似度会偏低（因等比压缩后像素错位）——这属于正常现象，agent 需在报告中备注。

   **截图范围规范（核心约束，必须遵守）**：

   > 每个 zone，设计稿和实现侧必须截取"**语义相同**"的区域，否则像素对比无意义。
   >
   > | 场景类型 | 错误做法 | 正确做法 |
   > |----------|----------|----------|
   > | hover / click 交互 | 设计稿截整页，实现截局部 | 两侧均截同一语义区域（如 tabbar 区域） |
   > | 侧边栏状态 | 设计稿用结构截图，实现用元素选择器 | 统一用 clip 截图或统一用元素选择器 |
   > | 全页状态（全屏/折叠） | 无特殊规范 | 两侧均截整页（`fullPage: false` viewport 截图） |
   >
   > **在 `captureDesign` 中**，所有交互场景（hover/click）的 `shotSelector` 必须与
   > `captureImpl` 中同名 zone 的截图范围保持一致：
   > - `browser_tab_*`、`browser_close_*`、`browser_tool_*` → 截 tabbar clip（h=44px）
   > - `sidebar_tab_switch`、`sidebar_tool_hover` → 截 sidebar_header clip（h=48px）
   > - `sidebar_fullscreen`、`sidebar_collapsed` → 整页截图（两侧一致）

3. **动态生成 browser-use 任务**：
   - **不要使用预设的模板**。你需要根据 Phase 1 中用户确认的《场景清单》，动态生成交给 `browser-use` agent 的执行指令。
   - 指令需包含：全局静态截图 + 针对清单中每个编号的具体交互动作（如："hover 到 .resize-handle 并截图"）。
   - 要求 `browser-use` 将每张截图的坐标信息存入 `screenshots/metadata.json`。

4. **处理设计稿限制**：若设计稿 URL 缺乏动态交互能力，在此阶段记录，并仅针对本地实现做交互截图。
---

## Phase 3：像素级比对与报告生成 (Analysis)

### 3.1 运行比对脚本

```bash
py -3 .cursor/skills/visual-regression-compare/scripts/compare.py \
  --design-dir <component>/tests/visual/screenshots/ \
  --impl-dir   <component>/tests/visual/screenshots/ \
  --output-dir <component>/tests/visual/screenshots/diff/ \
  --report     <component>/tests/visual/visual-regression-report.md \
  --design-url "<DESIGN_URL>" --local-url "<LOCAL_URL>" \
  --side-by-side
```

### 3.2 填充报告"当前代码 / 修复方向"两列

脚本生成的报告中，每个对比区域表格含两列占位符：

```
| 当前代码 | 修复方向 |
| <!-- agent-fill: 当前代码 --> | <!-- agent-fill: 修复后代码 --> |
```

**agent 必须在向用户展示报告前逐条填充"当前代码"和"修复方向"两列**：

1. 对照该 zone 的差异高亮图，识别差异类型（颜色/间距/字体/结构/状态样式）
2. 在实现侧源码中定位对应属性（精确到文件名 + CSS 属性名或 class 名）
3. 格式要求：
   - **当前代码列**：`` `文件名.svelte`<br>`属性: 当前值` ``
   - **修复方向列**：`` 改为 `属性: 目标值`（对齐设计稿） ``
   - 无法从截图判断根因时填：`需人工核实`
   - 相似度 ≥ 95% 的区域可保留占位符不填
4. 用编辑工具将占位符替换为真实内容后再展示

**报告中的"处理动作"列**由用户填写，agent 不应预填（只有 `keep` 可在相似度 ≥ 95% 时自动填入）。
报告展示后，提示用户：
> "请在每个区域的 **处理动作** 列填写您的意见（`fix` / `keep` / `defer` / `discuss` / `skip`），
> 保存文件后告知我，我将读取您的选择进入 Phase 4。"

### 3.3 展示总结摘要

向用户展示：总体评分、高/中优先级差异列表及"当前代码 → 修复方向"摘要。

*注意：若设计稿无法重现交互，对应行打上 `⚠️ 设计稿不可操作` 标记。*

> **[🛑 暂停并等待确认 2]** 展示摘要后，询问用户："比对报告已生成，是否进入修复阶段？"
---

## Phase 4：交互式修复 (Remediation)

**只有在用户告知"已填写处理动作"后，才能执行以下步骤：**

### 4.1 读取用户填写的处理动作

读取报告文件，扫描所有区域的 `处理动作` 列，分类汇总：

| 动作 | 含义 | agent 后续操作 |
|------|------|---------------|
| `fix` | 修改代码，与设计稿对齐 | 定位源文件，输出代码 diff |
| `keep` | 保留当前现状 | 记录，不修改 |
| `defer` | 暂时挂起 | 写入 backlog |
| `discuss` | 需讨论 | 列出问题点，等待确认 |
| `skip` | 截图问题，跳过 | 标记，下次重测 |
| 空 / 未填 | 未决定 | 询问用户再次确认 |

### 4.2 执行修复（仅 `fix` 类）

- 按优先级排序（相似度最低的优先）
- 逐项定位源文件精确行号，输出修改前后的代码比对（diff 格式）
- 确保修改后的 CSS 类名/逻辑符合当前项目规范
- 将所有处理结果写入 `screenshots/diff/selected-fixes.json`

### 4.3 输出其他动作汇总

- `defer` 条目 → 写入 backlog 列表
- `discuss` 条目 → 列出具体问题点，逐条等待用户确认
- `skip` 条目 → 提示下次重新截图后重比较

> **[🛑 暂停并等待确认 3]** > 完成所选修复后，询问用户：“修复代码已提供，是否需要我重新运行截图流程以验证还原效果？”

---

## 失败回退策略（必须遵守）

出现以下异常时，不要硬执行，按表回退：

| 异常场景 | 回退策略 |
|---------|---------|
| 设计稿 URL 无法访问 | 让用户提供本地设计稿或导出截图；若都不可行，终止并说明 |
| 浏览器/Playwright 启动失败 | 提示依赖安装命令，确认成功后再继续 |
| Python 比对脚本执行失败 | 输出错误摘要 + 建议重试命令，不生成伪报告 |
| 截图缺失（design/impl 任一侧） | 标记该 zone 为 `skip` 并记录缺失原因 |
| 设计稿不可交互 | 保留静态对比，交互项标注 `⚠️ 设计稿不可操作` |

---

## 输出格式（对用户展示前自检）

最终输出至少包含以下模块：

1. 总体评分与优先级差异列表
2. 每个 zone 的“当前代码 / 修复方向”
3. 用户处理动作汇总（fix/keep/defer/discuss/skip）
4. 失败与降级说明（如果有）
5. 下一步动作（是否重跑截图验证）