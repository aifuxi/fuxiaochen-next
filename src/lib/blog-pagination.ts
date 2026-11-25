import { getPublicPosts, toPostSummary } from './posts'

const pageSize = 10

export function blogPagePath(pageNumber: number) {
  return pageNumber === 1 ? '/blog/' : `/blog/page/${pageNumber}/`
}

export async function getBlogPages() {
  const posts = await getPublicPosts()
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize))

  return Array.from({ length: totalPages }, (_, index) => {
    const pageNumber = index + 1

    return {
      pageNumber,
      totalPages,
      posts: posts.slice(index * pageSize, pageNumber * pageSize).map(toPostSummary),
    }
  })
}
