import { defineConfig } from '@playwright/test'

const port = 27804
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: {
    command: `pnpm exec astro preview --host 127.0.0.1 --port ${port} --strictPort --ignore-lock`,
    url: baseURL,
  },
})
