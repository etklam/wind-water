<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { computeNayinResult } from '../composables/useNayinCalculator.js'
import { messages } from '../i18n/messages.js'
import { elementOrder } from '../utils/elements.js'
import { nineGridCells } from '../utils/nine-grid.js'
import { buildTimezoneOptions } from '../utils/timezones.js'

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

const text = computed(() => messages[locale.value])
const timezoneOptions = computed(() => buildTimezoneOptions(timezone.value, locale.value))
const frameSectorPoints = {
  south: '50,4 82,18 64,36 50,30',
  southwest: '82,18 96,50 70,50 64,36',
  west: '96,50 82,82 64,64 70,50',
  northwest: '82,82 50,96 50,70 64,64',
  north: '50,96 18,82 36,64 50,70',
  northeast: '18,82 4,50 30,50 36,64',
  east: '4,50 18,18 36,36 30,50',
  southeast: '18,18 50,4 50,30 36,36'
}

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

function cellStyle(cell) {
  if (!result.value) {
    return null
  }
  return { '--strength': elementStrength(cell.element).toFixed(3) }
}

function cellClass(cell) {
  return [
    'bagua-sector',
    `sector-${cell.slot}`,
    cell.element ? `element-${cell.element}` : '',
    {
      active: !!result.value,
      dominant: !!result.value && dominantElement.value === cell.element
    }
  ]
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
      <div class="top-actions">
        <NuxtLink to="/about" class="about-link">使用說明</NuxtLink>
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
          <select v-model="timezone">
            <option v-for="item in timezoneOptions" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
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
          <svg class="bagua-frame" viewBox="0 0 100 100" aria-hidden="true">
            <polygon
              v-for="cell in nineGridCells"
              :key="`${cell.slot}-frame`"
              :points="frameSectorPoints[cell.slot]"
              :class="[
                'frame-sector',
                `element-${cell.element}`,
                {
                  active: !!result,
                  dominant: !!result && dominantElement === cell.element
                }
              ]"
              :style="cellStyle(cell)"
            />
            <polygon class="frame-ring outer" points="50,4 82,18 96,50 82,82 50,96 18,82 4,50 18,18" />
            <polygon class="frame-ring inner" points="50,30 64,36 70,50 64,64 50,70 36,64 30,50 36,36" />
            <line class="frame-spoke" x1="50" y1="30" x2="50" y2="4" />
            <line class="frame-spoke" x1="64" y1="36" x2="82" y2="18" />
            <line class="frame-spoke" x1="70" y1="50" x2="96" y2="50" />
            <line class="frame-spoke" x1="64" y1="64" x2="82" y2="82" />
            <line class="frame-spoke" x1="50" y1="70" x2="50" y2="96" />
            <line class="frame-spoke" x1="36" y1="64" x2="18" y2="82" />
            <line class="frame-spoke" x1="30" y1="50" x2="4" y2="50" />
            <line class="frame-spoke" x1="36" y1="36" x2="18" y2="18" />
          </svg>

          <article class="bagua-center element-earth">
            <p class="center-title">{{ t('bagua.center') }}</p>
            <p class="center-total">{{ result ? result.totals.earth : '-' }}</p>
          </article>

          <article
            v-for="cell in nineGridCells"
            :key="cell.slot"
            :class="cellClass(cell)"
            :style="cellStyle(cell)"
          >
            <span class="trigram-symbol">{{ cell.symbol }}</span>
            <span class="trigram-name">{{ t(`bagua.trigrams.${cell.trigram}`) }}</span>
            <span class="trigram-direction">{{ t(`bagua.directions.${cell.direction}`) }}</span>
            <span class="element-name">{{ t(`elements.${cell.element}`) }}</span>
            <strong class="element-value">{{ result ? result.totals[cell.element] : '-' }}</strong>
          </article>
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
