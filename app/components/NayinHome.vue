<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { computeNayinResult } from '../composables/useNayinCalculator.js'
import { buildFortuneRequestPayload } from '../utils/fortune-request.js'
import { messages } from '../i18n/messages.js'
import { elementOrder } from '../utils/elements.js'
import { nineGridCells } from '../utils/nine-grid.js'
import { buildTimezoneOptions, resolveDefaultTimezone } from '../utils/timezones.js'
import { renderMarkdown } from '../utils/markdown.js'
import { getNayinGuideByName } from '../utils/nayin-guide.js'
import { createClientFortuneLogger, isClientFortuneDebugEnabled } from '../utils/debug-log.js'
import { useRoute, useRouter, useRuntimeConfig } from '#imports'

const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()
const routeLang = route.query.lang
const initialLocale = routeLang === 'zh-Hans' ? 'zh-Hans' : 'zh-Hant'
const locale = ref(initialLocale)
const birthDate = ref('')
const birthTime = ref('12:00')
const timezone = ref(resolveDefaultTimezone())
const mode = ref('gregorian')
const unknownHour = ref(true)
const error = ref('')
const result = ref(null)
const stageFresh = ref(false)
const gender = ref('')
const fortuneType = ref('year')
const fortuneLoading = ref(false)
const fortuneError = ref('')
const fortuneText = ref('')
const focusArea = ref('overall')
const copyState = ref('idle')
const debugEnabled = computed(() => isClientFortuneDebugEnabled(runtimeConfig.public?.debugFortune))
const debugLog = createClientFortuneLogger({
  scope: 'ui.nayin-home',
  enabled: () => debugEnabled.value
})

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
const showChartPrivacyWarning = computed(() => (!unknownHour.value))
const fortuneHtml = computed(() => renderMarkdown(fortuneText.value))

function t(path) {
  return path.split('.').reduce((acc, key) => acc?.[key], text.value) || path
}

let freshTimer = null
let copyTimer = null
const MIN_FORTUNE_WAIT_MS = 3000

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function onSubmit() {
  debugLog('step1.submit.start', {
    hasBirthDate: Boolean(birthDate.value),
    hasBirthTime: Boolean(birthTime.value),
    unknownHour: unknownHour.value,
    timezone: timezone.value,
    mode: mode.value
  })
  if (!birthDate.value) {
    error.value = t('errors.requiredDate')
    debugLog('step1.submit.validation-failed', { reason: 'missing-birth-date' })
    return
  }
  if (!timezone.value) {
    error.value = t('errors.requiredTimezone')
    debugLog('step1.submit.validation-failed', { reason: 'missing-timezone' })
    return
  }

  error.value = ''
  result.value = computeNayinResult({
    date: birthDate.value,
    time: unknownHour.value ? undefined : birthTime.value,
    timezone: timezone.value,
    mode: mode.value
  })
  debugLog('step1.submit.success', {
    rule: result.value?.meta?.rule || '',
    totals: result.value?.totals || {}
  })

  if (freshTimer) {
    clearTimeout(freshTimer)
  }
  stageFresh.value = true
  fortuneText.value = ''
  fortuneError.value = ''
  freshTimer = setTimeout(() => {
    stageFresh.value = false
  }, 650)
}

const canFortune = computed(() => !!result.value && !fortuneLoading.value && Boolean(gender.value))

