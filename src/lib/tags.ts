import { createHash } from 'node:crypto'
import { getPublicPosts, toPostSummary, type PostSummary } from './posts'

export function tagSlug(tag: string) {
  const stem = tag
    .normalize()
    .toLowerCase()
    .replace(/[^a-z0-9\p{Unified_Ideograph}]+/gu, '-')
    .replace(/^-|-$/g, '')

  if (stem === tag && [...stem].length <= 48) {
    return stem
  }

  // 保留同名词干下的独立标签，例如 C++ 和 C#，同时避免文件系统忽略大小写导致的冲突。
  const suffix = createHash('sha256').update(tag).digest('hex').slice(0, 16)
  return `${[...stem].slice(0, 32).join('') || 'tag'}~${suffix}`
}

export async function getPublicTagGroups() {
  const groups = new Map<string, PostSummary[]>()

  for (const post of await getPublicPosts()) {
    const summary = toPostSummary(post)

    for (const tag of new Set(post.data.tags)) {
      const posts = groups.get(tag) ?? []
      posts.push(summary)
      groups.set(tag, posts)
    }
  }

  return groups
}
