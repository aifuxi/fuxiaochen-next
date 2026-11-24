<script setup lang="ts">
import { Card } from '@aifuxi/semi-ui-vue/card'
import { Col, Row } from '@aifuxi/semi-ui-vue/grid'
import { List, ListItem } from '@aifuxi/semi-ui-vue/list'
import { Space } from '@aifuxi/semi-ui-vue/space'
import { Paragraph, Text, Title } from '@aifuxi/semi-ui-vue/typography'
import { project, site, topics } from '../config/site'
import type { SearchPost } from '../lib/posts'
import PostList from './PostList.vue'

defineProps<{ recentPosts: SearchPost[] }>()
</script>

<template>
  <Row type="flex" :gutter="[24, 24]">
    <Col :span="24" :md="14" class="bento-column">
      <Card class="bento-card" header-line>
        <template #title><Title :heading="2">近期文章</Title></template>
        <template #headerExtraContent><Text :link="{ href: '/blog/' }">全部文章</Text></template>
        <PostList :posts="recentPosts" />
      </Card>
    </Col>
    <Col :span="24" :md="10" class="bento-column">
      <Card class="bento-card" header-line>
        <template #title><Title :heading="2">按主题浏览</Title></template>
        <List split>
          <ListItem v-for="topic in topics" :key="topic.id">
            <Space vertical align="start" spacing="tight">
              <Text :link="{ href: '/categories/' + topic.id + '/' }" strong>
                {{ topic.title }}
              </Text>
              <Text type="secondary">{{ topic.summary }}</Text>
            </Space>
          </ListItem>
        </List>
      </Card>
    </Col>
    <Col :span="24" :md="14" class="bento-column">
      <Card class="bento-card" header-line>
        <template #title><Title :heading="2">开源项目</Title></template>
        <template #headerExtraContent
          ><Text :link="{ href: project.source }">查看源码</Text></template
        >
        <Space vertical align="start">
          <Text :link="{ href: '/projects/' }" strong>{{ project.title }}</Text>
          <Text type="secondary">{{ project.summary }}</Text>
        </Space>
      </Card>
    </Col>
    <Col :span="24" :md="10" class="bento-column">
      <Card class="bento-card" header-line>
        <template #title><Title :heading="2">关于作者</Title></template>
        <Paragraph>
          我是
          <Text :link="{ href: '/about/' }">{{ site.author }}</Text>，在这里整理开发笔记和开源项目。
        </Paragraph>
      </Card>
    </Col>
  </Row>
</template>
