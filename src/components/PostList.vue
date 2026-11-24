<script setup lang="ts">
import { List, ListItem } from '@aifuxi/semi-ui-vue/list'
import { Space } from '@aifuxi/semi-ui-vue/space'
import { Text } from '@aifuxi/semi-ui-vue/typography'
import type { SearchPost } from '../lib/posts'

const { empty = '暂无已发布文章。' } = defineProps<{
  posts: SearchPost[]
  empty?: string
}>()
</script>

<template>
  <List v-if="posts.length" split>
    <ListItem v-for="post in posts" :key="post.href">
      <Space vertical align="start" spacing="tight">
        <Text :link="{ href: post.href }" strong>{{ post.title }}</Text>
        <Text type="secondary">{{ post.summary }}</Text>
      </Space>
    </ListItem>
  </List>
  <Text v-else component="p" type="secondary">{{ empty }}</Text>
</template>
