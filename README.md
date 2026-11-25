# fuxiaochen-next

基于 Astro、TypeScript、MDX 和 Semi UI Vue 的个人博客与个人品牌网站。Astro 负责页面和内容渲染，Vue 提供局部交互，公开内容优先在构建时生成静态 HTML。

博客页面、Vue 与 MDX 集成、文章全文搜索和 RSS 订阅已实现。发布进度见 [路线图](ROADMAP.md)。六个 Semi UI Vue 生态包统一使用 `2.2.8`。

## 本地开发

在仓库根目录执行。[`mise.toml`](mise.toml) 固定 Node.js `24.21.0` 和 pnpm `12.3.4`，依赖版本由 `pnpm-lock.yaml` 锁定。

```sh
mise install
mise run install
mise run dev:status
mise run dev
```

开发服务默认在后台运行，地址固定为 `http://localhost:27797`。如果 `dev:status` 显示服务已启动，可以直接使用。端口由 [Astro 配置](astro.config.mjs) 指定，占用时启动失败。

| 命令                            | 用途                                       |
| ------------------------------- | ------------------------------------------ |
| `mise run dev:status`           | 查询当前项目的后台开发服务                 |
| `mise run dev:logs`             | 查看后台服务日志，追加 `--follow` 持续查看 |
| `mise run dev:stop`             | 停止当前项目的后台开发服务                 |
| `mise run build`                | 构建静态站点和 Pagefind 索引到 `dist/`     |
| `mise exec -- pnpm run preview` | 本地预览构建产物                           |

WebStorm 中可通过 mise 任务窗口或项目终端运行这些命令。启动前先检查 IDE 的运行会话和后台服务状态。

在生产构建的本地预览中验证首页全文搜索。Pagefind 从构建生成的文章 HTML 创建索引。

## 发布

完成 [首次配置](DEPLOYMENT.md) 后，在 GitHub Actions 手动运行 **发布静态站点**。工作流构建并测试静态产物，经 SSH 上传到 Caddy 服务器，切换版本后运行线上验收。

## 单独构建

工作流进入仓库默认分支后，在 GitHub 的 **Actions → 构建静态站点 → Run workflow** 选择要构建的分支并运行。代码检查、单元测试和生产构建的浏览器验收通过后，在该次运行页面的 **Artifacts** 下载 `fuxiaochen-next-dist` ZIP。

产物包括 `index.html`、`_astro/`、`rss.xml`、站点地图和有公开文章时生成的 `pagefind/`。构建默认使用正式域名 `https://fuxiaochen.com` 生成规范链接。其他环境可在运行 `mise run build` 时通过 `SITE_URL` 指定对应域名。

## 添加文章

将 Markdown 或 MDX 放到 `src/content/posts/`。文章需要 `title`、`summary` 和 `publishedAt`，可选 `updatedAt`、`topic`（`frontend`、`components` 或 `tooling`）、`tags`（例如 `[Debian 12, 服务器初始化]`）、`cover` 和 `draft`。日期使用 `YYYY-MM-DD` 或 ISO 8601 日期时间。更新文章时填写 `updatedAt` 并保留原发布日期。封面可写成 `cover: { image: './cover.png', alt: '封面内容描述' }`，图片路径相对于文章文件。公开文章的标签会出现在 `/tags/`，标签按原名称区分大小写。设置 `draft: true` 的文章会从公开页面、全文搜索、RSS 和站点地图中排除。

文件路径决定文章 URL，发布后应保持稳定。`/blog/` 为文章列表首页，每页 10 篇，后续页使用 `/blog/page/2/` 等路径。构建会拒绝发布使用 `page/数字` 路径的文章。

## 代码质量与提交

使用 `mise run check` 运行全项目只读检查。也可以单独运行 `mise run lint` 或 `mise run format:check`。需要写回文件时，使用 `mise run lint:fix` 自动修复 ESLint 问题，使用 `mise run format` 统一格式。

使用 `mise run test:unit` 检查公开内容规则和分页。首次运行浏览器测试前，用 `mise exec -- pnpm exec playwright install chromium` 安装 Chromium，再运行 `mise run test:e2e`。该任务生成生产产物，并在独立的本地预览中检查全文搜索、无 JavaScript 阅读、订阅和 SEO 链接。

Prettier 负责基础排版。ESLint Stylistic 检查块注释前、多行声明与表达式前后，以及语句块后的留白。

首次运行 `mise run install` 会安装 Husky 钩子。提交时，`pre-commit` 用 lint-staged 处理已暂存的文件，`commit-msg` 用 commitlint 检查标题。标题使用 Angular 风格，例如 `build(tooling): 接入代码质量检查`，scope 和正文按需填写。

可用类型为 `build`、`ci`、`docs`、`feat`、`fix`、`perf`、`refactor`、`revert` 和 `test`。钩子会从 mise 的 shims 目录查找工具，这也适用于从 WebStorm 发起的 Git 提交。

## 项目文档

项目的 Codex 技能由 `skills-lock.json` 锁定。在新检出中运行 `mise exec -- npx -y skills install --agent codex --frozen-lockfile` 恢复锁文件中记录的技能。

| 文档                               | 内容                           |
| ---------------------------------- | ------------------------------ |
| [AGENTS.md](AGENTS.md)             | 开发约束、组件版本和验证要求   |
| [PRODUCT.md](PRODUCT.md)           | 首版读者、产品目标和长期约束   |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 产品范围、页面和内容发布规则   |
| [DESIGN.md](DESIGN.md)             | 布局、排版、主题和组件选择     |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 模块职责、渲染和部署方式       |
| [SEO.md](SEO.md)                   | 搜索可见性、性能目标和验收方法 |
| [ROADMAP.md](ROADMAP.md)           | 开发顺序和各阶段验收条件       |
| [BOOTSTRAP.md](BOOTSTRAP.md)       | 第一个实现任务及验收范围       |

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
