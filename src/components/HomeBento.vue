<script setup lang="ts">
import { Card } from '@aifuxi/semi-ui-vue/card'
import { Col, Row } from '@aifuxi/semi-ui-vue/grid'
import { Space } from '@aifuxi/semi-ui-vue/space'
import { Paragraph, Text, Title } from '@aifuxi/semi-ui-vue/typography'
import { project, site } from '../config/site'
import type { PostSummary } from '../lib/posts'
import PostList from './PostList.vue'
import ProjectSource from './ProjectSource.vue'
import TopicLinks from './TopicLinks.vue'

defineProps<{ recentPosts: PostSummary[] }>()
</script>

<template>
  <Row type="flex" :gutter="[20, 20]">
    <Col :span="24" :md="14" class="bento-column">
      <Card class="bento-card">
        <template #title><Title :heading="2">近期文章</Title></template>
        <template v-if="recentPosts.length" #headerExtraContent>
          <a class="site-link" href="/blog/">全部文章</a>
        </template>
        <PostList v-if="recentPosts.length" :posts="recentPosts" />
        <Paragraph v-else type="secondary">暂无已发布文章。</Paragraph>
      </Card>
    </Col>
    <Col :span="24" :md="10" class="bento-column">
      <Card class="bento-card">
        <template #title><Title :heading="2">按主题浏览</Title></template>
        <TopicLinks />
      </Card>
    </Col>
    <Col :span="24" :md="14" class="bento-column">
      <Card class="bento-card">
        <template #title><Title :heading="2">开源项目</Title></template>
        <template #headerExtraContent><ProjectSource /></template>
        <Space vertical align="start" spacing="tight">
          <Text :link="{ href: '/projects/' }" strong>{{ project.title }}</Text>
          <Text type="secondary">{{ project.summary }}</Text>
        </Space>
      </Card>
    </Col>
    <Col :span="24" :md="10" class="bento-column">
      <Card class="bento-card">
        <template #title><Title :heading="2">关于作者</Title></template>
        <Paragraph>
          我是
          <Text :link="{ href: '/about/' }">{{ site.author }}</Text>，在这里整理开发笔记和开源项目。
        </Paragraph>
      </Card>
    </Col>
  </Row>
</template>

<style scoped>
.bento-column {
  display: flex;
  min-inline-size: 0;
}

.bento-card {
  inline-size: 100%;
  min-inline-size: 0;
}
</style>
