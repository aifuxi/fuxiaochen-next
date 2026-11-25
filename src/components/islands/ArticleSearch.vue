<script setup lang="ts">
/* global DOMParser, HTMLElement, window */
import '@aifuxi/semi-theme-default/input.css'
import '@aifuxi/semi-theme-default/modal.css'
import '@aifuxi/semi-theme-default/shared/foundation-portal-portal.css'
import IconSearch from '@aifuxi/semi-icons-vue/icons/IconSearch'
import { Button } from '@aifuxi/semi-ui-vue/button'
import { Input } from '@aifuxi/semi-ui-vue/input'
import { Modal } from '@aifuxi/semi-ui-vue/modal'
import { computed, ref, watch } from 'vue'

interface SearchResult {
  url: string
  plain_excerpt: string
  meta: { title: string }
}

interface Pagefind {
  search(term: string): Promise<{ results: Array<{ data(): Promise<SearchResult> }> }>
}

const { hasPosts } = defineProps<{ hasPosts: boolean }>()
const searchButton = ref<InstanceType<typeof Button> | null>(null)
const visible = ref(false)
const query = ref('')
const keyword = computed(() => query.value.trim())
const matches = ref<{ url: string; title: string; excerpt: string }[]>([])
const maxResults = 12
const status = ref('')
const pagefindPath = '/pagefind/pagefind.js'

function openSearch() {
  query.value = ''
  visible.value = true
}

watch(
  visible,
  (open, _, onCleanup) => {
    if (!open) {
      return
    }

    const trigger: HTMLElement | undefined = searchButton.value?.$el
    const background = trigger?.closest<HTMLElement>('.site-layout')

    if (background) {
      // Semi Modal 挂载到 body，背景区域可独立退出焦点顺序。
      background.inert = true

      onCleanup(() => {
        background.inert = false
      })
    }
  },
  { flush: 'sync' },
)

watch([visible, keyword], ([open, term], _, onCleanup) => {
  matches.value = []
  if (!open) {
    return
  }

  if (!hasPosts || import.meta.env.DEV || !term) {
    status.value = !hasPosts
      ? '暂无已发布文章。'
      : import.meta.env.DEV
        ? '全文搜索可在构建预览中使用。'
        : '输入关键词，搜索文章标题或正文。'

    return
  }

  status.value = ''
  let cancelled = false

  const timer = window.setTimeout(async () => {
    try {
      const pagefind: Pagefind = await import(/* @vite-ignore */ pagefindPath)
      const { results } = await pagefind.search(term)

      if (cancelled) {
        return
      }

      const data = await Promise.all(results.slice(0, maxResults).map((result) => result.data()))

      if (cancelled) {
        return
      }

      const parser = new DOMParser()

      matches.value = data.map(({ url, meta, plain_excerpt }) => ({
        url,
        title: meta.title,
        // Pagefind 转义了摘要中的 HTML 实体，解码后按纯文本渲染。
        excerpt: parser.parseFromString(plain_excerpt, 'text/html').body.textContent ?? '',
      }))

      status.value = results.length
        ? `找到 ${results.length} 篇文章。${results.length > maxResults ? `显示前 ${maxResults} 篇。` : ''}`
        : '未找到文章，试试其他关键词。'
    } catch {
      if (!cancelled) {
        status.value = '搜索暂时不可用，请稍后重试。'
      }
    }
  }, 200)

  onCleanup(() => {
    cancelled = true
    window.clearTimeout(timer)
  })
})

function restoreSearchFocus() {
  searchButton.value?.$el.focus()
}
</script>

<template>
  <form action="/blog/" @submit.prevent="openSearch">
    <Button
      ref="searchButton"
      html-type="submit"
      type="primary"
      theme="solid"
      size="large"
      aria-haspopup="dialog"
    >
      <template #icon><IconSearch aria-hidden="true" /></template>
      搜索文章
    </Button>
  </form>
  <Modal
    v-model:visible="visible"
    title="搜索文章"
    width="min(540px, calc(100% - 32px))"
    ok-text="关闭"
    :ok-button-props="{ 'aria-label': '关闭' }"
    :has-cancel="false"
    :closable="false"
    :close-on-esc="true"
    :mask-closable="false"
    :motion="false"
    :after-close="restoreSearchFocus"
    @ok="visible = false"
  >
    <Input
      v-model:value="query"
      aria-label="搜索关键词"
      placeholder="文章标题或正文"
      auto-focus
      composition
    />
    <p class="search-status" role="status">{{ status }}</p>
    <ul v-if="matches.length" class="search-results" role="list" aria-label="搜索结果">
      <li v-for="post in matches" :key="post.url">
        <a class="site-link" :href="post.url">{{ post.title }}</a>
        <p>{{ post.excerpt }}</p>
      </li>
    </ul>
  </Modal>
</template>

<style scoped>
.search-status {
  min-block-size: 1.5em;
  margin-block: 12px 0;
  color: var(--semi-color-text-1);
}

.search-results {
  max-block-size: min(20rem, 40dvh);
  overflow: auto;
  overscroll-behavior: contain;
  margin: 8px 0 0;
  padding: 0 4px;
  list-style: none;
}

.search-results li {
  padding: 12px 0;
  border-block-start: 1px solid var(--semi-color-border);
  overflow-wrap: anywhere;
}

.search-results p {
  margin-block: 4px 0;
  color: var(--semi-color-text-1);
}
</style>
