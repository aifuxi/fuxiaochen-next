export default {
  '*.{js,mjs,cjs,ts,mts,cts,vue,astro}': [
    'eslint --fix --max-warnings 0 --no-warn-ignored',
    'prettier --write',
    // Prettier 换行后，重新按最终行数补齐语句间距。
    'eslint --fix --fix-type layout --max-warnings 0 --no-warn-ignored',
  ],
  '*.{css,html,json,jsonc,md,mdx,yaml,yml}': 'prettier --write',
}
