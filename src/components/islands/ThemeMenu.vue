<script setup lang="ts">
/* global document, window, localStorage, MediaQueryList, StorageEvent, KeyboardEvent, HTMLElement */
import '@aifuxi/semi-theme-default/dropdown.css'
import '@aifuxi/semi-theme-default/shared/foundation-portal-portal.css'
import IconDesktop from '@aifuxi/semi-icons-vue/icons/IconDesktop'
import IconMoon from '@aifuxi/semi-icons-vue/icons/IconMoon'
import IconSun from '@aifuxi/semi-icons-vue/icons/IconSun'
import IconTick from '@aifuxi/semi-icons-vue/icons/IconTick'
import { Button } from '@aifuxi/semi-ui-vue/button'
import { Dropdown, DropdownMenu, type DropdownExposed } from '@aifuxi/semi-ui-vue/dropdown'
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

const options = {
  system: { label: '系统', icon: IconDesktop },
  light: { label: '亮色', icon: IconSun },
  dark: { label: '暗色', icon: IconMoon },
}

type Theme = keyof typeof options

const storageKey = 'blog-theme'
const theme = ref<Theme>('system')
const currentOption = computed(() => options[theme.value])
const menuOpen = ref(false)
const dropdown = useTemplateRef<DropdownExposed>('dropdown')
let system: MediaQueryList | undefined

function applyTheme() {
  const root = document.documentElement
  const choice = theme.value
  if (choice === 'system') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = choice
  }

  if (choice === 'dark' || (choice === 'system' && system?.matches)) {
    document.body.setAttribute('theme-mode', 'dark')
  } else {
    document.body.removeAttribute('theme-mode')
  }
}

function syncStoredTheme(event: StorageEvent) {
  if (event.key === storageKey || event.key === null) {
    theme.value =
      event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : 'system'

    applyTheme()
  }
}

function closeMenu() {
  dropdown.value?.focusTrigger()
  menuOpen.value = false
}

function chooseTheme(choice: Theme) {
  theme.value = choice
  applyTheme()
  closeMenu()

  try {
    if (choice === 'system') {
      localStorage.removeItem(storageKey)
    } else {
      localStorage.setItem(storageKey, choice)
    }
  } catch {
    // 存储不可用时，本页仍应用所选主题。
  }
}

function handleMenuKey(event: KeyboardEvent) {
  if (event.key === 'Tab') {
    closeMenu()
  } else if (
    (event.key === 'Home' || event.key === 'End') &&
    event.currentTarget instanceof HTMLElement
  ) {
    event.preventDefault()

    const items = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitemradio"]'),
    )

    items.forEach((item) => {
      item.tabIndex = -1
    })

    const next = event.key === 'Home' ? items[0] : items.at(-1)
    if (next) {
      next.tabIndex = 0
      next.focus()
    }
  }
}

onMounted(() => {
  const stored = document.documentElement.dataset.theme
  theme.value = stored === 'light' || stored === 'dark' ? stored : 'system'
  system = window.matchMedia('(prefers-color-scheme: dark)')
  applyTheme()
  system.addEventListener('change', applyTheme)
  window.addEventListener('storage', syncStoredTheme)
})

onBeforeUnmount(() => {
  system?.removeEventListener('change', applyTheme)
  window.removeEventListener('storage', syncStoredTheme)
})
</script>

<template>
  <Dropdown
    ref="dropdown"
    v-model:visible="menuOpen"
    trigger="click"
    position="bottomRight"
    role="presentation"
    class="theme-menu-popup"
    wrapper-id="site-theme-popup"
    :spacing="8"
    :motion="false"
  >
    <Button
      class="theme-menu-trigger"
      type="tertiary"
      theme="light"
      html-type="button"
      :aria-label="'主题外观，当前' + (theme === 'system' ? '跟随系统' : currentOption.label)"
      :aria-controls="menuOpen ? 'site-theme-popup' : undefined"
      @keydown.enter.prevent
      @keydown.space.prevent
      @keydown.down.prevent="menuOpen = true"
    >
      <template #icon>
        <component :is="currentOption.icon" aria-hidden="true" />
      </template>
    </Button>

    <template #content>
      <DropdownMenu class="theme-options" aria-label="主题外观" @keydown="handleMenuKey">
        <li
          v-for="(option, choice) in options"
          :key="choice"
          class="theme-option"
          role="menuitemradio"
          tabindex="-1"
          aria-disabled="false"
          :aria-checked="theme === choice"
          @click="chooseTheme(choice)"
          @keydown.enter.prevent
          @keydown.space.prevent
        >
          <component :is="option.icon" aria-hidden="true" />
          <span>{{ option.label }}</span>
          <IconTick v-if="theme === choice" aria-hidden="true" />
        </li>
      </DropdownMenu>
    </template>
  </Dropdown>
</template>

<style scoped>
.theme-menu-trigger {
  min-inline-size: 40px;
  min-block-size: 40px;
  padding: 0;
}

.theme-menu-trigger[aria-expanded='true'] {
  background: var(--semi-color-fill-1);
}

.theme-menu-trigger :deep(.semi-icon) {
  font-size: 18px;
}

:global(.theme-menu-popup) {
  border: 1px solid var(--semi-color-border);
  border-radius: var(--semi-border-radius-large);
}

.theme-options {
  display: grid;
  gap: 2px;
  min-inline-size: 156px;
  padding: 6px;
}

.theme-option {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 16px;
  align-items: center;
  gap: 8px;
  min-block-size: 40px;
  padding-inline: 8px;
  border-radius: var(--semi-border-radius-medium);
  color: var(--semi-color-text-0);
  cursor: pointer;
}

.theme-option:is(:hover, :focus-visible) {
  background: var(--semi-color-fill-0);
}

.theme-option:focus-visible {
  outline: 2px solid var(--semi-color-focus-border);
  outline-offset: -2px;
}

.theme-option[aria-checked='true'] {
  color: var(--semi-color-link);
  font-weight: 600;
}
</style>
