import type { APIRoute } from 'astro'
import { site } from '../config/site'

export const GET: APIRoute = ({ site: siteUrl }) => {
  if (!siteUrl) {
    throw new Error('请配置 Astro site 后再生成 robots.txt。')
  }

  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(site.sitemapPath, siteUrl)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
