import { buildFortuneCacheKey } from './key.js'
import { buildFortunePrompt } from './prompt.js'
import { computeNayinProfile } from './nayin-engine.js'

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

export function buildFingerprintInput({ profile }) {
  return profile.totals
}

function normalizeScope({ mode, year, gender, focusAreas }) {
  const normalizedMode = mode === 'life' ? 'life' : 'year'
  return {
    mode: normalizedMode,
    year: normalizedMode === 'year' ? Number(year || new Date().getFullYear()) : null,
    gender: normalizeGender(gender),
    focusArea: normalizeFocusAreas(focusAreas).join(',')
  }
}

export async function runFortuneCompletion({
  mode,
  year,
  gender,
  focusAreas,
  birthInput,
  fiveElements,
  userMessages = [],
  repository,
  provider
}) {
  const scope = normalizeScope({ mode, year, gender, focusAreas })

  let profile
  const normalizedTotals = normalizeFiveElements(fiveElements)
  if (normalizedTotals) {
    profile = { totals: normalizedTotals, source: 'provided-five-elements' }
  } else {
    profile = buildProfileFromBirth(birthInput)
  }

  const cacheInput = buildFingerprintInput({ profile })

  const cacheKey = buildFortuneCacheKey(cacheInput)
  const cached = await repository.findByCacheKey(cacheKey, scope)
  if (cached?.responseText) {
    return {
      source: 'cache',
      cacheKey,
      text: cached.responseText,
      model: cached.model || 'cached-model',
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      profile
    }
  }

  const promptMessages = buildFortunePrompt({
    mode: scope.mode,
    year: scope.year,
    profile,
    gender: scope.gender,
    focusAreas: scope.focusArea ? scope.focusArea.split(',') : [],
    userMessages
  })

  const fresh = await provider.createCompletion({
    mode: scope.mode,
    year: scope.year,
    messages: promptMessages
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
      focus_areas: scope.focusArea ? scope.focusArea.split(',') : []
    },
    responseText: fresh.text,
    model: fresh.model,
    gender: scope.gender,
    focusArea: scope.focusArea
  })

  return {
    source: 'openai',
    cacheKey,
    text: fresh.text,
    model: fresh.model,
    usage: fresh.usage,
    profile
  }
}
