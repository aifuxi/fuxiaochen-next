# 首个实现任务

在现有 Astro 项目中验证 Astro 与 Semi UI Vue 的最小集成。以 [AGENTS.md](AGENTS.md) 的依赖版本约定为准，保留现有项目和锁文件。

1. 用 `mise install` 和 `mise run install` 准备环境，确认目前的 Astro 构建通过。
2. 接入与项目 Astro 版本兼容的 Vue 和 MDX 集成，按 Semi UI Vue 的 peer dependency 使用 Vue 3.5+。
3. 建立最小样例，覆盖一段可静态渲染的 MDX 正文、一个静态 Semi 组件、一处需要客户端激活的交互、基础图标、多色图标和插画。根据实际包导出验证默认主题、Modern 主题和明暗切换。
4. 用真实 npm 包运行 Astro 构建，查看产物 HTML 和客户端资源。在浏览器验证交互、浮层、首屏主题和控制台诊断；在代表性的服务端测试中验证 Vue 组件可渲染，保持公开页面的 SSG 默认策略。
5. 记录构建和 [渲染兼容性](SEO.md#渲染兼容性) 的验证结果、失败项和处理结论。该阶段通过后进入 [内容和页面开发](ROADMAP.md)。
