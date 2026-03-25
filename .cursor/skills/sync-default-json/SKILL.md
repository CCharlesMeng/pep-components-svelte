---
name: sync-default-json
description: 当用户修改组件的 default.json（新增、更新、删除字段）时，同步更新 schema.json 的类型定义、types.ts 的 TypeScript 接口，并在所有 Svelte 组件源文件中更新对应字段的引用与逻辑。使用场景：用户说"default.json"、"新增字段"、"删除字段"、"修改数据结构"、"同步 schema"。
---

# 同步 default.json → schema.json / types.ts → Svelte 组件

当用户对组件的 `default.json` 进行字段变更时，需要同时完成四件事：
1. 更新 `default.json`（由用户说明或直接给出）
2. 同步更新 `schema.json`（JSON Schema 校验约束）
3. 同步更新 `src/types.ts`（TypeScript 类型推导）
4. 在 Svelte 源文件中更新所有受影响字段的引用与逻辑

## When to use

- 用户明确要修改 `default.json` 的字段（新增、更新、删除、重命名、重组）。
- 用户要求同步 `schema.json` / `types.ts` / Svelte 组件引用。
- 用户希望保证字段改动后仍满足类型约束和渲染兼容。

## When NOT to use

- 仅改样式、文案排版、CSS，不涉及 `default.json` 字段结构变更。
- 仅修复组件逻辑 bug，但数据结构和类型约束不变。
- 用户尚未明确字段变更意图（路径、类型、是否必填），且拒绝补充信息。

---

## 执行步骤

### Step 1：理解变更意图

读取用户的变更说明，明确以下信息：

| 变更类型 | 需要问用户的信息 |
|----------|-----------------|
| **新增字段** | 字段路径、类型（string/number/boolean/object/array）、是否必填、默认值、中文 title |
| **更新字段** | 哪个字段、改为什么类型或值、是否改名 |
| **删除字段** | 哪个字段路径 |

如果信息不完整，**先询问用户再执行**。

#### 跨组件共用字段的路径决策

若新增字段需被**多个子组件**共用，在确定字段路径前先分析数据流：

1. 查看这些子组件各自接收的 prop 来源（在 `index.svelte` 中查找）
2. 判断它们是否有**公共父 prop 对象**：
   - **有公共父对象** → 将字段放在该父对象下（如所有组件都消费 `mainContent`，则放在 `mainContent` 下）
   - **无公共父对象** → 将字段放在**根级别**，在 `index.svelte` 中用 `$derived()` 派生后作为独立 prop 分发给各子组件

#### 字段重组策略（避免扁平字段膨胀）

当同一业务域（如 iframe 页面）字段超过 5-6 个，或已出现明显混合职责（图标资源 + 文案配置 + 交互配置）时，优先将扁平字段重组为语义子对象：

- 资源类：归入 `icons`（或 `assets`）
- 页面内容类：归入 `newTabPage` / `emptyState` 等
- 交互行为类：归入 `actions` / `controls`

重组后要保证命名高内聚、低耦合，并同步更新 `default.json`、`schema.json`、`types.ts` 与所有组件引用。

### Step 2：读取现有文件

**数据 mock 路径**（按组件目录实际存在者读取，勿假设单一位置）：

- 常见：`mocks/default.json`（及可选的 `mocks/index.ts`）
- 子目录拆分（如 `pep-cloud-deploy-flow`）：`mocks/props/default.json` 与/或 `mocks/props/index.ts`  
  开发与 Vite 中 `$data` 别名会优先解析 `mocks/props/*`，再回退 `mocks/*`，见 `shared/config/vite.factory.ts`。

同时读取以下文件，了解当前状态：

```
（上列 mock 路径之一）    # 数据示例
schema.json             # JSON Schema 类型约束定义
src/types.ts            # TypeScript 接口定义（若存在）
src/index.svelte        # 主入口，$props() 接收与 $derived() 派生
src/components/*.svelte # 所有子组件
```

### Step 3：更新 default.json

按变更意图修改 `default.json`：
- 新增字段：在对应路径添加示例值
- 更新字段：修改对应值或键名
- 删除字段：移除对应键

### Step 4：同步 schema.json

根据 default.json 的变更，同步更新 `schema.json`：

**新增字段时：**
- 在对应 `properties` 中添加字段定义
- 设置 `type`（与 default.json 值类型一致）
- 添加中文 `title`（用于 UI 说明）
- 若为必填，加入 `required` 数组
- 若有枚举值，添加 `enum`

**更新字段时：**
- 修改 `type`、`title`、`enum` 等约束
- 若字段改名：旧键删除，新键添加，同步修改 `required` 数组

**删除字段时：**
- 从 `properties` 中移除
- 从 `required` 数组中移除（如有）

**schema.json 字段模板：**
```json
"fieldName": {
  "title": "中文说明",
  "type": "string | number | boolean | object | array",
  "default": "默认值（可选）"
}
```

### Step 4b：同步 types.ts

