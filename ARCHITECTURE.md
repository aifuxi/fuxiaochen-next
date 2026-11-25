# 技术架构

Astro 负责路由、布局、内容渲染和元数据。Markdown 与 MDX 通过 Content Collections 管理，Vue 3.5+ 与 Semi UI Vue 只承担组件渲染和局部客户端交互。仓库已有 Astro、TypeScript Strict、pnpm 锁文件和 Semi UI Vue 依赖，以下为实施目标。

## 模块职责

| 目标目录                                      | 职责                                          |
| --------------------------------------------- | --------------------------------------------- |
| `src/pages/`、`src/layouts/`                  | 路由、站点布局、博客布局、文章布局和 RSS 端点 |
| `src/content/posts/`、`src/content.config.ts` | 文章源文件、内容集合和元数据校验              |
| `src/components/{layout,blog,mdx,seo}/`       | 区块、文章展示、MDX 组件和 SEO 输出           |
| `src/components/islands/`                     | 搜索、移动导航等需要激活的 Vue 组件           |
| `src/config/`、`src/lib/`                     | 站点地址与导航、公开内容筛选和元数据生成      |
| `src/styles/`                                 | 主题、语义 Token、全局样式和排版              |
| `tests/{unit,ssr,e2e}/`                       | 按需落地 Vitest 和 Playwright 验证            |

## 渲染与激活

默认采用 `output: 'static'`，首页、文章列表、文章详情、分类、标签和归档在构建时生成 HTML。仅当某个功能确需请求时数据或用户状态，再为该路由引入 SSR。届时接入适合部署环境的适配器，例如 `@astrojs/node`，并仅在该路由设置 `prerender = false`。 [Astro 按需渲染](https://docs.astro.build/en/guides/on-demand-rendering/)

| 激活方式           | 场景                                       |
| ------------------ | ------------------------------------------ |
| 无 `client:*` 指令 | 标签、静态图标、插画等仅需生成 HTML 的组件 |
| `client:load`      | 需要立即可操作的首屏控件                   |
| `client:idle`      | 首屏后激活的搜索或设置                     |
| `client:visible`   | 下方的交互式示例、图表等                   |
| `client:media`     | 仅在特定屏幕尺寸运行的交互                 |

核心导航和文章正文要在静态 HTML 中可用。`client:only` 仅用于确实依赖浏览器且不承担核心内容的组件。 [Astro 框架组件](https://docs.astro.build/en/guides/framework-components/)

## 构建与部署

- Astro 构建完成后，Pagefind 读取标记了 `data-pagefind-body` 的公开文章 HTML。首页搜索在访客首次输入关键词时加载搜索索引。HTML、静态资源和搜索索引作为同一构建产物发布。 [Pagefind 文档](https://pagefind.app/docs/)
- GitHub Actions 提供手动构建，按 mise 和 pnpm 锁文件安装工具及依赖，运行代码检查、Vitest 和 Playwright，再将通过验收的 `dist/` 打包为可下载产物。部署时将解压后的内容交给 Caddy 提供静态服务。Astro 的 `site` 默认使用正式域名 `https://fuxiaochen.com`，生成 canonical、RSS 与站点地图。其他环境可通过 `SITE_URL` 指定对应域名。
- 如后续启用 SSR，由 Caddy 将对应请求转发到 Node.js 服务；现有公开文章继续预渲染。SSR 专项验收见 [SEO 规范](SEO.md#渲染兼容性)。
