# Demo：pep-cloud-deploy-flow 完整交互对比

## 源码解析结果

Agent 读取以下文件后自动提取的交互场景清单：
- `src/index.svelte` — 拖拽分割线、侧边栏状态
- `src/components/PseudoBrowser.svelte` — 标签页操作、控制按钮
- `src/components/MainPanel.svelte` — 部署按钮、协议勾选

---

## 提取出的交互场景清单

| # | 区域 | 元素/CSS类 | 交互动作 | 触发源 | 预期视觉变化 |
|---|------|-----------|----------|--------|------------|
| 1 | 标签栏 | `.tab-item`（非激活） | 点击 | `onclick → selectTab()` | 背景变为激活色 `#f5f7fa` |
| 2 | 标签栏 | `.tab-item` | hover | CSS `:hover` | `×` 关闭按钮出现（opacity: 0→1） |
| 3 | 标签栏 | `.close-btn` | hover | CSS `.tab-item:hover .close` | 关闭按钮背景 `#b8bdc7`，白色图标 |
| 4 | 标签栏 | `.add-tab` | hover | CSS `:hover` | 背景变 `#c9cdd4` |
| 5 | 控制按钮 | `.close-browser` | hover | CSS `:hover` | 背景变 `#f53f3f`，图标变白（危险色） |
| 6 | 控制按钮 | `.tool-btn` | hover | CSS `:hover` | 背景变 `#c9cdd4` |
| 7 | 地址栏 | `.logo-dot` | 静态 | 初始渲染 | 渐变圆点 `#f53f3f→#ff7d00` |
| 8 | 分割线 | `.resize-handle` | hover | CSS `:hover` | 蓝色高亮 `#94bfff` |
| 9 | 分割线 | `.resize-handle` | mousedown（拖拽中） | CSS `:active` + `$state isDragging` | 深蓝 `#3b82f6`，鼠标变 `col-resize` |
| 10 | 分割线 | `.resize-handle` | 拖拽至不同宽度 | `handleResizeStart → mousemove` | 侧边栏宽度实时变化（300px-640px） |
| 11 | 部署按钮 | `button[disabled]` | 静态 | `!isAgreementChecked` | opacity: 0.45，cursor: not-allowed |
| 12 | 部署按钮 | `button` | 协议勾选后 | `bind:checked → isAgreementChecked` | 正常态，opacity: 1 |
| 13 | 侧边栏 | `collapse-btn` | 点击 | `onCollapse → sidebarState='collapsed'` | 侧边栏宽度变 0，左侧出现 `>` 恢复按钮 |
| 14 | 侧边栏 | `fullscreen-btn` | 点击 | `onFullscreen → sidebarState='fullscreen'` | 侧边栏占满全宽，右侧出现 `<` 恢复按钮 |
| 15 | 恢复按钮 | `.restore-btn` | 点击 | `onclick → sidebarState='normal'` | 恢复双栏布局 |
| 16 | 导航栏-结束部署 | 结束部署按钮 | 点击 | `showEndModal = true` | 确认弹窗出现 |
| 17 | 弹窗 | `EndDeploymentModal` | 确认 | `handleEndConfirm` | 弹窗关闭，`isDeploymentFinished = true` |

---

## 触发 Skill 的用户输入

```
对比设计稿和本地实现的 pep-cloud-deploy-flow 组件，
- 设计稿: https://www.huaweicloud.com/solution/practice/dify.html
- 源码: components/pep-cloud-deploy-flow/src/
- 本地已在 http://localhost:5173 运行
重点看标签栏交互、分割线拖拽、部署按钮状态
```

---

## browser-use 执行的截图序列

### 静态基础截图（8 张）

```
design_full.png          impl_full.png
design_tabbar.png        impl_tabbar.png
design_address.png       impl_address.png
design_main.png          impl_main.png
```

### 交互场景截图（每个场景设计稿 + 实现各 1 张）

