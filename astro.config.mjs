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
    server: { strictPort: true },
  },
})
