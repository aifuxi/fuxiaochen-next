import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier/flat'
import { defineConfig, globalIgnores } from 'eslint/config'
import astro from 'eslint-plugin-astro'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const codeFiles = ['**/*.{js,mjs,cjs,ts,mts,cts,vue,astro}']

export default defineConfig(
  globalIgnores(['.astro/', '.codegraph/', '.codex/', 'coverage/', 'dist/']),
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
    files: codeFiles,
    rules: {
      curly: ['error', 'all'],
      'one-var': ['error', 'never'],
    },
  },
)
