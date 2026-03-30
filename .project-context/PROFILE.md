# Project Context Profile

## 这个仓库是什么

这是一个以 `pnpm` workspace 管理的 Svelte 组件 monorepo。主线是 `components/*` 里的独立组件包，`shared/*` 里的共享构建/runtime 源码，以及 `scripts/` 下的组件开发脚手架；仓库里还并存一个与主组件构建链路相对独立的 `autonomous-coding/` Python demo。

## 主要结构

- `components/pep-common-card-v2`: 复用 shared trait 的通用卡片楼层组件。
- `components/pep-navigate-link`: 配置驱动的楼层导航与 tab 数据聚合组件。
- `components/pep-cloud-deploy-flow`: 当前最完整的复杂交互组件，包含部署流程、右侧手册、伪浏览器和移动端流程。
- `components/pep-mkp-common-offering`: 已确认是楼层/卡片型组件包，但当前文档与测试证据偏弱。
- `shared/config`: 共享 `tsconfig` 与 `createComponentConfig()` Vite 工厂。
- `shared/core`: shared dev mount、client hydrate、server entry、editor entry。
- `shared/ui`: 楼层 UI 与 trait 类型/提取工具。
- `scripts`: 单组件 dev、模板拷贝、脚手架生成和 features 文件生成。

## 已识别共享参考模式

- 统一的四产物组件构建工厂：`shared/config/vite.factory.ts`。
- 本地开发的 `mock -> component.server loader -> mount` 数据链路：`shared/core/main.ts`。
- `schema.json`、`types.ts`、default mock 与 consistency spec 的契约守护模式。
- shared floor trait 转发模式：`shared/ui/types.ts`、`shared/ui/traits.ts`、`pep-common-card-v2/src/index.svelte`。
- 复杂交互组件的完整契约样例：`pep-cloud-deploy-flow`。

## 已识别关键特性

- 新组件脚手架与模板拷贝。
- 四产物组件构建管线。
- 本地 mock 与 `component.server` loader 契约。
- `schema / types / default data` 一致性守护。
- 通用卡片楼层与共享 trait 转发。
- 配置化楼层导航与 tab 数据聚合。
- 云上部署流侧栏与伪浏览器联动。

## 当前低置信与待验证

- `shared/bff` manifest 指向 `./src/loader.ts`，但当前只确认到 `package.json` 和 `tsconfig.json`。
- `shared/config/package.json` 的导出字段与实际工厂文件名不一致。
- 根 `README.md` 中的共享包地图与当前 workspace/manifests 有漂移。
- `pep-mkp-common-offering` 缺少 repo 内可靠 README/spec/test 证据。
- 根级 `pnpm -r lint` / `pnpm -r format` 是否真实适用于所有包还未执行验证。

## 后续补全提示

- 仍低置信、但会影响后续判断的区域：
  - `shared/bff` 的真实职责与是否仍被运行时使用。
  - `pep-mkp-common-offering` 的业务边界、数据契约和测试入口。
  - 根 README 与实际 workspace 的差异是否需要对齐修订。

- 目前缺少高价值共享参考模式的场景：
  - BFF 集成与发布链路。
  - repo 级 `lint` / `format` / `check` 的可靠验证入口。
  - 端到端或浏览器级复杂交互验证样例。

- 当前关键特性里缺少 spec / acceptance / test refs 的部分：
  - `pep-navigate-link` 暂无 repo 内测试入口。
  - 构建管线与脚手架流程缺少直接自动化测试。
  - `pep-cloud-deploy-flow` 目前只有 README 与 `features.json` 作为文档锚点，缺少独立 spec/acceptance 文件。

- 建议后续由 `sync-context` 持续维护的内容：
  - 组件清单、workspace 包与共享模块边界。
  - 当 `schema.json`、`default.json`、`types.ts`、测试入口变化时同步更新 reference patterns 和 feature refs。
  - 当 README / package manifests / shared factory 有对齐修复时刷新不确定项与风险热点。
