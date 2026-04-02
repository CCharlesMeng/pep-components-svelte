# HTML to JSON 转换器架构设计说明书 (完整详尽版)

## 1. 总体策略与目标

**1.1 核心目标**
将现有的文档 HTML 片段（无 `<html><body>` 的内容片段）转换为规范的 JSON 数据，使得前端 CMS 渲染引擎（如 Svelte、React）能够完全接管 UI 展现，实现内容与展现的分离。

**1.2 处理范围**
- **处理对象**：共计约 1300+ 个 `*.html` 文档片段（如 `usermanual-ecs/`, `bestpractice-ecs/` 等目录下的文件）。
- **排除对象**：具有完整 HTML 骨架的异构页面（如 `ecs_video/index.html`）。

**1.3 输出模式**
采用**一对一映射**：每个源 `.html` 文件生成配套的 `.json` 文件，并存放在同一目录下（如 `ecs_faq_0013.html` -> `ecs_faq_0013.json`）。

**1.4 抽象粒度**
采用**混合结构抽象策略**：
1. **块级元素（Block Level）**：全量保留层级结构，转为 Block 树（AST 的一种简化形式）。
2. **行内元素（Inline Level）**：不打散成细碎的 AST 节点。将关键的外部引用（图片、链接）提取为资源词典，并在纯文本中用 `{img:0}`, `{link:0}` 进行占位替换；忽略仅仅用于表现样式的标签（如 `<b>`, `<span>`），将其内部文本直接合并。

---

## 2. 顶层页面结构 Schema

每个 HTML 解析出的 JSON，其顶层结构如下，采用**嵌套的 Section 分层隔离**：

```json
{
  "id": "ecs_03_0155",
  "title": "页面的主标题",
  "parent": {
    "title": "管理我的ECS",
    "href": "ecs_03_0144.html"
  },
  "content": [
    // 页面头部，不属于任何 section 的顶层内容块 Block[]（如一段前言说明）
  ],
  "sections": [
    {
      "title": "第一个小结标题",
      "content": [
        // 该 section 下的所有子内容块 Block[]
      ]
    }
  ]
}
```

**解析来源：**
- `id`: 取自页面 `<a name="xxx">`，若无则取去除 `.html` 后缀的文件名。
- `title`: 取自 `h1.topicTitle-h1` 或 `h1.topictitle1` 的文本。
- `parent`: 取自 `<div class="parentlink">` 或 `<div class="familylinks">` 里的 `<a>` 标签。
- `sections[].title`: 取自 `h4.sectiontitle`。
- `content`：由于文档结构本质是 Block 序列，因此位于最外层 `<div class="section">` 外的区块归入根级 `content`，位于 section 内部的区块则归入该 section 的 `content`。

---

## 3. 全量场景 Block 类型与 Schema

通过正则扫描与 JSDOM 遍历，我们**穷举了 1300+ 文件中出现的所有内容区块表现形式**。解析器必须支持并生成以下这 12 种 Block 结构的 JSON：

### 3.1 基础内容块 (Basic Blocks)

**场景 1：普通段落 (`paragraph`)**
这不仅仅是纯文本，内部还可能非标准地潜藏着其他独立块。
- **触发**：`<p>`, `<div class="p">`, `p.msonormal`, `p.MsoNormal`
- **Schema**：
  ```json
  {
    "type": "paragraph",
    "text": "本段落的具体说明文字，包含 {link:0} 占位...",
    "links": [{ "href": "url", "text": "文字", "external": false }],
    "images": [],
    "blocks": [
      // ⚠️ 如果该段落内部非法嵌套了列表、表格、代码块等层级，需递归放入此处
    ]
  }
  ```

**场景 2：无序列表 (`unordered-list`)**
普通的点状列表。
- **触发**：`<ul>` 且不带诸如 ullinks、clearfix 这类特殊 class的。
- **Schema**：
  ```json
  {
    "type": "unordered-list",
    "items": [
      {
        "text": "列表项第一行的文字，支持 {img:0} 占位",
        "links": [],
        "images": [],
        "blocks": [
          // 列表项 li 内部常嵌套截图步骤、警告框、甚至复杂的数据表格
        ]
      }
    ]
  }
  ```