`schema.json` 管 JSON Schema 校验，`types.ts` 管 TypeScript 类型推导，**两者都要同步**：

**新增字段时：**
- 在对应接口（interface）中添加字段声明
- 可选字段使用 `?`，必填字段不加
- 添加 JSDoc 注释说明字段用途

**更新字段时：**
- 修改字段的类型声明
- 若字段改名：旧字段名 → 新字段名

**删除字段时：**
- 从接口中删除对应字段声明

**根级接口字段模板：**
```typescript
export interface PepXxxProps {
  // ... 已有字段
  /** 字段中文说明 */
  newField?: string;
}
```

### Step 5：搜索并更新 Svelte 组件

对每个受影响的字段，在所有 `.svelte` 文件中搜索其引用：

**搜索策略：**
- 用字段名搜索（如 `fieldName`、`data.fieldName`、`props.fieldName`）
- 搜索解构赋值（如 `{ fieldName }`）
- 搜索模板绑定（如 `{fieldName}`、`bind:value={fieldName}`）

**处理规则：**

| 情况 | 处理方式 |
|------|---------|
| 字段改名 | 全局替换旧字段名为新字段名 |
| 字段删除 | 移除所有引用，清理相关条件逻辑（如 `if (field)` 块） |
| 新增字段 | 按下方「新增字段完整落地步骤」处理 |
| 字段类型变更 | 更新类型断言、条件判断、渲染逻辑 |

#### 新增字段在 Svelte 组件中的完整落地步骤

对每个需要消费该字段的子组件，依次完成：

1. **`interface Props` 中声明**（可选字段用 `?`）：
   ```svelte
   interface Props {
     existingProp: SomeType;
     newField?: string;  // 新增
   }
   ```

2. **`$props()` 解构中加入**：
   ```svelte
   let { existingProp, newField }: Props = $props();
   ```

3. **模板中添加消费逻辑**（按实际需求选择方式）：
   ```svelte
   <!-- 条件渲染 -->
   {#if newField}<img src={newField} />{/if}

   <!-- inline style 绑定（如背景图） -->
   <div style={newField ? `background-image: url('${newField}'); background-size: cover;` : undefined}>

   <!-- 文本插值 -->
   {newField ?? '默认文案'}
   ```

4. **确保无值时有 fallback**（保持向下兼容）：
   - CSS 背景：inline style 仅在有值时设置，无值时原有 CSS 样式自然生效
   - 文本内容：使用 `??` 空值合并提供默认值
   - 图片/图标：用 `{#if field}...{:else}默认内容{/if}` 结构

#### 根级新增字段在 index.svelte 中的分发

若字段放在根级别（无公共父 prop），需在 `index.svelte` 中完成派生和传递：

```svelte
<!-- 1. 派生字段 -->
let newField = $derived(data.newField);

<!-- 2. 传递给每个需要消费的子组件 -->
<ChildA {newField} />
<ChildB {newField} />
<ChildC {newField} />
```

### Step 6：验证一致性

完成所有修改后，确认：
- [ ] `default.json` 与 `schema.json` 的字段结构对齐
- [ ] `schema.json` 中 `required` 数组与 `default.json` 中存在的字段一致
- [ ] `types.ts` 中对应接口已包含新字段（或已移除删除字段）
- [ ] `index.svelte` 中已派生并传递根级新增字段
- [ ] 所有目标子组件的 `Props` interface、`$props()` 解构、模板消费均已更新
- [ ] 所有 Svelte 组件中已无对已删除字段的引用
- [ ] `additionalProperties: false` 的对象不会因新增字段而报错
- [ ] 新增字段无值时各组件有合理的 fallback，向下兼容

### Step 7：失败回退与降级策略

若执行中出现异常，按以下规则处理：

| 异常场景 | 处理策略 |
|---------|---------|
| 缺少关键文件（如 `schema.json` / `types.ts`） | 立即暂停，列出缺失文件并请求用户确认是否创建 |
| 字段路径不明确或有歧义 | 不执行写入，先给出 1-2 个候选路径让用户选择 |
| `schema.json` 校验冲突（如 `required` 与默认值不一致） | 先修正 `schema`，再继续组件层更新 |
| 批量替换可能误伤（同名字段跨语义复用） | 改为逐文件定点替换，并输出受影响清单供确认 |
| 无法定位组件消费点 | 输出“未定位到引用”的文件列表，不做猜测性修改 |

---

## 输出格式（每次执行后必须给）

按以下模板输出变更报告，避免只给“改了哪些文件”：

```md
## 变更摘要
- 变更类型：新增/更新/删除/重命名
- 字段路径：`...`

## 修改文件
- `mocks/default.json` 或 `mocks/props/default.json`（及涉及的 `mocks/**/index.ts`，若存在）：...
- `schema.json`：...
- `src/types.ts`：...
- `src/components/...`：...

## 风险与兼容性
- required / additionalProperties 检查结果：
- 组件 fallback 检查结果：

## 待用户确认项（如有）
- ...
```

---

## 本项目结构说明

