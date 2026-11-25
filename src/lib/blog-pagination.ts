import { getPublicPosts, postPath, toPostSummary } from './posts'

const pageSize = 10

export function blogPagePath(pageNumber: number) {
  return pageNumber === 1 ? '/blog/' : `/blog/page/${pageNumber}/`
}

export async function getBlogPages() {
  const posts = await getPublicPosts()
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))
  const articlePaths = new Set(posts.map(({ id }) => postPath(id).toLowerCase()))

  return Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1
    const path = blogPagePath(pageNumber)

    if (articlePaths.has(path)) {
      throw new Error(`文章路径 ${path} 与列表分页冲突，请修改该文章的 slug。`)
    }

    return {
      pageNumber,
      totalPages,
      posts: posts.slice(index * pageSize, pageNumber * pageSize).map(toPostSummary),
    }
  })
}
