import { getCollection, type CollectionEntry } from 'astro:content'
import { topics } from '../config/site'

export async function getPublicPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft)

  return posts.sort(
    (left, right) =>
      right.data.publishedAt.getTime() - left.data.publishedAt.getTime() ||
      left.id.localeCompare(right.id),
  )
}

export function postPath(id: string) {
  return '/blog/' + id.split('/').map(encodeURIComponent).join('/') + '/'
}

export interface PostSummary {
  title: string
  summary: string
  publishedAt: string
  topic?: string
  href: string
}

export function toPostSummary({ id, data }: CollectionEntry<'posts'>): PostSummary {
  return {
    title: data.title,
    summary: data.summary,
    publishedAt: data.publishedAt.toISOString().slice(0, 10),
    topic: topics.find((topic) => topic.id === data.topic)?.title,
    href: postPath(id),
  }
}