以 `pep-cloud-deploy-flow` 组件为例（其他组件多为 `mocks/default.json` 直接在 `mocks/` 下）：

```
components/pep-cloud-deploy-flow/
├── mocks/
│   └── props/
│       ├── default.json        # 数据 mock
│       └── index.ts            # 可选：导出/组装 mock（$data 优先）
├── schema.json                 # JSON Schema 字段约束定义
└── src/
    ├── types.ts                # TypeScript 接口定义（PepCloudDeployFlowProps 等）
    ├── index.svelte            # 根组件，$props() 接收，$derived() 派生各子 prop
    └── components/
        ├── Navbar.svelte       # 消费 data.navbar
        ├── SidebarPanel.svelte # 消费 data.sidebar
        ├── MainPanel.svelte    # 消费 data.mainContent
        ├── PseudoBrowser.svelte# 消费 data.iframePages
        ├── EndDeploymentModal.svelte
        └── DeploymentFinished.svelte
```

**数据流向：**
```
default.json（或 props/default.json / props/index.ts 作为 $data 入口）
  → index.svelte ($props() 接收 data)
    → $derived() 派生各子 prop（navbar / sidebar / mainContent / backgroundImage 等）
      → 子组件 $props() 接收对应 prop
```

**类型定义分工：**
- `schema.json`：JSON Schema 校验，防止 default.json 配置错误，`additionalProperties: false` 强约束
- `types.ts`：TypeScript 类型推导，供 `.svelte` 文件中的 `$props()` 和 `$derived()` 使用

---

## 典型示例

### 示例 A：在 navbar.logo 下新增 `text` 为可选字段

1. **default.json** → 在 `navbar.logo` 下添加 `"text": "华为云"`
2. **schema.json** → 在 `navbar.logo.properties` 中添加：
   ```json
   "text": { "title": "Logo 文本", "type": "string" }
   ```
3. **types.ts** → 在 `NavbarLogo` interface 中添加：
   ```typescript
   text?: string;
   ```
4. **Navbar.svelte** → 搜索 `logo`，在渲染 logo 的地方加上：
   ```svelte
   {#if logo.text}<span>{logo.text}</span>{/if}
   ```

### 示例 B：删除 `mainContent.estimation.durationLabel`

1. **default.json** → 删除 `durationLabel` 键
2. **schema.json** → 从 `estimation.properties` 中移除 `durationLabel`，从 `estimation.required` 中移除
3. **types.ts** → 从 `MainContentConfig.estimation` 中删除 `durationLabel: string`
4. **MainPanel.svelte** → 搜索 `durationLabel`，删除所有引用和相关 HTML

### 示例 C：将 `sidebar.footer.prevText` 改名为 `sidebar.footer.backText`

1. **default.json** → `prevText` → `backText`
2. **schema.json** → `properties` 中 `prevText` → `backText`，`required` 中同步修改
3. **types.ts** → `SidebarFooter` interface 中 `prevText` → `backText`
4. **SidebarPanel.svelte** → 全局替换 `prevText` → `backText`

### 示例 D：新增根级字段 `backgroundImage` 供多个无公共父 prop 的组件共用

> 场景：MainPanel、DeploymentFinished、PseudoBrowser 分别消费不同的 prop，需共享同一背景图配置

1. **分析**：三个组件无公共父 prop → 字段放根级别
2. **default.json** → 根级别添加 `"backgroundImage": "https://..."`
3. **schema.json** → 根级别 `properties` 添加：
   ```json
   "backgroundImage": { "title": "全局背景图片地址", "type": "string" }
   ```
4. **types.ts** → `PepCloudDeployFlowProps` 中添加：
   ```typescript
   /** 全局背景图片地址，应用于多个页面 */
   backgroundImage?: string;
   ```
5. **index.svelte** → 派生并传递：
   ```svelte
   let backgroundImage = $derived(data.backgroundImage);
   // 模板中传给三个子组件
   <MainPanel {mainContent} {backgroundImage} />
   <DeploymentFinished {endDeployment} {backgroundImage} />
   <PseudoBrowser {iframePages} {backgroundImage} />
   ```
6. **各子组件** → 依次完成：Props 声明 → 解构 → inline style 消费 → 无值 fallback

---

## 注意事项

- `schema.json` 中 `additionalProperties: false` 表示不允许未声明字段，新增字段**必须**同步到 schema
- `schema.json` 和 `types.ts` 职责不同，**两者都要更新**，不可只改其一
- 删除 `required` 中的字段时，先检查 `default.json` 是否真的没有该字段
- 若字段被多个子组件共用（通过 `index.svelte` 分发），需逐一检查每个子组件
- 新增可选字段时，始终为组件提供无值时的 fallback，保持向下兼容
- 图标、背景图等视觉资源优先使用 URL 资产；新增资源前先检查组件现有字段和 default.json 是否已有可复用的同类 URL，优先复用已有资产（如 `infoIcon.png`、云产品 icon）
- 变更完成后，告知用户修改了哪些文件、哪些行，便于 review
