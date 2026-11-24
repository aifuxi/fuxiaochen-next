# 项目开发约定

## 架构与样式

- 使用 Astro、TypeScript Strict、Markdown / MDX 和 Content Collections。Astro 负责路由、内容、页面布局和 SEO，Vue 3.5+ 负责局部交互。公开页面以 SSG 为默认，确需请求时数据的路由再启用 SSR。
- 以语义化 HTML 和原生 CSS、Astro Scoped CSS 为基础。通用交互组件、图标和插画使用 Semi UI Vue 生态，主题通过 Semi Token 和博客语义 Token 管理。禁止把整站做成 Vue SPA，禁止引入 React、Tailwind CSS、shadcn/ui 或另一套通用 UI、图标或插画库。
- 实现前阅读 [产品需求](REQUIREMENTS.md)、[设计规范](DESIGN.md) 和与任务相关的 [架构](ARCHITECTURE.md) 或 [SEO 规范](SEO.md)。按 [路线图](ROADMAP.md) 交付，首个集成任务见 [BOOTSTRAP.md](BOOTSTRAP.md)。

## Semi UI Vue 版本

- `@aifuxi/semi-ui-vue`、`@aifuxi/semi-icons-vue`、`@aifuxi/semi-icons-lab-vue`、`@aifuxi/semi-illustrations-vue`、`@aifuxi/semi-theme-default`、`@aifuxi/semi-theme-modern` 当前统一锁定 `2.2.6`。使用精确版本，禁止使用 `^` 和 `~`。
- 升级需经用户明确授权。安装前确认六个包的相同版本均已发布，统一更新并提交锁文件，重新验收 SSG、SSR、Hydration 和样式。
- 查组件时从已安装版本的 `package.json`、`exports` 和公开类型入手，核对实际版本的 props、事件和插槽。参考同版本源码、示例及 [Semi UI Vue Skill](https://github.com/aifuxi/semi-ui-vue/tree/%40aifuxi/semi-ui-vue%402.2.6/skills/semi-ui-vue)，禁止猜测组件 API。

## 开发与验证

- 用 [mise.toml](mise.toml) 统一工具版本和任务入口。启动前先运行 `mise run dev:status` 或检查 WebStorm 的运行会话，已运行时直接复用。
- 开发服务使用后台模式 `astro dev --background`，通过 `mise run dev` 启动。使用 `mise run dev:status`、`mise run dev:logs` 和 `mise run dev:stop` 管理该服务。
- 构建使用 `mise run build`。渲染或组件变更按影响验证产物 HTML、客户端激活、明暗主题和交互。纯文档变更检查链接、命令和仓库现状。
- 提交前运行 `mise run check` 检查全项目的代码和格式。代码自动修复与格式化分别使用 `mise run lint:fix` 和 `mise run format`。
- 提交标题使用 Angular 风格的 `type(scope): 中文描述`，scope 和正文可按需填写。Husky 在提交前处理暂存文件，并用 commitlint 校验提交信息。

处理对应任务前查阅 [Astro 官方文档](https://docs.astro.build)：

- [页面、路由和中间件](https://docs.astro.build/en/guides/routing/)
- [Astro 组件](https://docs.astro.build/en/basics/astro-components/)
- [框架组件](https://docs.astro.build/en/guides/framework-components/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [样式](https://docs.astro.build/en/guides/styling/)
- [国际化](https://docs.astro.build/en/guides/internationalization/)
