import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { topics } from './config/site'

export const collections = {
  posts: defineCollection({
    loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
    schema: z.object({
      title: z.string().trim().min(1),
      summary: z.string().trim().min(1),
      publishedAt: z.coerce.date(),
      topic: z.enum(topics.map((topic) => topic.id)).optional(),
      tags: z.array(z.string().trim().min(1)).optional(),
      draft: z.boolean().default(false),
    }),
  }),
}
