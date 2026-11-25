import rss from '@astrojs/rss'
import type { APIRoute } from 'astro'
import { site } from '../config/site'
import { getPublicPosts, postPath } from '../lib/posts'

export const GET: APIRoute = async ({ site: siteUrl }) => {
  if (!siteUrl) {
    throw new Error('请配置 Astro site 后再生成 RSS。')
  }

  const posts = await getPublicPosts()

  return rss({
    site: siteUrl,
    title: site.name,
    description: site.description,
    customData: `<language>${site.language}</language>`,
    items: posts.map(({ id, data }) => ({
      title: data.title,
      description: data.summary,
      pubDate: data.publishedAt,
      link: postPath(id),
    })),
  })
}
