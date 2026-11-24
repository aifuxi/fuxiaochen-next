# 设计规范

## 页面布局

- 首页先提供文章搜索，再用 Bento Grid 依次展示近期文章、主题、开源项目和作者简介。宽屏两行共用同一组列宽，移动端按相同顺序单列阅读。
- 博客列表使用简洁的文章列表，以标题、摘要和发布日期为主。文章详情使用文档式阅读布局，宽屏显示目录，窄屏将目录放到正文前或可访问的折叠区。
- 项目页用卡片陈列开源项目，说明项目用途并提供源码或演示入口。关于页集中展示作者信息。

## 主题和排版

颜色优先映射到 Semi Token。博客布局与排版参数集中定义，作为首版起点。

| 语义 Token                                               | 基线                                          |
| -------------------------------------------------------- | --------------------------------------------- |
| `--blog-bg`、`--blog-surface`                            | `--semi-color-bg-0`、`--semi-color-bg-1`      |
| `--blog-text`、`--blog-text-secondary`                   | `--semi-color-text-0`、`--semi-color-text-1`  |
| `--blog-border`、`--blog-accent`                         | `--semi-color-border`、`--semi-color-primary` |
| `--blog-content-width`、`--blog-container-width`         | 正文最大 `760px`，全站容器最大 `1280px`       |
| `--blog-header-height`、`--blog-sidebar-width`           | 页头 `64px`，宽屏目录栏 `240px`               |
| `--blog-article-font-size`、`--blog-article-line-height` | `16px`，`1.85`                                |

默认使用 Semi 默认主题。Modern 主题用于需要验证的圆角风格覆盖。首屏按用户选择或系统偏好呈现主题，验证浅色和深色下的正文、链接、代码块、图片和焦点状态。代码高亮采用 Shiki，并配置两种主题。

首页使用 Semi 的 Layout、Grid、Space、Card、List、Typography、Button、Input 和 Modal。组件沿用默认主题样式，页面 CSS 负责站点容器、区块对齐和跳转链接的可见性。

## 组件与资源

| 场景                                     | 选择                             |
| ---------------------------------------- | -------------------------------- |
| 页面结构、文章正文、静态链接             | 语义化 HTML 和 Astro 组件        |
| 搜索弹窗、移动菜单、按钮、标签、图片预览 | 按场景选择 Semi UI Vue 公开组件  |
| 导航和文章元信息                         | `@aifuxi/semi-icons-vue`         |
| 分类、技术栈、项目入口                   | `@aifuxi/semi-icons-lab-vue`     |
| 404、空状态、搜索无结果                  | `@aifuxi/semi-illustrations-vue` |

静态图标与插画优先由服务端输出 SVG，按需导入并为插画预留尺寸。装饰图标用 `aria-hidden="true"`，功能图标有可访问名称。键盘可以操作菜单、搜索和主题切换，弹窗关闭后焦点回到触发控件。
