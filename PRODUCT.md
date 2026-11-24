# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

首版优先服务技术读者。他们来站点阅读技术文章、按主题补充查阅，或通过全文搜索找到具体内容。想了解作者和开源项目的访客可以从项目页和关于页进入。

## Product Purpose

`fuxiaochen-next` 是作者发布技术文章、维护个人品牌和展示开源项目的网站。首版的核心目标是让读者快速找到相关文章，顺利阅读正文，并通过 RSS 订阅后续更新。

## Operating Context

作者在仓库内用 Markdown / MDX 编写和维护文章。读者可以从近期文章、分类、标签、归档和站内搜索进入正文，也可以在订阅器中获取已发布的文章。

## Capabilities and Constraints

- 首版提供文章列表和详情、分类、标签、归档、站内全文搜索、RSS、项目页和关于页。页面功能与验收见 [产品需求](REQUIREMENTS.md)。
- 文章保留稳定的 slug 和原发布日期。公开页面、搜索索引、RSS 与站点地图使用同一发布范围，草稿仅用于开发或预览。
- 公开内容优先生成静态 HTML，文章正文与主要导航在禁用 JavaScript 时可用。评论等依赖运行时数据的能力另行确定需求。

## Brand Commitments

项目名为 `fuxiaochen-next`。站点以作者的技术内容和开源项目为品牌材料，通用 UI 使用项目自研的 Semi UI Vue 生态。视觉约定见 [设计规范](DESIGN.md)。

## Evidence on Hand

[产品需求](REQUIREMENTS.md)和[开发路线图](ROADMAP.md)记录了首版范围。当前可运行的首页位于 `src/pages/index.astro`，仍使用 Astro 初始模板。正式文章与项目案例以作者提供的内容为准。

## Product Principles

1. 首页和导航优先让读者进入文章列表、搜索与正文。
2. 分类、标签、归档和搜索使用同一套文章元数据，让读者从不同入口找到同一份内容。
3. 文章链接、正文与主要导航独立于交互脚本，订阅和索引都以公开页面为准。

## Accessibility & Inclusion

站点支持窄屏阅读。搜索、菜单和主题切换支持键盘操作，搜索弹窗关闭后焦点返回触发控件。