async function onFortuneSubmit() {
  const startedAt = Date.now()
  debugLog('step2.submit.start', {
    hasResult: Boolean(result.value),
    gender: gender.value,
    fortuneType: fortuneType.value,
    focusArea: focusArea.value
  })
  if (!result.value) {
    fortuneError.value = t('fortune.needFiveElements')
    debugLog('step2.submit.validation-failed', { reason: 'missing-five-elements' })
    return
  }
  if (!gender.value) {
    fortuneError.value = t('fortune.genderRequired')
    debugLog('step2.submit.validation-failed', { reason: 'missing-gender' })
    return
  }

  fortuneLoading.value = true
  fortuneError.value = ''
  fortuneText.value = ''
  copyState.value = 'idle'

  try {
    const payload = buildFortuneRequestPayload({
      totals: result.value.totals,
      gender: gender.value,
      fortuneType: fortuneType.value,
      focusAreas: [focusArea.value]
    })
    debugLog('step2.payload.built', {
      mode: payload?.metadata?.mode || '',
      year: payload?.metadata?.year || null,
      hasGender: Boolean(payload?.metadata?.gender),
      focusAreas: payload?.metadata?.focus_areas || []
    })

    const response = await fetch('/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const contentType = response.headers.get('content-type') || ''
    const rawText = await response.text()
    let data = null
    if (contentType.includes('application/json')) {
      try {
        data = rawText ? JSON.parse(rawText) : {}
      } catch (parseErr) {
        debugLog('step2.api.invalid-json', {
          status: response.status,
          contentType,
          parseError: parseErr?.message || 'unknown',
          bodyPreview: rawText.slice(0, 160)
        })
      }
    }
    debugLog('step2.api.response', {
      status: response.status,
      ok: response.ok,
      contentType
    })
    if (!response.ok) {
      const statusHint = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ''}`
      const message = data?.data?.error?.message || data?.message || statusHint
      throw new Error(message)
    }

    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_FORTUNE_WAIT_MS) {
      await wait(MIN_FORTUNE_WAIT_MS - elapsed)
    }

    fortuneText.value = data?.choices?.[0]?.message?.content || ''
    if (!fortuneText.value) {
      fortuneError.value = t('fortune.emptyResult')
      debugLog('step2.result.empty', { elapsedMs: Date.now() - startedAt })
    } else {
      debugLog('step2.result.success', {
        textLength: fortuneText.value.length,
        elapsedMs: Date.now() - startedAt
      })
    }
  } catch (err) {
    const elapsed = Date.now() - startedAt
    if (elapsed < MIN_FORTUNE_WAIT_MS) {
      await wait(MIN_FORTUNE_WAIT_MS - elapsed)
    }
    fortuneError.value = err?.message || t('fortune.requestFailed')
    debugLog('step2.result.failed', {
      message: err?.message || 'request-failed',
      elapsedMs: Date.now() - startedAt
    })
  } finally {
    fortuneLoading.value = false
    debugLog('step2.submit.done', { loading: fortuneLoading.value })
  }
}

async function onCopyFortune() {
  if (!fortuneText.value) {
    debugLog('copy.skip', { reason: 'empty-text' })
    return
  }

  try {
    if (globalThis?.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(fortuneText.value)
    } else {
      throw new Error('Clipboard API unavailable')
    }
    copyState.value = 'copied'
    debugLog('copy.success', { textLength: fortuneText.value.length })
    if (copyTimer) {
      clearTimeout(copyTimer)
    }
    copyTimer = setTimeout(() => {
      copyState.value = 'idle'
    }, 1800)
  } catch {
    fortuneError.value = t('fortune.copyFailed')
    debugLog('copy.failed')
  }
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

function nayinGuideHref(nayin) {
  const item = getNayinGuideByName(nayin)
  if (!item) {
    return `/nayin-guide?lang=${locale.value}`
  }
  return `/nayin-guide?lang=${locale.value}#${item.id}`
}

watch(locale, async (value) => {
  if (route.query.lang === value) {
    return
  }
  await router.replace({ query: { ...route.query, lang: value } })
})

onBeforeUnmount(() => {
  if (freshTimer) {
    clearTimeout(freshTimer)
  }
  if (copyTimer) {
    clearTimeout(copyTimer)
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
        <NuxtLink :to="`/about?lang=${locale}`" class="about-link">{{ t('nav.about') }}</NuxtLink>
        <NuxtLink :to="`/nayin-guide?lang=${locale}`" class="about-link">{{ t('nav.guide') }}</NuxtLink>
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

    <section class="content-grid flow-grid">
      <section class="panel form-panel step1-panel">
        <header class="result-header">
          <h2>{{ t('form.step1Title') }}</h2>
        </header>

        <label>
          <span>{{ t('form.birthDate') }}</span>
          <input v-model="birthDate" type="date">
        </label>

        <label>
          <span>{{ t('form.birthTime') }}</span>
          <input v-model="birthTime" :disabled="unknownHour" type="time">
        </label>
        <p v-if="showChartPrivacyWarning" class="privacy-warning">{{ t('warnings.chartPrivacy') }}</p>

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

      <section class="panel result-panel bagua-panel">
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
      </section>

      <section class="panel form-panel step2-panel">
        <div class="fortune-panel standalone">
          <h3>{{ t('fortune.title') }}</h3>
          <p class="fortune-hint">{{ t('fortune.hint') }}</p>

          <label>
            <span>{{ t('fortune.gender') }}</span>
            <select v-model="gender">
              <option value="">{{ t('fortune.genderPlaceholder') }}</option>
              <option value="male">{{ t('fortune.genders.male') }}</option>
              <option value="female">{{ t('fortune.genders.female') }}</option>
            </select>
          </label>

          <fieldset>
            <legend>{{ t('fortune.typeTitle') }}</legend>
            <label class="mode-option">
              <input v-model="fortuneType" type="radio" value="year">
              <span>{{ t('fortune.types.year2026') }}</span>
            </label>
            <label class="mode-option">
              <input v-model="fortuneType" type="radio" value="life">
              <span>{{ t('fortune.types.life') }}</span>
            </label>
          </fieldset>

          <fieldset>
            <legend>{{ t('fortune.focusTitle') }}</legend>
            <select v-model="focusArea">
              <option value="overall">{{ t('fortune.focuses.overall') }}</option>
              <option value="health">{{ t('fortune.focuses.health') }}</option>
              <option value="career">{{ t('fortune.focuses.career') }}</option>
              <option value="love">{{ t('fortune.focuses.love') }}</option>
            </select>
          </fieldset>

          <button
            type="button"
            class="submit fortune-submit"
            :disabled="!canFortune"
            @click="onFortuneSubmit"
          >
            {{ fortuneLoading ? t('fortune.loading') : t('fortune.submit') }}
          </button>

          <p v-if="fortuneLoading" class="fortune-loading">{{ t('fortune.loading') }}</p>
          <p v-if="!result" class="fortune-lock">{{ t('fortune.needFiveElements') }}</p>
          <p v-if="fortuneError" class="error">{{ fortuneError }}</p>
        </div>
      </section>

      <section class="panel result-panel output-panel">
        <header class="result-header">
          <h2>{{ t('result.title') }}</h2>
        </header>

        <article v-if="fortuneText" class="fortune-result">
          <h3>{{ t('fortune.resultTitle') }}</h3>
          <div class="fortune-markdown" v-html="fortuneHtml" />
          <div class="fortune-actions">
            <button type="button" class="fortune-copy" @click="onCopyFortune">
              {{ t('fortune.copy') }}
            </button>
            <span v-if="copyState === 'copied'" class="copy-status">{{ t('fortune.copied') }}</span>
          </div>
        </article>

        <div class="pillars" v-if="result">
          <article v-for="k in ['year', 'month', 'day', 'hour']" :key="k" class="pillar-card">
            <h3>{{ t(`result.pillars.${k}`) }}</h3>
            <p>{{ t('result.ganzhi') }}: {{ result.pillars[k].ganzhi || '-' }}</p>
            <p>
              {{ t('result.nayin') }}: {{ result.pillars[k].nayin || '-' }}
              <NuxtLink
                v-if="result.pillars[k].nayin && result.pillars[k].nayin !== '-'"
                class="pillar-guide-link"
                :to="nayinGuideHref(result.pillars[k].nayin)"
              >
                {{ t('nav.viewGuide') }}
              </NuxtLink>
            </p>
            <p>{{ t('result.element') }}: {{ result.pillars[k].element ? t(`elements.${result.pillars[k].element}`) : '-' }}</p>
          </article>
        </div>
      </section>
    </section>
  </main>
</template>
