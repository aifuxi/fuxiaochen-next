import { env } from 'node:process'
import { expect, test } from '@playwright/test'

const article = {
  path: '/blog/debian-12-server-setup/',
  title: 'Debian 12 服务器初始化：从 APT 换源到开发环境配置',
  bodyQuery: '语法高亮',
  section: '一、国内服务器按需更换 APT 镜像',
}

test('可用键盘搜索正文、进入结果并关闭弹窗', async ({ page }) => {
  const hydrationWarnings: string[] = []

  page.on('console', (message) => {
    if (
      ['warning', 'error'].includes(message.type()) &&
      /hydration|mismatch/i.test(message.text())
    ) {
      hydrationWarnings.push(message.text())
    }
  })

  await page.goto('/')
  const trigger = page.getByRole('button', { name: '搜索文章' })
  await expect(trigger).toBeVisible()
  await expect(page.locator('astro-island[ssr]').filter({ has: trigger })).toHaveCount(0)
  await trigger.press('Enter')

  const dialog = page.getByRole('dialog', { name: '搜索文章' })
  const input = dialog.getByRole('textbox', { name: '搜索关键词' })
  await expect(input).toBeFocused()
  await expect(dialog.getByRole('status')).toContainText('输入关键词')
  await input.fill('zzznosuchentry')
  await expect(dialog.getByRole('status')).toHaveText('未找到文章，试试其他关键词。')
  await input.fill(article.bodyQuery)

  const result = dialog.getByRole('link', { name: article.title })
  await expect(result).toHaveAttribute('href', article.path)
  await input.press('Tab')
  await expect(result).toBeFocused()
  await result.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(trigger).toBeFocused()

  await trigger.press('Enter')
  await input.fill('Debian 12')
  await expect(result).toBeVisible()
  await input.press('Tab')
  await expect(result).toBeFocused()
  await result.press('Enter')
  await expect(page).toHaveURL(article.path)
  expect(hydrationWarnings).toEqual([])
})

test.describe('禁用 JavaScript', () => {
  test.use({ javaScriptEnabled: false })

  test('从首页导航到文章，正文和目录仍可用', async ({ page }) => {
    await page.goto('/')

    await page
      .getByRole('navigation', { name: '主导航' })
      .getByRole('link', { name: '文章' })
      .click()

    await page.getByRole('link', { name: article.title }).click()
    await expect(page.getByRole('heading', { level: 1, name: article.title })).toBeVisible()
    await expect(page.locator('.article-body')).toContainText(article.bodyQuery)

    const tocLink = page.getByRole('navigation', { name: '文章目录' }).getByRole('link', {
      name: article.section,
    })

    const anchor = await tocLink.getAttribute('href')
    expect(anchor).toMatch(/^#.+/)
    await tocLink.click()
    expect(decodeURIComponent(new URL(page.url()).hash)).toBe(anchor && decodeURIComponent(anchor))
  })
})

test.describe('跟随系统暗色', () => {
  test.use({ colorScheme: 'dark', javaScriptEnabled: false })

  test('禁用 JavaScript 时保留暗色背景和 Modern 圆角', async ({ page }) => {
    await page.goto('/release-check-missing-page/')
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(22, 22, 26)')
    await expect(page.locator('.page-empty')).toHaveCSS('border-radius', '24px')
    await expect(page.locator('.empty-dark')).toBeVisible()
  })
})

test('窄屏切换暗色后，文章页面保留主题', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 })
  await page.goto('/')
  const themeButton = page.getByRole('button', { name: /主题外观/ })
  await expect(themeButton).toBeVisible()
  await expect(page.locator('astro-island[ssr]').filter({ has: themeButton })).toHaveCount(0)
  await themeButton.press('Enter')
  await page.getByRole('menuitemradio', { name: '暗色', exact: true }).press('Enter')
  await expect(page.locator('body')).toHaveAttribute('theme-mode', 'dark')
  await page.getByRole('link', { name: article.title }).click()
  await expect(page).toHaveURL(article.path)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('body')).toHaveAttribute('theme-mode', 'dark')
})

test('文章元数据、RSS 和站点地图使用同一规范链接', async ({ page, request }) => {
  const site = env.SITE_URL ?? 'https://fuxiaochen.com'
  const canonical = new URL(article.path, site).href
  await page.goto(article.path)
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical)
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical)

  const structuredData = await page.locator('script[type="application/ld+json"]').textContent()

  expect(JSON.parse(structuredData ?? '')).toMatchObject({
    '@type': 'BlogPosting',
    headline: article.title,
    url: canonical,
  })

  const rss = await request.get('/rss.xml')
  expect(rss.ok()).toBe(true)
  expect(await rss.text()).toContain(`<link>${canonical}</link>`)

  const robots = await request.get('/robots.txt')
  expect(robots.ok()).toBe(true)
  expect(await robots.text()).toContain(`Sitemap: ${new URL('/sitemap-index.xml', site).href}`)

  const sitemapIndex = await request.get('/sitemap-index.xml')
  expect(sitemapIndex.ok()).toBe(true)
  expect(await sitemapIndex.text()).toContain(new URL('/sitemap-0.xml', site).href)

  const sitemap = await request.get('/sitemap-0.xml')
  expect(sitemap.ok()).toBe(true)
  expect(await sitemap.text()).toContain(`<loc>${canonical}</loc>`)
})

test('404 页面返回正确状态并可回到文章列表', async ({ page }) => {
  const response = await page.goto('/release-check-missing-page/')
  expect(response?.status()).toBe(404)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await page.getByRole('main').getByRole('link', { name: '浏览文章' }).click()
  await expect(page).toHaveURL('/blog/')
})
