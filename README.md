# fuxiaochen-next

基于 Astro、TypeScript、MDX 和 Semi UI Vue 的个人博客与个人品牌网站。Astro 负责页面和内容渲染，Vue 提供局部交互，公开内容优先在构建时生成静态 HTML。

当前仓库已有 Astro 基础工程和依赖锁文件，六个 Semi UI Vue 生态包统一使用 `2.2.6`。博客页面、内容集合、Vue 与 MDX 集成、搜索索引和部署流水线按 [路线图](ROADMAP.md) 实施。

## 本地开发

在仓库根目录执行。[`mise.toml`](mise.toml) 固定 Node.js `24.21.0` 和 pnpm `12.3.4`，依赖版本由 `pnpm-lock.yaml` 锁定。

```sh
mise install
mise run install
mise run dev:status
mise run dev
```

开发服务默认在后台运行，地址为 `http://localhost:4321`。如果 `dev:status` 显示服务已启动，可以直接使用。

| 命令 | 用途 |
| --- | --- |
| `mise run dev:status` | 查询当前项目的后台开发服务 |
| `mise run dev:logs` | 查看后台服务日志，追加 `--follow` 持续查看 |
| `mise run dev:stop` | 停止当前项目的后台开发服务 |
| `mise run build` | 构建静态站点到 `dist/` |
| `mise exec -- pnpm run preview` | 本地预览构建产物 |

WebStorm 中可通过 mise 任务窗口或项目终端运行这些命令。启动前先检查 IDE 的运行会话和后台服务状态。

首版计划通过 GitHub Actions 构建静态产物，由 Caddy 提供服务。部署约定见 [架构](ARCHITECTURE.md#构建与部署)。

## 项目文档

| 文档 | 内容 |
| --- | --- |
| [AGENTS.md](AGENTS.md) | 开发约束、组件版本和验证要求 |
| [REQUIREMENTS.md](REQUIREMENTS.md) | 产品范围、页面和内容发布规则 |
| [DESIGN.md](DESIGN.md) | 布局、排版、主题和组件选择 |
| [ARCHITECTURE.md](ARCHITECTURE.md) | 模块职责、渲染和部署方式 |
| [SEO.md](SEO.md) | 搜索可见性、性能目标和验收方法 |
| [ROADMAP.md](ROADMAP.md) | 开发顺序和各阶段验收条件 |
| [BOOTSTRAP.md](BOOTSTRAP.md) | 第一个实现任务及验收范围 |
