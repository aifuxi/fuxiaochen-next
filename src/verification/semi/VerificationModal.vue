<script setup lang="ts">
import { Button } from '@aifuxi/semi-ui-vue/button'
import { Modal } from '@aifuxi/semi-ui-vue/modal'
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <Button @click="open = true">打开验证弹窗</Button>
  <Modal
    v-model:visible="open"
    title="Semi 弹窗验证"
    ok-text="关闭"
    :ok-button-props="{ 'aria-label': '关闭' }"
    size="small"
    :has-cancel="false"
    :closable="false"
    :close-on-esc="true"
    :mask-closable="false"
    :motion="false"
    @ok="open = false"
  >
    <p>这段内容由 Vue 客户端交互打开。</p>
  </Modal>
</template>
