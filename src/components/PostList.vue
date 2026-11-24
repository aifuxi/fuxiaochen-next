<script setup lang="ts">
import type { PostSummary } from '../lib/posts'

defineProps<{ posts: PostSummary[] }>()
</script>

<template>
  <ul class="post-list">
    <li v-for="post in posts" :key="post.href" class="post-row">
      <div class="post-heading">
        <a class="site-link" :href="post.href">{{ post.title }}</a>
        <time :datetime="post.publishedAt">{{ post.publishedAt }}</time>
      </div>
      <p>{{ post.summary }}</p>
    </li>
  </ul>
</template>

<style scoped>
.post-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.post-row {
  display: grid;
  gap: 4px;
  padding-block: 14px;
  overflow-wrap: anywhere;
}

.post-row + .post-row {
  border-block-start: 1px solid var(--semi-color-border);
}

.post-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
}

.post-heading a {
  font-size: 1rem;
  font-weight: 600;
}

.post-row :is(time, p) {
  color: var(--semi-color-text-1);
}

.post-row time {
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}

.post-row p {
  margin: 0;
  line-height: 1.65;
}
</style>
