import { readFile } from 'node:fs/promises'
import { defineCollection } from 'astro:content'
import { glob, type Loader } from 'astro/loaders'
import { z } from 'astro/zod'
import { parse } from 'yaml'
import { topics } from './config/site'

const postDate = z
  .union([z.date(), z.iso.date(), z.iso.datetime({ offset: true, local: true })], {
    error: '填写有效的 YYYY-MM-DD 日期或 ISO 8601 日期时间。',
  })
  .pipe(z.coerce.date())

const globPosts = glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' })

const postsLoader: Loader = {
  ...globPosts,
  load(context) {
    return globPosts.load({
      ...context,
      async parseData(entry) {
        const { data, filePath } = entry

        if (filePath && (data.publishedAt instanceof Date || data.updatedAt instanceof Date)) {
          const source = await readFile(filePath, 'utf8')
          const frontmatter = /^(?:\uFEFF?|\s*\n)---([\s\S]*?\n)---/.exec(source)?.[1]

          if (frontmatter) {
            // Astro 的 YAML 时间戳会先构造 Date，导致无效日期在校验前滚动到下个月。
            const dates = parse(frontmatter, {
              merge: true,
              customTags: [
                { tag: 'tag:yaml.org,2002:timestamp', resolve: (value: string) => value },
              ],
            }) as { publishedAt?: unknown; updatedAt?: unknown }

            return context.parseData({
              ...entry,
              data: { ...data, publishedAt: dates.publishedAt, updatedAt: dates.updatedAt },
            })
          }
        }

        return context.parseData(entry)
      },
    })
  },
}

export const collections = {
  posts: defineCollection({
    loader: postsLoader,
    schema: ({ image }) =>
      z.object({
        title: z.string().trim().min(1),
        summary: z.string().trim().min(1),
        publishedAt: postDate,
        updatedAt: postDate.optional(),
        topic: z.enum(topics.map((topic) => topic.id)).optional(),
        tags: z.array(z.string().trim().min(1)).optional(),
        cover: z.object({ image: image(), alt: z.string().trim() }).optional(),
        draft: z.boolean().default(false),
      }),
  }),
}
