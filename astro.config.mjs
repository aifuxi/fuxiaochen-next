// @ts-check
import { env } from 'node:process'
import { URL } from 'node:url'
import mdx from '@astrojs/mdx'
import vue from '@astrojs/vue'
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [
    vue(),
    mdx(),
    {
      name: 'semi-verification',
      hooks: {
        'astro:config:setup': ({ command, injectRoute }) => {
          if (command === 'dev' || (command === 'build' && env.SEMI_VERIFY === '1')) {
            injectRoute({
              pattern: '/__verify/semi/[theme]/[scheme]',
              entrypoint: new URL(
                './src/verification/semi/VerificationPage.astro',
                import.meta.url,
              ),
              prerender: true,
            })
          }
        },
      },
    },
  ],
  server: ({ command }) => (command === 'dev' ? { port: 27797 } : {}),
  vite: {
    server: { strictPort: true },
  },
})
