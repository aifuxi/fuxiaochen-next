# 开发路线图

依赖基线和 mise 任务已就绪。[最小集成](BOOTSTRAP.md#验证结果)、内容和页面、搜索和订阅已通过本地验收。第 4 阶段已通过远端构建、Caddy 部署和线上验收。

| 阶段          | 交付                                                                               | 验收                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1. 最小集成   | 接入 Vue 和 MDX，建立最小 Semi UI Vue 消费示例                                     | SSG 与 SSR 兼容性、主题样式、静态资源、必要 Hydration 和按需导入通过。任务边界见 [BOOTSTRAP.md](BOOTSTRAP.md) |
| 2. 内容和页面 | 内容集合、文章列表和详情、分类、标签、归档、首页、项目、关于和 404                 | [首版页面](REQUIREMENTS.md#首版页面) 可访问，草稿隔离、正文无 JS 阅读和两种主题通过                           |
| 3. 搜索和订阅 | Pagefind、RSS、sitemap、robots 和 SEO 元数据                                       | 搜索能命中已发表文章且草稿不可见，订阅、canonical 和结构化数据检查通过                                        |
| 4. 发布验收   | 建立实际使用的 Vitest、Playwright 检查和 GitHub Actions 构建，部署静态产物到 Caddy | 生产构建通过，代表页面达到 [SEO 与性能目标](SEO.md#性能目标)，验证部署后的路由、静态资产和搜索可用            |

每阶段记录实际运行的构建与检查。需要请求时渲染的功能在需求明确后单独排期。

## 第 2 阶段验收

- `mise run check` 和 `mise run build` 通过。生产预览覆盖首页、文章列表和详情、分类、标签、归档、项目、关于及 404，并检查了窄屏的明暗主题、项目源码和网站反馈链接。
- 使用隔离的 Markdown 和 MDX 样例验证了跨页倒序、每页 10 篇、单页与空列表、草稿隔离、文章路径冲突提示，以及更新日期和封面的构建期处理。
- 浏览器验证了键盘翻页。关闭 JavaScript 后，分页链接、文章正文、目录锚点和封面仍可用。

## 第 3 阶段验收

- `mise run check` 和 `mise run build` 通过。生产预览中验证了标题和中文正文搜索、空查询和无结果、键盘打开及访问结果、按 Esc 关闭后焦点返回，以及窄屏明暗主题。
- 隔离样例覆盖了 Markdown、嵌套路径的 MDX、分页和仅含草稿的构建。Pagefind 索引只包含公开文章，草稿不生成路由或进入 RSS、站点地图。没有公开文章时生成空 RSS。
- 解析了生产产物的 RSS 和站点地图 XML，核对了 canonical、Open Graph、`BlogPosting`、封面及 `robots.txt`，并用 `SITE_URL` 替换构建域名验证链接一致性。正式域名已确认为 `https://fuxiaochen.com`，线上访问纳入第 4 阶段验收。

## 第 4 阶段本地验收

- 锁文件安装、`mise run check`、TypeScript 检查和静态构建通过。Vitest 通过 4 项内容规则测试，Playwright 在生产预览通过 5 项检查，覆盖全文搜索、无 JavaScript 阅读、暗色主题、订阅与 SEO 链接及 404。
- 手动 GitHub Actions 工作流已接入代码检查和两类测试，通过后上传同一份构建产物。工作流通过 actionlint 检查。
- 2026-11-25 对应用代码 `64764d6` 的生产构建测量，预览地址为 `http://127.0.0.1:27803`。使用 macOS arm64、Lighthouse 13.6.0、Headless Chrome 158 和默认移动端模拟节流。

| 页面                            | SEO | 性能 | LCP    | CLS |
| ------------------------------- | --- | ---- | ------ | --- |
| `/`                             | 100 | 100  | 1.05 s | 0   |
| `/blog/`                        | 100 | 100  | 0.90 s | 0   |
| `/blog/debian-12-server-setup/` | 100 | 100  | 1.05 s | 0   |

- Chromium 159 在 390 × 740 视口、4 倍 CPU 节流下，对主题切换、搜索、目录与代码复制采样。首页、列表和长文的实验室最长交互耗时分别为 40、32 和 64 ms。启用和禁用 JavaScript 时长文正文 HTML 一致，比较时剔除了代码复制工具栏及其关联 ID。
- [SSH 一键发布](DEPLOYMENT.md)已在临时 Debian 环境用 OpenSSH、Caddy 和 Playwright 验证，覆盖正常切换、拒绝重复编号、拒绝不完整产物和线上检查失败后的回滚。

## 第 4 阶段线上验收

- 2026-11-26，GitHub Actions 完成代码与格式检查、静态构建、4 项 Vitest 单元测试、6 项构建产物验收及 SSH 发布。发布流程中的 6 项线上 Playwright 测试全部通过。线上版本标记与运行记录一致，版本为 `45748826868-1`，提交为 `54f9680`。[发布记录](https://github.com/aifuxi/fuxiaochen-next/actions/runs/45748826868) · [线上版本标记](https://fuxiaochen.com/_release.txt)
- 本机对正式域名复跑 `PLAYWRIGHT_BASE_URL=https://fuxiaochen.com mise run test:published`，6 项均通过，覆盖全文搜索、无 JavaScript 阅读、暗色主题、SEO 与订阅及 404。启用和禁用 JavaScript 时，典型长文的 73 个正文元素的标签和文本一致。
- 首页、文章列表和详情、主题、标签、归档、项目、关于均返回 `200`。抽查的 10 个 CSS、图标和 Pagefind 入口文件均可下载，浏览器全文搜索成功加载 Pagefind 的 WebAssembly 和索引。RSS 和站点地图可解析，链接使用正式域名。主域名的 HTTP 请求及 `www` 的 HTTP 和 HTTPS 请求均跳转到主域名 HTTPS，保留路径和查询参数。
- 2026-11-26 对线上版本 `54f9680` 使用 macOS arm64、Lighthouse 13.6.0、Headless Chrome 158 和默认移动端模拟节流，各测量一次。三页的 SEO、性能、LCP 和 CLS 均达标。[性能目标](SEO.md#性能目标)

| 页面                            | SEO | 性能 | LCP    | CLS |
| ------------------------------- | --- | ---- | ------ | --- |
| `/`                             | 100 | 95   | 2.34 s | 0   |
| `/blog/`                        | 100 | 100  | 1.39 s | 0   |
| `/blog/debian-12-server-setup/` | 100 | 100  | 1.54 s | 0   |

- 实地 Core Web Vitals 有足够线上样本后再记录。

## 上线后增量

- 静态友链页于 2026-11-26 上线，发布提交为 `c807879`。构建生成 `/friends/`，全站页脚提供入口，首条友链从旧站备份迁入。本地已验证窄屏布局、明暗主题，以及禁用 JavaScript 时用键盘访问友链和打开目标站点。[友链需求](REQUIREMENTS.md#友链) · [友链名单](src/config/friends.ts)
- GitHub Actions 的 6 项线上回归测试通过。正式域名的首页、文章详情、关于和友链页均返回 `200`，页脚入口均指向 `/friends/`。在浏览器中从首页页脚打开友链页，确认站名、简介和头像正常显示。[发布记录](https://github.com/aifuxi/fuxiaochen-next/actions/runs/45757734997) · [线上友链页](https://fuxiaochen.com/friends/)
