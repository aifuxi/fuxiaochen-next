// @ts-check
import { fileURLToPath, URL } from 'node:url'
import { close, createIndex } from 'pagefind'

/** @returns {import('astro').AstroIntegration} */
export default function pagefind() {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          const { index, errors } = await createIndex()
          if (!index) {
            throw new Error(errors.join('\n'))
          }

          // 排除文章列表首页，避免零篇文章时 Pagefind 回退到全页索引。
          const indexed = await index.addDirectory({
            path: fileURLToPath(dir),
            glob: 'blog/*/**/index.html',
          })

          if (indexed.errors.length) {
            throw new Error(indexed.errors.join('\n'))
          }

          if (indexed.page_count === 0) {
            logger.info('暂无公开文章，跳过搜索索引。')
            return
          }

          const output = await index.writeFiles({
            outputPath: fileURLToPath(new URL('pagefind/', dir)),
          })

          if (output.errors.length) {
            throw new Error(output.errors.join('\n'))
          }

          logger.info('已生成文章搜索索引。')
        } finally {
          await close()
        }
      },
    },
  }
}
