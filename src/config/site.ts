import policeFilingIcon from '../assets/police-filing.png'

export const site = {
  name: '付小晨',
  author: '付小晨',
  language: 'zh-CN',
  rssPath: '/rss.xml',
  sitemapPath: '/sitemap-index.xml',
  homeHeading: '前端开发笔记',
  description: '记录前端工程、组件库和开发工具的实践。',
  feedbackUrl: 'https://github.com/aifuxi/fuxiaochen-next/issues',
  filings: [
    { label: '赣 ICP 备 2024026230 号', href: 'https://beian.miit.gov.cn' },
    {
      label: '赣公网安备 36100002000386 号',
      href: 'https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=36100002000386',
      icon: policeFilingIcon,
    },
  ],
}

export const topics = [
  { id: 'frontend', title: '前端工程', summary: '构建、渲染与交互' },
  { id: 'components', title: '组件库', summary: '组件设计与主题' },
  { id: 'tooling', title: '工具链', summary: '开发环境与自动化任务' },
] as const

export const project = {
  title: 'Semi UI Vue',
  summary: '面向 Vue 3 的组件库。',
  source: 'https://github.com/aifuxi/semi-ui-vue',
}
