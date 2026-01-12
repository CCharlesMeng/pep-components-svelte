# NavigateLink Component

楼层导航组件，支持配置化导航栏聚合多种数据源。基于Svelte 5，支持服务端渲染和客户端hydrate。

## 特性

- ⚙️ 配置化导航栏
- 📊 支持多种数据源聚合
- 📱 响应式设计
- 📌 吸顶效果
- 🚀 基于Svelte 5，支持SSR
- 🔄 客户端hydrate优化

## 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (纯前端预览)
pnpm dev

# 构建生产版本
pnpm build
```

## 构建产物说明

组件提供双构建模式：

### 1. 服务端构建 (`pnpm build:server`)
- **产物**: `dist/server/entry-server.js`
- **用途**: 在BFF项目中进行服务端渲染
- **特点**: 使用Svelte 5的`render` API，无需运行时编译

### 2. 客户端构建 (`pnpm build:client`)
- **产物**: `dist/client/entry-client.js`
- **用途**: 客户端hydrate脚本
- **特点**: 只包含hydrate逻辑，体积小巧

## BFF项目集成

### 1. 复制构建产物

将构建产物复制到BFF项目的相应目录：

```
your-bff-project/
├── components/
│   └── entry-server.js          # 从 dist/server/
├── public/
│   └── entry-client.js          # 从 dist/client/
```

### 2. 安装依赖

```bash
npm install svelte@latest
```

### 3. 使用示例

```javascript
// routes/navigate-link.js
import express from 'express';
import { render } from 'svelte/server';
import { NavigateLink } from '../components/entry-server.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        // 组件数据 (可以从数据库/API获取)
        const componentData = {
            config: {
                baseInfo: {
                    bg: 'white',
                    isShowKeyWord: false,
                    isFixed: false,
                    top: 0,
                    bottom: 0
                },
                tabs: [
                    {
                        tabTitle: '首页',
                        tabUrl: '/',
                        tabContent: {
                            isShowSelect: true,
                            recommendType: '2',
                            article: {
                                source: '1',
                                type: 'news',
                                sampleSize: 5
                            }
                        }
                    }
                ]
            },
            tabData: {
                0: [
                    { title: '文章1', url: '/article/1' },
                    { title: '文章2', url: '/article/2' }
                ]
            }
        };

        // 服务端渲染
        const result = render(NavigateLink, {
            props: componentData
        });

        // 返回完整HTML页面
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    ${result.head}
                </head>
                <body>
                    <div id="app">${result.html}</div>

                    <!-- 传递初始数据给客户端 -->
                    <script>
                        window.__INITIAL_DATA__ = ${JSON.stringify(componentData)};
                    </script>

                    <!-- 加载hydrate脚本 -->
                    <script type="module" crossorigin src="/entry-client.js"></script>
                </body>
            </html>
        `;

        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);

    } catch (error) {
        console.error('SSR Error:', error);
        res.status(500).end('Internal Server Error');
    }
});

export default router;
```

## 配置说明

### Config 接口

```typescript
interface Config {
  baseInfo: {
    bg: 'white' | 'bluegrey' | 'halftransparent' | 'shallowgrey';  // 背景主题
    isShowKeyWord: boolean;  // 是否显示关键词标签
    isFixed: boolean;        // 是否吸顶固定
    top: number;            // 上边距(px)
    bottom: number;         // 下边距(px)
  };
  tabs: Array<{
    tabTitle: string;       // 标签标题
    tabUrl: string;         // 标签链接
    tabContent?: {
      isShowSelect: boolean;     // 是否显示下拉菜单
      recommendType: '1' | '2';  // 数据源类型
      article?: {                // recommendType为'2'时的配置
        source: string;
        type?: string;
        guideType?: string;
        sampleSize?: number;
      };
      items?: ArticleItem[];     // recommendType为'1'时的静态数据
    };
  }>;
}

interface ArticleItem {
  title: string;
  url: string;
}
```

### 数据源类型

1. **静态数据** (`recommendType: '1'`): 直接使用`items`数组
2. **动态数据** (`recommendType: '2'`): 使用`tabData` prop，通过索引获取对应标签的数据

## 性能优势

- **预编译SSR**: 服务端无需运行时编译，渲染速度极快
- **按需hydrate**: 只在需要时激活客户端交互
- **Tree Shaking**: 构建产物只包含必要的代码
- **Svelte 5优化**: 利用最新特性提升性能

## 开发调试

开发时可以直接访问开发服务器查看组件效果，无需BFF环境。

生产构建后，可以通过 `example-usage.js` 中的示例代码测试BFF集成。

## 技术栈

- **Svelte 5**: 利用最新runes特性和Imperative Component API
- **Vite**: 现代构建工具，支持SSR构建
- **TypeScript**: 类型安全
- **ES Modules**: 现代模块系统