**场景 3：有序列表 (`ordered-list`)**
带有数字或字母序号的强编排步骤。
- **触发**：`<ol>`, `<ol type="a">` 等
- **Schema**：
  ```json
  {
    "type": "ordered-list",
    "listType": "1", // 或者是 "a"
    "items": [
      {
        "text": "第一步：执行操作...",
        "links": [],
        "images": [],
        "blocks": [ /* ...同上，嵌套支持图表... */ ]
      }
    ]
  }
  ```

**场景 4：链接/子列表导航 (`link-list`)**
用于页面底栏相关链接指南或常见问题解答 (FAQ) 中的只读文字导航。
- **触发**：`ul.ullinks`, `li.ulchildlink`，以及偶尔出现的 `dl > dt > a` 构型。
- **Schema**：
  ```json
  {
    "type": "link-list",
    "items": [
      {
        "text": "如何计费？",
        "href": "faq_001.html"
      }
    ]
  }
  ```

### 3.2 复合与交互容器块 (Compound & Interactive Blocks)

**场景 5：文档提示/告警框 (`notice`)**
- **触发**：`div.note`, `div.caution`, `div.notice`
- **Schema**：
  ```json
  {
    "type": "notice",
    "level": "note", // 枚举可能的值: "note" | "caution" | "notice"
    "content": [
      // 提示框通常不只是一行字，可内含表格、多段落甚至是代码块。
      // 注意：解析时必须过滤忽略掉自带的前缀标题如 "说明：" (<span class="notetitle">) 
      // 以及华为系统自带的小图标 img (带有 public_sys 字样的内容)
    ]
  }
  ```

**场景 6：带高亮的代码块/命令行窗 (`code-block`)**
- **触发**：`pre.screen`, `pre.codeblock`, `div.codecoloring`
- **Schema**：
  ```json
  {
    "type": "code-block",
    "syntax": "screen", // 或者从内部的标记类中推断语言，默认 "code"
    "code": "yum -y install nginx\nsystemctl start nginx", // 纯文本，完全保留其中的 \n 并剔除内部的 lineNo 等无关高亮标签
    "highlighted": true // 如果原始是用 div.codecoloring/highlight 呈现的则为 true
  }
  ```

**场景 7：详情折叠面板 (`dropdown`)**
- **触发**：`div.dropdownexpand` 及包裹的 `dropdowncontext`
- **Schema**：
  ```json
  {
    "type": "dropdown",
    "title": "展开以查看排查详情...", // 从 dropdowntitle 区段摘取文本
    "content": [ 
      // 从 dropdowncontext 摘取解析出的所有内含 Blocks
    ]
  }
  ```

**场景 8：内容标签切换面板 (`tabs`)**
用于多维度配置教程（比如Windows版本步骤 / Linux版本步骤）。
- **触发**：`div.sectionTitleTab` 与 `div.sectionTab` 组合，连带外包裹标签
- **Schema**：
  ```json
  {
    "type": "tabs",
    "items": [
      {
        "title": "Windows操作系统", // 取自最上方的 ul.clearfix > li 面板导航文字
        "content": [
          // 对应的 div.sectionTab 内的一切复合 Block
        ]
      },
      {
        "title": "Linux操作系统",
        "content": [ ... ]
      }
    ]
  }
  ```

### 3.3 数据展示块 (Data Forms)

**场景 9：多态数据表格 (`table`)**
拥有复杂层级表头和各种形态网格的数据区。
- **触发**：`<table>`, `div.tablenoborder`, `div.tableBorder`
- **Schema**：
  ```json
  {
    "type": "table",
    "wrapper": "border", // 外部包装容器（枚举: "border" | "noborder" | "none"）
    "caption": "表1 实例规格", // 若有，则源自 <caption>
    "headers": ["参数", "说明"], // 源自 thead 里的文本提取
    "rows": [
      [
        // 普通的独立单元格结构
        { 
          "text": "vCPU", 
          "links": [], 
          "images": [], 
          "blocks": [ /* 单元格内可能嵌套了子表格、多段说明、注意框，这也是一个递归入口 */ ] 
        },
        // 合并情况下的抽象格子声明 (占位符 `<` 往左合并列， `^` 往上合并行)
        { "text": "<" } 
      ]
    ]
  }
  ```

### 3.4 媒体资源文件 (Media Blocks)

**场景 10：带图注的演示大图 (`figure`)**
- **触发**：`div.fignone`
- **Schema**：
  ```json
  {
    "type": "figure",
    "caption": "图1 控制台首屏", // 源自内含的 span.figcap
    "src": "image_path_123.png"  // 源自内含的 img
  }
  ```

