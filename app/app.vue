<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { computeNayinResult } from './composables/useNayinCalculator.js'
import { messages } from './i18n/messages.js'
import { elementCompass, elementOrder } from './utils/elements.js'

const locale = ref('zh-Hant')
const birthDate = ref('')
const birthTime = ref('12:00')
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei')
const mode = ref('gregorian')
const unknownHour = ref(false)
const error = ref('')
const result = ref(null)
const stageFresh = ref(false)

const locales = [
  { code: 'zh-Hant', label: '繁中' },
  { code: 'zh-Hans', label: '简中' }
]

const baguaRing = [
  { id: 'qian', symbol: '☰', direction: 'northwest' },
  { id: 'dui', symbol: '☱', direction: 'west' },
  { id: 'li', symbol: '☲', direction: 'south' },
  { id: 'zhen', symbol: '☳', direction: 'east' },
  { id: 'xun', symbol: '☴', direction: 'southeast' },
  { id: 'kan', symbol: '☵', direction: 'north' },
  { id: 'gen', symbol: '☶', direction: 'northeast' },
  { id: 'kun', symbol: '☷', direction: 'southwest' }
]

const text = computed(() => messages[locale.value])

const dominantElement = computed(() => {
  if (!result.value) {
    return null
  }

  return elementOrder.reduce((winner, key) => {
    if (!winner) {
      return key
    }
    return result.value.totals[key] > result.value.totals[winner] ? key : winner
  }, null)
})

function t(path) {
  return path.split('.').reduce((acc, key) => acc?.[key], text.value) || path
}

let freshTimer = null

function onSubmit() {
  if (!birthDate.value) {
    error.value = t('errors.requiredDate')
    return
  }
  if (!timezone.value) {
    error.value = t('errors.requiredTimezone')
    return
  }

  error.value = ''
  result.value = computeNayinResult({
    date: birthDate.value,
    time: unknownHour.value ? undefined : birthTime.value,
    timezone: timezone.value,
    mode: mode.value
  })

  if (freshTimer) {
    clearTimeout(freshTimer)
  }
  stageFresh.value = true
  freshTimer = setTimeout(() => {
    stageFresh.value = false
  }, 650)
}

function elementStrength(key) {
  if (!result.value) {
    return 0
  }
  const max = Math.max(...elementOrder.map((item) => result.value.totals[item]))
  if (!max) {
    return 0
  }
  return result.value.totals[key] / max
}

function elementNodeStyle(key) {
  return { '--strength': elementStrength(key).toFixed(3) }
}

onBeforeUnmount(() => {
  if (freshTimer) {
    clearTimeout(freshTimer)
  }
})
</script>

<template>
  <main class="page">
    <header class="topbar panel">
      <div>
        <p class="eyebrow">Nayin · Wuxing · Bagua</p>
        <h1>{{ t('app.title') }}</h1>
      </div>
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
    </header>

    <section class="content-grid">
      <section class="panel form-panel">
        <label>
          <span>{{ t('form.birthDate') }}</span>
          <input v-model="birthDate" type="date">
        </label>

        <label>
          <span>{{ t('form.birthTime') }}</span>
          <input v-model="birthTime" :disabled="unknownHour" type="time">
        </label>

        <label class="inline-check">
          <input v-model="unknownHour" type="checkbox">
          <span>{{ t('form.unknownHour') }}</span>
        </label>

        <label>
          <span>{{ t('form.timezone') }}</span>
          <input v-model="timezone" type="text" placeholder="Asia/Taipei">
        </label>

        <fieldset>
          <legend>{{ t('form.mode.title') }}</legend>
          <label class="mode-option">
            <input v-model="mode" type="radio" value="gregorian">
            <span>{{ t('form.mode.gregorian') }}</span>
          </label>
          <label class="mode-option">
            <input v-model="mode" type="radio" value="traditional">
            <span>{{ t('form.mode.traditional') }}</span>
          </label>
        </fieldset>

        <button type="button" class="submit" @click="onSubmit">{{ t('form.submit') }}</button>
        <p v-if="error" class="error">{{ error }}</p>
      </section>

      <section class="panel result-panel">
        <header class="result-header">
          <h2>{{ t('bagua.title') }}</h2>
          <p class="rule" v-if="result">{{ t('result.rule') }}: {{ t(`rules.${result.meta.rule}`) }}</p>
        </header>

        <div :class="['bagua-stage', { 'is-fresh': stageFresh, 'has-result': !!result }]">
          <ul class="bagua-ring" aria-hidden="true">
            <li v-for="item in baguaRing" :key="item.id">
              <span class="trigram-symbol">{{ item.symbol }}</span>
              <span class="trigram-name">{{ t(`bagua.trigrams.${item.id}`) }}</span>
              <span class="trigram-direction">{{ t(`bagua.directions.${item.direction}`) }}</span>
            </li>
          </ul>

          <div class="taiji-center">
            <p class="center-title">{{ t('bagua.center') }}</p>
            <p class="center-total" v-if="result">{{ t('bagua.highlight') }}: {{ t(`elements.${dominantElement}`) }}</p>
            <p class="center-total" v-else>-</p>
          </div>

          <button
            v-for="key in elementOrder"
            :key="key"
            type="button"
            :class="[
              'element-node',
              `pos-${elementCompass[key]}`,
              `element-${key}`,
              { active: result, dominant: result && dominantElement === key }
            ]"
            :style="result ? elementNodeStyle(key) : null"
          >
            <span>{{ t(`elements.${key}`) }}</span>
            <strong>{{ result ? result.totals[key] : '-' }}</strong>
          </button>
        </div>

        <div class="pillars" v-if="result">
          <article v-for="k in ['year', 'month', 'day', 'hour']" :key="k" class="pillar-card">
            <h3>{{ t(`result.pillars.${k}`) }}</h3>
            <p>{{ t('result.ganzhi') }}: {{ result.pillars[k].ganzhi || '-' }}</p>
            <p>{{ t('result.nayin') }}: {{ result.pillars[k].nayin || '-' }}</p>
            <p>{{ t('result.element') }}: {{ result.pillars[k].element ? t(`elements.${result.pillars[k].element}`) : '-' }}</p>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>
