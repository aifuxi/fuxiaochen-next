// @ts-check
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [vue(), mdx()],
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: 'dark',
      transformers: [
        {
          name: 'article-code-toolbar',
          root(root) {
            const pre = root.children[0]
            if (pre?.type !== 'element' || pre.tagName !== 'pre') {
              return
            }

            const language = pre.properties.dataLanguage

            root.children[0] = {
              type: 'element',
              tagName: 'div',
              properties: { className: ['article-code-block'] },
              children: [
                {
                  type: 'element',
                  tagName: 'div',
                  properties: { className: ['article-code-toolbar'] },
                  children: [
                    {
                      type: 'element',
                      tagName: 'span',
                      properties: {},
                      children: [
                        {
                          type: 'text',
                          value:
                            typeof language === 'string' && language !== 'plaintext'
                              ? language
                              : '纯文本',
                        },
                      ],
                    },
                  ],
                },
                pre,
              ],
            }
          },
        },
      ],
    },
  },
  server: ({ command }) => (command === 'dev' ? { port: 27797 } : {}),
  vite: {
    css: {
      postcss: {
        plugins: [
          {
            postcssPlugin: 'semi-system-theme',
            Once(root) {
              const file = root.source?.input.file?.replaceAll('\\', '/')
              if (!file?.endsWith('/@aifuxi/semi-theme-default/dist/base.css')) {
                return
              }

              // 复用 Semi 的深色 Token，让系统深色偏好在禁用脚本时也能生效。
              const nodes = root.nodes.flatMap((node) =>
                node.type === 'rule' && node.selectors.includes('body[theme-mode=dark]')
                  ? [node.clone({ selector: ':root:not([data-theme]) body' })]
                  : [],
              )

              if (!nodes.length) {
                throw root.error('Semi 默认主题中缺少深色规则。')
              }

              root.append({ name: 'media', params: '(prefers-color-scheme: dark)', nodes })
            },
          },
        ],
      },
    },
    server: { strictPort: true },
  },
})