**场景 11：流内常规图片 (`image`)**
- **触发**：直接零散浮现于段外（非 fignone 内）的 `<img src="...">` 块
- **Schema**：
  ```json
  {
    "type": "image",
    "src": "image_path.png",
    "scalable": true // 带有 imgResize 逻辑的标记为可放大模型
  }
  ```

**场景 12：视频文件 (`video`)**
- **触发**：`<video>` 标签或带有 `idp-external-video` 的播放器组件
- **Schema**：
  ```json
  {
    "type": "video",
    "src": "xxxx.mp4"
  }
  ```

---

## 4. 彻底防止结构丢失的“七大递归承接器”

根据 JSDOM 全景扫图报告，为了防止解析期间吞掉层级导致重要信息遗失。**在解析上述 Schema 遇到下述 7 个字段时，解析器必须调用（递归进入）通用的内循环 Block Parser 数组模式**，这七个字段构成了完整页面的主干骨架：

1. **`页根属性.content` 与 `sections[].content`** —— 这些是最外层的主文档流。
2. **`notice.content`** —— 用户须知内不仅是纯字，往往嵌套代码片段。
3. **`tabs.items[].content`** —— Tab卡片本质是切换显示另外一个“微型章节”。
4. **`dropdown.content`** —— 同Tab卡片一样，属于微型章节。
5. **`有序无序列表项.items[].blocks`** —— `<li>` 里面高频率地出现带步骤大截词图 `<figure>`、警示框甚至子操作表 `<table>`。
6. **`table` 单元格的 `rows[][].blocks`** —— 网格的 `<td>/<th>` 常具有多段说明甚至嵌套网格。
7. ⭐ **`paragraph.blocks`** —— 段落非法破壳点。针对 `<p>` 里面强行内嵌了其他列表/表格的现象而存在的承接缓冲层。

---

## 5. 行内元素规则：纯净文本和占位抽离系统

解析器对深层的行内结构不展开细分 AST，而采用“文本打平+外移抽离”原则，极大降低渲染负担：

### 5.1 需要强制提取移交外部的语义参考
- **`<a href="...">` 处理**：
  - 内容转写在文字中打下 `{link:当前索引值}` 标记。
  - 数据推入同层 `links` 数组结构：`{ "href": "相对路径或全网绝对URL", "text": "说明文本", "external": boolean }`。
  - 🗑 **剥除废料**：去掉 href 等于 `javascript:XXX` 或者仅仅是个无意义页面内锚点的空虚链接。
- **`<img src="...">` 处理**：
  - 打下 `{img:N}` 标记，将 src 推入同层 `images` 数组。
  - 🗑 **剥除废料**：若其 src 是包含 `public_sys-resources` 这种系统用来画告警框的小叹号装饰图标，将其彻底抛弃无视。

### 5.2 样式的直接吞并剥离 (Text Unwrapping)
遇到以下标签，解析器当它“不存在”但保留期间内的纯文本（`textContent`），拼接成一段：
- **行内语义词类**：`<span>` 及几乎一切的内部带类名 span (`.filepath`, `.parmvalue`, 等等)
- **视觉粗斜体类**：`<b>`, `<strong>`, `<i>`, `<em>` 
- **旧版遗留样式类**：`<font>`, `<u>`

### 5.3 换行转义
如果遇到 `<br>`，无论是单独存在于文本节点间还是何处，都无脑替换转移为纯 JSON 字符串里的 `\n`。

---

## 6. 杂草垃圾元素抛弃名单 (Ignore List)

下面这些东西在通过 JSDOM 扫描遇到时，可以直接 bypass（完全略过或者穿透拿取子内容，当它空气）：
1. `<button>`, `<input>`, `<label>`, `colHidden` 及其全家交互态：这些过去旧时代用来在前端查表的无聊控件已经过时。
2. `div.articleBoxWithoutHead`, `div.clearfix`, `div.info`, `div.context` 等全家桶：这些 DITA 出的辅助生成标记由于对结构树完全无营养，应当**直接剥去壳取下挂层元素**，视作透明包装（unwrap）。
3. `<script>` 侧加载包依赖。
4. `linenodiv`：带代码高亮的辅助生成侧编号标记，弃用，行号交回给新时代的 Svelte 等代码着色库处理。
