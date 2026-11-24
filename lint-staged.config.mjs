export default {
  '*.{js,mjs,cjs,ts,mts,cts,vue,astro}': [
    'eslint --fix --max-warnings 0 --no-warn-ignored',
    'prettier --write',
  ],
  '*.{css,html,json,jsonc,md,mdx,yaml,yml}': 'prettier --write',
}
