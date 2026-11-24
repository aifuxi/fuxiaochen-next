<script setup lang="ts">
import IconGithubLogo from '@aifuxi/semi-icons-vue/icons/IconGithubLogo'
import { project } from '../config/site'
</script>

<template>
  <a class="site-link icon-label" :href="project.source">
    <IconGithubLogo aria-hidden="true" />
    查看源码
  </a>
</template>
