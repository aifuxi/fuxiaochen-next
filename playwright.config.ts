import { env } from 'node:process'
import { defineConfig } from '@playwright/test'

const port = 27804
const previewURL = `http://127.0.0.1:${port}`
const publishedURL = env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: publishedURL || previewURL, trace: 'retain-on-failure' },
  webServer: publishedURL
    ? undefined
    : {
        command: `pnpm exec astro preview --host 127.0.0.1 --port ${port} --strictPort --ignore-lock`,
        url: previewURL,
      },
})
