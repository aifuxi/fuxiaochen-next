# 首个实现任务

在现有 Astro 项目中验证 Astro 与 Semi UI Vue 的最小集成。以 [AGENTS.md](AGENTS.md) 的依赖版本约定为准，保留现有项目和锁文件。

1. 用 `mise install` 和 `mise run install` 准备环境，确认目前的 Astro 构建通过。
2. 接入与项目 Astro 版本兼容的 Vue 和 MDX 集成，按 Semi UI Vue 的 peer dependency 使用 Vue 3.5+。
3. 建立最小样例，覆盖一段可静态渲染的 MDX 正文、一个静态 Semi 组件、一处需要客户端激活的交互、基础图标、多色图标和插画。根据实际包导出验证默认主题、Modern 主题和明暗切换。
4. 用真实 npm 包运行 Astro 构建，查看产物 HTML 和客户端资源。在浏览器验证交互、浮层、首屏主题和控制台诊断；在代表性的服务端测试中验证 Vue 组件可渲染，保持公开页面的 SSG 默认策略。
5. 记录构建和 [渲染兼容性](SEO.md#渲染兼容性) 的验证结果、失败项和处理结论。该阶段通过后进入 [内容和页面开发](ROADMAP.md)。

## 验证结果

运行 `mise run dev` 后打开[默认主题浅色验证页](http://localhost:27797/__verify/semi/default/light/)。页面内可切换默认和 Modern 主题、浅色和深色。运行 `SEMI_VERIFY=1 mise run build` 可生成四个静态验证页，普通 `mise run build` 只生成公开站点产物。

- 构建产物包含 MDX 正文、Semi Tag、两类图标和插画的静态 HTML。关闭 JavaScript 后正文仍可读，页面只有弹窗使用 `client:load`。
- 浏览器验证了四种主题组合的背景色和圆角，以及弹窗的浮层位置、关闭按钮、Tab 焦点限制、Escape 关闭和焦点恢复。四种页面均无控制台警告或错误。
- 使用 Node.js 和 Vue `renderToString` 验证了 Tag、Button 和关闭状态的 Modal 可在服务端渲染。
- 验收构建中的 `EVAL` 和 `MODULE_LEVEL_DIRECTIVE` 警告来自 Semi UI Vue 2.2.6 的发布产物，构建成功。普通构建无这两条警告。
