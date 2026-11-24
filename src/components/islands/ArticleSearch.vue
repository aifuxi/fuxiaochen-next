<script setup lang="ts">
import { Button } from '@aifuxi/semi-ui-vue/button'
import { Input } from '@aifuxi/semi-ui-vue/input'
import { List, ListItem } from '@aifuxi/semi-ui-vue/list'
import { Modal } from '@aifuxi/semi-ui-vue/modal'
import { Text } from '@aifuxi/semi-ui-vue/typography'
import { computed, ref } from 'vue'
import type { SearchPost } from '../../lib/posts'

const { posts } = defineProps<{ posts: SearchPost[] }>()
const searchButton = ref<InstanceType<typeof Button> | null>(null)
const visible = ref(false)
const query = ref('')
const keyword = computed(() => query.value.trim().toLowerCase())

const matches = computed(() => {
  if (!keyword.value) {
    return posts.slice(0, 3)
  }

  return posts.filter(({ title, summary, topic }) =>
    [title, summary, topic ?? ''].some((value) => value.toLowerCase().includes(keyword.value)),
  )
})

const status = computed(() => {
  if (!posts.length) {
    return '暂无已发布文章。'
  }

  if (!keyword.value) {
    return '近期文章'
  }

  return matches.value.length
    ? matches.value.length + ' 篇文章'
    : '没有找到相关文章，试试其他关键词。'
})

function openSearch() {
  query.value = ''
  visible.value = true
}

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
      搜索文章
    </Button>
  </form>
  <Modal
    v-model:visible="visible"
    title="搜索文章"
    width="min(448px, calc(100% - 32px))"
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
      aria-label="标题、摘要或主题"
      placeholder="标题、摘要或主题"
      auto-focus
    />
    <Text component="p" type="secondary" role="status">{{ status }}</Text>
    <List v-if="matches.length" split>
      <ListItem v-for="post in matches" :key="post.href">
        <Text :link="{ href: post.href }">{{ post.title }}</Text>
      </ListItem>
    </List>
  </Modal>
</template>
