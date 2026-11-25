import { getCollection, type CollectionEntry } from 'astro:content'
import { expect, test, vi } from 'vitest'
import { blogPagePath, getBlogPages } from '../../src/lib/blog-pagination'
import { getPublicPosts, postPath } from '../../src/lib/posts'
import { getPublicTagGroups, tagSlug } from '../../src/lib/tags'

vi.mock('astro:content', () => ({ getCollection: vi.fn() }))

function post(
  id: string,
  date: string,
  overrides: Partial<CollectionEntry<'posts'>['data']> = {},
): CollectionEntry<'posts'> {
  return {
    id,
    collection: 'posts',
    data: {
      title: id,
      summary: '文章摘要',
      publishedAt: new Date(date),
      draft: false,
      ...overrides,
    },
  }
}

function setPosts(...entries: CollectionEntry<'posts'>[]) {
  vi.mocked(getCollection).mockImplementation(async (_collection, filter) =>
    filter ? entries.filter(filter) : [...entries],
  )
}

test('以发布日期排序已发表文章，并用 slug 稳定排列同日文章', async () => {
  setPosts(
    post('previous', '2026-11-01', { updatedAt: new Date('2026-11-04') }),
    post('bravo', '2026-11-02'),
    post('draft', '2026-11-03', { draft: true }),
    post('alpha', '2026-11-02'),
  )

  expect((await getPublicPosts()).map(({ id }) => id)).toEqual(['alpha', 'bravo', 'previous'])
})

test('拒绝与数字分页冲突的公开文章路径', async () => {
  setPosts(post('page/2', '2026-11-01'))
  await expect(getPublicPosts()).rejects.toThrow('/blog/page/2/')
  expect(postPath('工具/配置 v2')).toBe('/blog/%E5%B7%A5%E5%85%B7/%E9%85%8D%E7%BD%AE%20v2/')
})

test('分页按每页十篇切分，空集合仍保留列表首页', async () => {
  setPosts()
  expect(await getBlogPages()).toEqual([{ pageNumber: 1, totalPages: 1, posts: [] }])

  setPosts(
    ...Array.from({ length: 11 }, (_, index) => {
      const day = String(index + 1).padStart(2, '0')
      return post(`post-${day}`, `2026-11-${day}`)
    }),
  )

  const pages = await getBlogPages()

  expect(pages.map(({ pageNumber }) => blogPagePath(pageNumber))).toEqual([
    '/blog/',
    '/blog/page/2/',
  ])

  expect(pages.map(({ posts }) => posts.length)).toEqual([10, 1])
  expect(pages[0]?.posts[0]?.href).toBe('/blog/post-11/')
  expect(pages[1]?.posts[0]?.href).toBe('/blog/post-01/')
})

test('标签聚合保留公开文章的原始标签名称并去重', async () => {
  setPosts(
    post('languages', '2026-11-03', { tags: ['C++', 'C++', 'C#'] }),
    post('earlier', '2026-11-01', { tags: ['C++'] }),
    post('draft', '2026-11-04', { tags: ['未发布'], draft: true }),
  )

  const groups = await getPublicTagGroups()
  expect([...groups.keys()]).toEqual(['C++', 'C#'])

  expect(groups.get('C++')?.map(({ href }) => href)).toEqual(['/blog/languages/', '/blog/earlier/'])

  expect(tagSlug('C++')).not.toBe(tagSlug('C#'))
  expect(tagSlug('服务器初始化')).toBe('服务器初始化')
})
