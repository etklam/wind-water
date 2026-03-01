<script setup>
import { computed, ref, watch } from 'vue'
import { groupNayinGuideByElement } from '../utils/nayin-guide.js'
import { messages } from '../i18n/messages.js'
import { useRoute, useRouter } from '#imports'

const route = useRoute()
const router = useRouter()
const routeLang = route.query.lang
const locale = ref(routeLang === 'zh-Hans' ? 'zh-Hans' : 'zh-Hant')

const locales = [
  { code: 'zh-Hant', label: '繁中' },
  { code: 'zh-Hans', label: '简中' }
]

const text = computed(() => messages[locale.value])
const groups = computed(() => groupNayinGuideByElement(locale.value))
const elementLabelMap = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水'
}

function t(path) {
  return path.split('.').reduce((acc, key) => acc?.[key], text.value) || path
}

watch(locale, async (value) => {
  if (route.query.lang === value) {
    return
  }
  await router.replace({ query: { ...route.query, lang: value } })
})
</script>

<template>
  <main class="page guide-page">
    <header class="topbar panel">
      <div>
        <p class="eyebrow">{{ t('guide.eyebrow') }}</p>
        <h1>{{ t('guide.title') }}</h1>
      </div>
      <div class="top-actions">
        <NuxtLink :to="`/?lang=${locale}`" class="about-link">{{ t('nav.backToCalculator') }}</NuxtLink>
        <div class="lang-switch" role="group" aria-label="language switcher">
          <button
            v-for="item in locales"
            :key="item.code"
            :class="['lang-btn', { active: locale === item.code }]"
            type="button"
            @click="locale = item.code"
          >
            {{ item.label }}
          </button>
        </div>
      </div>
    </header>

    <section class="panel about-section">
      <h2>{{ t('guide.howToReadTitle') }}</h2>
      <p>{{ t('guide.howToRead1') }}</p>
      <p>{{ t('guide.howToRead2') }}</p>
    </section>

    <section v-for="group in groups" :key="group.element" class="panel guide-section">
      <header class="guide-section-header">
        <h2>{{ t(`guide.sections.${group.element}.title`) }}</h2>
        <p>{{ t(`guide.sections.${group.element}.summary`) }}</p>
      </header>

      <div class="guide-list">
        <article v-for="item in group.items" :id="item.id" :key="item.id" class="guide-item">
          <h3>
            <span class="guide-item-name">{{ item.name }}</span>
            <span class="guide-item-tag">{{ elementLabelMap[group.element] }}</span>
          </h3>
          <p>{{ item.summary }}</p>
        </article>
      </div>
    </section>
  </main>
</template>
