<script setup lang="ts">
import IconCodeHighlight from '@aifuxi/semi-icons-lab-vue/icons/IconCodeHighlight'
import IconConfig from '@aifuxi/semi-icons-lab-vue/icons/IconConfig'
import IconGrid from '@aifuxi/semi-icons-lab-vue/icons/IconGrid'
import { topics } from '../config/site'

const icons = {
  frontend: IconCodeHighlight,
  components: IconGrid,
  tooling: IconConfig,
}
</script>

<template>
  <ul class="topic-links">
    <li v-for="topic in topics" :key="topic.id">
      <a :href="'/categories/' + topic.id + '/'" class="topic-link">
        <span class="topic-icon" aria-hidden="true">
          <component :is="icons[topic.id]" />
        </span>
        <span class="topic-label">
          <strong>{{ topic.title }}</strong>
          <span>{{ topic.summary }}</span>
        </span>
      </a>
    </li>
  </ul>
</template>

<style scoped>
.topic-links {
  margin: 0;
  padding: 0;
  list-style: none;
}

.topic-links li + li {
  border-block-start: 1px solid var(--semi-color-border);
}

.topic-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  color: var(--semi-color-text-0);
  text-decoration: none;
  border-radius: var(--semi-border-radius-medium);
}

.topic-link:hover {
  background: var(--semi-color-fill-0);
}

.topic-link:is(:hover, :focus-visible) strong {
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.topic-icon {
  display: grid;
  flex: 0 0 36px;
  place-items: center;
  block-size: 36px;
  border-radius: var(--semi-border-radius-medium);
  background: var(--semi-color-fill-0);
  color: var(--semi-color-primary);
}

.topic-label {
  display: grid;
  gap: 2px;
  line-height: 1.5;
}

.topic-label > span {
  color: var(--semi-color-text-1);
  font-size: 0.8125rem;
}
</style>
