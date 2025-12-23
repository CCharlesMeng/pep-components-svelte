# pep-common-card-v2 组件规格说明 (Spec)

## 1. 组件概述
- **名称与用途**：通用卡片楼层组件 v2 (`pep-common-card-v2`)。主要用于展示产品推荐、功能特性或关联资源。支持多页签 (Tab) 切换、多种卡片布局样式 (居左/居中/产品推荐) 以及丰富的交互配置。
- **源 URL 和 DOM 路径**：
  - URL: [https://www.huaweicloud.com/product/sms.html](https://www.huaweicloud.com/product/sms.html)
  - DOM 路径: 页面底部“您可能感兴趣的产品”楼层 (ID: `section-8`)。

## 2. 功能与行为
- **核心功能**：
  - **楼层头部**：支持标题与富文本副标题展示，可选配置“更多”链接。
  - **页签切换**：支持 1~N 个页签。当页签数 > 1 时展示 Tab 导航条；点击 Tab 切换下方卡片列表。
  - **响应式布局**：
    - PC 端支持一行 2, 3, 4, 5 列卡片配置。
    - 移动端支持整体隐藏配置。
    - 移动端页签内容支持“上下布局”或“左右布局”切换。
  - **卡片渲染**：
    - 支持图标展示，可配置不同高度（80/60/48px）。
    - 支持重点文案（Keywords）数组展示（建议两列布局使用）。
    - 支持标签（Tags）展示。
    - 支持多按钮组（Button Groups）配置。
  - **逻辑能力**：
    - **倒计时隐藏**：配置 `endTime` 后，卡片支持倒计时展示，并在过期后自动逻辑隐藏。
    - **间距管理**：支持开启/关闭楼层顶部与底部间距。

## 3. 可配置项 (Props)

### 3.1 楼层基础配置
| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | string | - | 楼层标题 |
| titleMb | string | - | 移动端楼层标题 |
| subtitle | string (richtext) | - | 楼层副标题 |
| theme | enum | `white` | 背景色 (`white`: 白色, `grey`: 灰色) |
| cardType | enum | `center` | PC端样式 (`left`: 居左, `center`: 居中, `product`: 产品推荐卡片) |
| cardColumn | enum | `3` | PC端卡片列数 (2, 3, 4, 5) |
| isMergeTopSpacing | boolean | `true` | 是否合并顶部间距 |
| isMergeBottomSpacing | boolean | `true` | 是否合并底部间距 |
| isShowMb | boolean | `false` | 移动端是否展示该楼层 |

### 3.2 页签配置 (tabList)
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | Tab 标题 |
| layoutMb | enum | 移动端布局 (`upDownLayout`: 上下, `leftRightLayout`: 左右) |
| cards.products | array | 卡片列表数据 |

### 3.3 卡片配置 (products items)
| 字段 | 类型 | 说明 |
|------|------|------|
| title | string | 卡片标题 |
| desc | string (richtext) | 卡片描述 |
| icon | string (url) | PC 端图标 |
| iconMb | string (url) | 移动端图标 |
| endTime | string | 倒计时结束时间 (格式: YYYY/MM/DD HH:mm) |
| href | string (url) | 整体跳转链接 |
| btnGroups | array | 按钮组 (最多2个) |
| keywords | array | 重点文案 (最多2个) |

## 4. 样式与设计规范
- **设计 Token**：
  - **背景色**：白色 (#FFFFFF) 或 浅灰色 (#F5F5F5)。
  - **图标高度**：80px/60px/48px 保持纵横比。
  - **间距**：楼层上下间距遵循标准栅格系统，移动端支持合并间距。
- **响应式行为**：
  - PC 端 4 列以上自动开启滚动或折行展示（取决于具体实现）。
  - 移动端默认隐藏，若开启则根据 `layoutMb` 调整卡片内元素排列。

## 5. 示例数据 (基于 data.json)
```json
{
  "title": "<p>您可能感兴趣的产品</p>",
  "theme": "grey",
  "cardType": "product",
  "tabList": [
    {
      "title": "精选推荐",
      "cards": {
        "products": [
          {
            "title": "迁移中心 MgC",
            "desc": "<p>一站式迁移和现代化平台</p>",
            "href": "https://www.huaweicloud.com/product/mgc.html",
            "icon": "https://res-static.hc-cdn.cn/..."
          }
        ]
      }
    }
  ]
}
```

## 6. 测试与验收标准
- **功能验收**：
  - [ ] 多页签切换：点击不同 Tab，下方内容应即时更新。
  - [ ] 倒计时隐藏：手动修改 `endTime` 为过去时间，确认卡片是否消失。
  - [ ] 链接跳转：卡片整体及按钮组链接点击应正确跳转。
- **UI 还原**：
  - [ ] 卡片列数：PC 端切换 2/3/4/5 列，布局应正确适配。
  - [ ] 移动端布局：切换 `layoutMb` 确认上下/左右布局视觉正确。

## 7. 边界情况与风险
- **内容超长**：标题建议 1 行，描述建议不超过 2 行，否则可能破坏栅格对齐。
- **时间格式**：`endTime` 格式必须符合 `YYYY/MM/DD HH:mm`，否则可能导致解析失败或隐藏逻辑异常。

## 8. 备注
- **推断说明**：`tabList` 如果只有一个元素，根据 Schema 描述应不展示 Tab 导航条。
- **抓取时间**：2025-12-23 (User Agent: Browser Context)

---
### 结构化 JSON 定义 (spec.json)
```json
{
  "component": "pep-common-card-v2",
  "version": "2.0.0",
  "features": ["Tabs", "CountDown", "MultiLayout"],
  "platforms": ["PC", "Mobile"]
}
```