**场景 1-3：标签页状态**
```
# 场景1: 点击第2个标签
browser.click(".tab-item:nth-child(2)")
截图 → design_tab_switch.png / impl_tab_switch.png

# 场景2: hover 到标签项
browser.hover(".tab-item:first-child")
截图 → design_tab_hover.png / impl_tab_hover.png
（预期：关闭按钮显现）

# 场景3: hover 到关闭按钮
browser.hover(".pep-cloud-deploy-flow-browser__close")
截图 → design_close_hover.png / impl_close_hover.png
```

**场景 4-6：控制按钮**
```
# 场景4: 关闭按钮 hover（危险红色）
browser.hover(".close-browser")
截图 → impl_closebrowser_hover.png

# 场景5: tool-btn hover
browser.hover(".tool-btn:first-of-type")
截图 → impl_toolbtn_hover.png
```

**场景 7-8：地址栏圆点**
```
# 场景7: 静态截图，重点截 logo-dot 区域（16×16px）
截图 → design_logo_dot.png / impl_logo_dot.png
```

**场景 8-10：分割线**
```
# 场景8: resize-handle hover
browser.hover(".resize-handle")
截图 → impl_resize_hover.png

# 场景9: resize-handle 拖拽中（保持 mousedown）
browser.mousedown(".resize-handle")
截图 → impl_resize_active.png
browser.mouseup()

# 场景10: 拖拽到 500px 宽度
browser.drag(".resize-handle", dx=80)
截图 → impl_resize_dragged.png
```

**场景 11-12：部署按钮**
```
# 场景11: 协议未勾选 → 禁用态
（默认状态直接截图）
截图 → design_deploy_disabled.png / impl_deploy_disabled.png

# 场景12: 勾选协议 → 启用态
browser.click("input[type=checkbox]")
截图 → design_deploy_enabled.png / impl_deploy_enabled.png
```

**场景 13-15：侧边栏状态**
```
# 场景13: 折叠
browser.click("[aria-label='折叠左侧面板']")
截图 → impl_sidebar_collapsed.png

# 场景14: 全屏
browser.click("[aria-label='全屏伪浏览器']")  # 注：onFullscreen 会折叠右侧
截图 → impl_sidebar_fullscreen.png

# 场景15: 从折叠恢复
browser.click(".restore-btn")
截图 → impl_sidebar_restored.png
```

---

## 运行对比脚本

```bash
python .cursor/skills/visual-regression-compare/scripts/compare.py \
  --design-dir screenshots/ \
  --impl-dir screenshots/ \
  --output-dir screenshots/diff/ \
  --report visual-regression-report.md \
  --design-url "https://www.huaweicloud.com/solution/practice/dify.html" \
  --local-url "http://localhost:5173" \
  --side-by-side
```

---

## 预期报告摘要

```markdown
## 差异优先级汇总

| 场景 | 相似度 | 优先级 | 主要问题 |
|------|--------|--------|----------|
| 静态-地址栏圆点 | 30% | 🔴 高 | 设计稿为渐变圆点，实现为华为云 logo |
| 交互-close-browser hover | 65% | 🔴 高 | 设计稿红色背景范围/形状不同 |
| 交互-resize hover | 70% | 🟡 中 | 蓝色宽度/亮度略有差异 |
| 交互-tab 激活态 | 88% | 🟡 中 | 激活背景色 #f5f7fa vs 设计稿 #f0f0f0 |
| 交互-deploy 禁用态 | 92% | 🟢 低 | 透明度基本一致 |
| 静态-整体布局 | 90% | 🟢 低 | 间距微小偏差 |
```

---

## 已知限制

- **iframe 内容**：地址栏中加载的外部 iframe 内容无法对比（跨域）
- **设计稿无法操作**：`https://www.huaweicloud.com/solution/practice/dify.html` 是只读体验页，部分交互（如拖拽）无法在设计稿 URL 上重现，此时用静态参考图代替
- **动画帧**：hover 渐变等 CSS transition 截图时需等待 `transition-duration`（本项目约 200ms）后截图
