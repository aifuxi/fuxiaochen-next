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

export interface SearchPost {
  title: string
  summary: string
  topic?: string
  href: string
}

export function toSearchPost({ id, data }: CollectionEntry<'posts'>): SearchPost {
  return {
    title: data.title,
    summary: data.summary,
    topic: topics.find((topic) => topic.id === data.topic)?.title,
    href: postPath(id),
  }
}
