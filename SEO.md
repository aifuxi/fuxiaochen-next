# SEO、渲染与性能验收

## 搜索可见性

- 用 Astro 布局或统一 SEO 组件输出唯一的页面标题、摘要、canonical、Open Graph 和适用的 JSON-LD。文章用 `BlogPosting`，结构化数据与页面内容一致。
- 维护 sitemap、`robots.txt` 和 RSS。部署前确认生产域名，构建后检查 canonical、订阅链接和 sitemap 指向同一域名。
- 草稿不进入公开页面、站点地图、RSS 或 Pagefind 索引。Pagefind 优先索引文章正文和必要元数据，排除导航等重复内容。
- 检查构建产物。关闭 JavaScript 后，文章标题、正文、主要导航和可抓取的普通链接应正常呈现。

## 渲染兼容性

用实际安装的 Semi UI Vue npm 发布包验证，至少覆盖下列项目：

| 检查       | 验收                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| SSG 与 SSR | Astro 生成 HTML，Vue 渲染阶段不直接访问浏览器全局对象，按需渲染时请求间状态隔离           |
| Hydration  | 服务端与客户端的 DOM 和 ID 一致，浏览器无 mismatch 警告，必要交互可操作                   |
| 浮层和样式 | Teleport 浮层正确挂载，默认主题与实际使用的替代样式入口均正常，首屏无明显无样式或主题闪烁 |
| 资源和体积 | 三个图标、插画包能被真实消费构建，静态内容无需 hydration，按需导入并核对客户端产物        |

## 性能目标

下表用于验收首页、文章列表和典型长文。记录测试 URL、构建版本和运行条件；Lighthouse 评分来自相同条件下的生产构建。Core Web Vitals 的正式阈值按第 75 百分位评估，有线上样本时再记录实地指标。 [Web Vitals](https://web.dev/articles/vitals)

| 指标                                     | 目标     |
| ---------------------------------------- | -------- |
| Lighthouse SEO                           | 100      |
| Lighthouse Performance                   | ≥ 95     |
| LCP                                      | ≤ 2.5 s  |
| CLS                                      | ≤ 0.1    |
| INP                                      | ≤ 200 ms |
| 禁用 JavaScript 后的文章正文 HTML 覆盖率 | 100%     |
