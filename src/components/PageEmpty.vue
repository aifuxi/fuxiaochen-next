<script setup lang="ts">
import '@aifuxi/semi-theme-default/empty.css'
import IllustrationNoContent from '@aifuxi/semi-illustrations-vue/illustrations/IllustrationNoContent'
import IllustrationNoContentDark from '@aifuxi/semi-illustrations-vue/illustrations/IllustrationNoContentDark'
import IllustrationNotFound from '@aifuxi/semi-illustrations-vue/illustrations/IllustrationNotFound'
import IllustrationNotFoundDark from '@aifuxi/semi-illustrations-vue/illustrations/IllustrationNotFoundDark'
import { Empty } from '@aifuxi/semi-ui-vue/empty'

const { heading = 'h2', notFound = false } = defineProps<{
  title: string
  description?: string
  heading?: 'h1' | 'h2'
  notFound?: boolean
}>()

const lightIllustration = notFound ? IllustrationNotFound : IllustrationNoContent
const darkIllustration = notFound ? IllustrationNotFoundDark : IllustrationNoContentDark
</script>

<template>
  <Empty class="page-empty">
    <template #image>
      <span class="empty-illustration" aria-hidden="true">
        <component :is="lightIllustration" class="empty-light" />
        <component :is="darkIllustration" class="empty-dark" />
      </span>
    </template>
    <template #description>
      <component :is="heading" class="empty-heading">{{ title }}</component>
      <p v-if="description" class="empty-description">{{ description }}</p>
    </template>
    <div class="empty-actions">
      <slot />
    </div>
  </Empty>
</template>

<style scoped>
.page-empty {
  padding: clamp(24px, 6vw, 56px) 16px;
  border: 1px solid var(--semi-color-border);
  border-radius: var(--semi-border-radius-large);
  background: var(--semi-color-bg-1);
}

.empty-illustration {
  display: block;
  inline-size: clamp(112px, 25vw, 160px);
  aspect-ratio: 1;
}

.empty-illustration :deep(svg) {
  display: block;
  inline-size: 100%;
  block-size: 100%;
}

.empty-illustration :deep(.empty-dark),
body[theme-mode='dark'] .empty-illustration :deep(.empty-light) {
  display: none;
}

body[theme-mode='dark'] .empty-illustration :deep(.empty-dark) {
  display: block;
}

.empty-heading {
  margin: 0;
  color: var(--semi-color-text-0);
  font-size: 1.25rem;
  line-height: 1.4;
}

h1.empty-heading {
  font-size: 1.75rem;
}

.empty-description {
  margin: 8px 0 0;
  line-height: 1.65;
}

.empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 16px;
}
</style>
