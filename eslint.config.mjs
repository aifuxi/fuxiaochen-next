import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { defineConfig, globalIgnores } from 'eslint/config'
import astro from 'eslint-plugin-astro'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const codeFiles = ['**/*.{js,mjs,cjs,ts,mts,cts,vue,astro}']

export default defineConfig(
  globalIgnores([
    '.agents/skills/{design-taste-frontend,impeccable,semi-ui-vue}/',
    '.astro/',
    '.codegraph/',
    '.codex/',
    'coverage/',
    'dist/',
    'test-results/',
    'playwright-report/',
  ]),
  {
    files: codeFiles,
    extends: [js.configs.recommended],
  },
  {
    files: ['**/*.{ts,mts,cts,vue,astro}'],
    extends: [tseslint.configs.recommended],
  },
  vue.configs['flat/strongly-recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      // TypeScript 可选 props 保留 undefined 语义。
      'vue/require-default-prop': 'off',
    },
  },
  astro.configs.recommended,
  eslintConfigPrettier,
  {
    name: 'fuxiaochen-next/readability',
    files: codeFiles,
    plugins: { '@stylistic': stylistic },
    rules: {
      curly: ['error', 'all'],
      'one-var': ['error', 'never'],
      '@stylistic/lines-around-comment': [
        'error',
        {
          beforeBlockComment: true,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
          allowClassStart: true,
          allowInterfaceStart: true,
          allowTypeStart: true,
          allowEnumStart: true,
          allowModuleStart: true,
        },
      ],
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: ['multiline-const', 'multiline-let', 'multiline-var', 'multiline-expression'],
        },
        {
          blankLine: 'always',
          prev: [
            'multiline-const',
            'multiline-let',
            'multiline-var',
            'multiline-expression',
            'block-like',
          ],
          next: '*',
        },
      ],
    },
  },
)
