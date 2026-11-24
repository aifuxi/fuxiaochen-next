// @ts-check
import { defineConfig } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  server: ({ command }) => (command === 'dev' ? { port: 27797 } : {}),
  vite: {
    server: { strictPort: true },
  },
})
