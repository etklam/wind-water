<script setup>
import { computed, ref } from 'vue'
import { computeNayinResult } from './composables/useNayinCalculator.js'
import { messages } from './i18n/messages.js'

const locale = ref('zh-Hant')
const birthDate = ref('')
const birthTime = ref('12:00')
const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Taipei')
const mode = ref('gregorian')
const unknownHour = ref(false)
const error = ref('')
const result = ref(null)

const locales = [
  { code: 'zh-Hant', label: '繁中' },
  { code: 'zh-Hans', label: '简中' }
]

const text = computed(() => messages[locale.value])

function t(path) {
  return path.split('.').reduce((acc, key) => acc?.[key], text.value) || path
}

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
}

const elementOrder = ['wood', 'fire', 'earth', 'metal', 'water']
</script>

<template>
  <main class="page">
    <header class="topbar">
      <h1>{{ t('app.title') }}</h1>
      <div class="lang-switch">
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

    <section v-if="result" class="panel result-panel">
      <h2>{{ t('result.title') }}</h2>
      <p class="rule">{{ t('result.rule') }}: {{ t(`rules.${result.meta.rule}`) }}</p>

      <div class="pillars">
        <article v-for="k in ['year', 'month', 'day', 'hour']" :key="k" class="pillar-card">
          <h3>{{ t(`result.pillars.${k}`) }}</h3>
          <p>{{ t('result.ganzhi') }}: {{ result.pillars[k].ganzhi || '-' }}</p>
          <p>{{ t('result.nayin') }}: {{ result.pillars[k].nayin }}</p>
          <p>{{ t('result.element') }}: {{ t(`elements.${result.pillars[k].element}`) || '-' }}</p>
        </article>
      </div>

      <div class="totals">
        <h3>{{ t('result.totals') }}</h3>
        <div class="total-grid">
          <p v-for="key in elementOrder" :key="key">
            {{ t(`elements.${key}`) }}: <strong>{{ result.totals[key] }}</strong>
          </p>
        </div>
      </div>
    </section>
  </main>
</template>
