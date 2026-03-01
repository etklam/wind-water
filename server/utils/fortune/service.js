import { buildFortuneCacheKey } from './key.js'
import { buildFortunePrompt } from './prompt.js'
import { computeNayinProfile } from './nayin-engine.js'
import { createServerFortuneLogger } from './debug-log.js'

function normalizeFiveElements(input) {
  if (!input || typeof input !== 'object') {
    return null
  }

  const keys = ['wood', 'fire', 'earth', 'metal', 'water']
  const out = {}
  for (const key of keys) {
    out[key] = Number(input[key] || 0)
  }
  return out
}

function buildProfileFromBirth(birthInput) {
  const nayin = computeNayinProfile(birthInput)
  return {
    pillars: nayin.pillars,
    totals: nayin.totals,
    rule: nayin.meta?.rule ?? 'unknown'
  }
}

function normalizeGender(gender) {
  const value = String(gender || '').toLowerCase()
  if (value === 'male' || value === 'female') {
    return value
  }
  return ''
}

function normalizeFocusAreas(input) {
  const allowed = new Set(['overall', 'career', 'love', 'health'])
  if (!Array.isArray(input)) {
    return []
  }
  return input
    .map((item) => String(item || '').toLowerCase())
    .filter((item) => allowed.has(item))
}

function normalizeMbti(mbti) {
  const allowed = new Set([
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ])
  const value = String(mbti || '').trim().toUpperCase()
  return allowed.has(value) ? value : ''
}

export function buildFingerprintInput({ profile }) {
  return profile.totals
}

function normalizeScope({ mode, year, gender, mbti, focusAreas }) {
  const normalizedMode = mode === 'life' ? 'life' : 'year'
  return {
    mode: normalizedMode,
    year: normalizedMode === 'year' ? Number(year || new Date().getFullYear()) : null,
    gender: normalizeGender(gender),
    mbti: normalizeMbti(mbti),
    focusArea: normalizeFocusAreas(focusAreas).join(',')
  }
}

export async function runFortuneCompletion({
  mode,
  year,
  gender,
  mbti,
  focusAreas,
  birthInput,
  fiveElements,
  userMessages = [],
  requestId = '',
  repository,
  provider
}) {
  const log = createServerFortuneLogger({ scope: 'service.run-fortune' })
  const startedAt = Date.now()
  const scope = normalizeScope({ mode, year, gender, mbti, focusAreas })
  log('scope.normalized', {
    requestId,
    mode: scope.mode,
    year: scope.year,
    hasGender: Boolean(scope.gender),
    hasMbti: Boolean(scope.mbti),
    focusAreaCount: scope.focusArea ? scope.focusArea.split(',').length : 0
  })

  let profile
  const normalizedTotals = normalizeFiveElements(fiveElements)
  if (normalizedTotals) {
    profile = { totals: normalizedTotals, source: 'provided-five-elements' }
    log('profile.source', { requestId, source: profile.source })
  } else {
    profile = buildProfileFromBirth(birthInput)
    log('profile.source', { requestId, source: 'birth-input', rule: profile.rule })
  }

  const cacheInput = buildFingerprintInput({ profile })

  const cacheKey = buildFortuneCacheKey(cacheInput)
  const cacheStartedAt = Date.now()
  log('cache.lookup.start', { requestId, cacheKey })
  const cached = await repository.findByCacheKey(cacheKey, scope)
  if (cached?.responseText) {
    log('cache.lookup.hit', {
      requestId,
      cacheKey,
      model: cached.model || 'cached-model',
      elapsedMs: Date.now() - cacheStartedAt
    })
    return {
      source: 'cache',
      cacheKey,
      text: cached.responseText,
      model: cached.model || 'cached-model',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      profile
    }
  }
  log('cache.lookup.miss', { requestId, cacheKey, elapsedMs: Date.now() - cacheStartedAt })

  const promptMessages = buildFortunePrompt({
    mode: scope.mode,
    year: scope.year,
    profile,
    gender: scope.gender,
    mbti: scope.mbti,
    focusAreas: scope.focusArea ? scope.focusArea.split(',') : [],
    userMessages
  })
  log('prompt.built', { requestId, messageCount: promptMessages.length })

  const providerStartedAt = Date.now()
  const fresh = await provider.createCompletion({
    mode: scope.mode,
    year: scope.year,
    messages: promptMessages
  })
  log('provider.completed', {
    requestId,
    model: fresh.model,
    elapsedMs: Date.now() - providerStartedAt,
    hasText: Boolean(fresh.text)
  })

  await repository.saveCache({
    cacheKey,
    mode: scope.mode,
    year: scope.year,
    requestPayload: {
      mode: scope.mode,
      year: scope.year,
      profile,
      gender: scope.gender,
      mbti: scope.mbti,
      focus_areas: scope.focusArea ? scope.focusArea.split(',') : []
    },
    responseText: fresh.text,
    model: fresh.model,
    gender: scope.gender,
    mbti: scope.mbti,
    focusArea: scope.focusArea
  })
  log('cache.saved', { requestId, cacheKey, mode: scope.mode, elapsedMs: Date.now() - startedAt })

  return {
    source: 'openai',
    cacheKey,
    text: fresh.text,
    model: fresh.model,
    usage: fresh.usage,
    profile
  }
}
