import test from 'node:test'
import assert from 'node:assert/strict'
import { buildFingerprintInput, runFortuneCompletion } from '../server/utils/fortune/service.js'

test('buildFingerprintInput uses five-element totals only', () => {
  const profile = {
    totals: { wood: 1, fire: 2, earth: 3, metal: 4, water: 5 }
  }

  const a = buildFingerprintInput({ mode: 'year', year: 2026, profile })
  const b = buildFingerprintInput({ mode: 'life', year: 2030, profile })

  assert.deepEqual(a, profile.totals)
  assert.deepEqual(b, profile.totals)
})

test('runFortuneCompletion returns cache hit without calling OpenAI', async () => {
  let providerCalled = false
  let lookupArgs = null

  const repository = {
    async findByCacheKey(cacheKey, scope) {
      lookupArgs = { cacheKey, scope }
      return {
        responseText: 'cached-response',
        model: 'cached-model'
      }
    },
    async saveCache() {
      throw new Error('saveCache should not run on hit')
    }
  }

  const provider = {
    async createCompletion() {
      providerCalled = true
      return { text: 'fresh-response', model: 'fresh-model', usage: {} }
    }
  }

  const result = await runFortuneCompletion({
    mode: 'year',
    year: 2026,
    gender: 'male',
    mbti: 'intj',
    focusAreas: ['career'],
    birthInput: { date: '1990-06-15', time: '12:00', timezone: 'Asia/Taipei' },
    repository,
    provider
  })

  assert.equal(result.source, 'cache')
  assert.equal(result.text, 'cached-response')
  assert.equal(result.model, 'cached-model')
  assert.equal(providerCalled, false)
  assert.deepEqual(lookupArgs.scope, {
    mode: 'year',
    year: 2026,
    gender: 'male',
    mbti: 'INTJ',
    focusArea: 'career'
  })
})

test('runFortuneCompletion calls OpenAI and persists on cache miss', async () => {
  let persisted = null

  const repository = {
    async findByCacheKey() {
      return null
    },
    async saveCache(payload) {
      persisted = payload
    }
  }

  const provider = {
    async createCompletion() {
      return {
        text: 'fresh-response',
        model: 'gpt-4.1-mini',
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      }
    }
  }

  const result = await runFortuneCompletion({
    mode: 'life',
    year: 2026,
    gender: 'female',
    mbti: 'enfp',
    focusAreas: ['career', 'health'],
    birthInput: { date: '1990-06-15', time: '12:00', timezone: 'Asia/Taipei' },
    repository,
    provider
  })

  assert.equal(result.source, 'openai')
  assert.equal(result.text, 'fresh-response')
  assert.equal(result.model, 'gpt-4.1-mini')
  assert.equal(result.usage.total_tokens, 30)
  assert.ok(persisted)
  assert.equal(persisted.responseText, 'fresh-response')
  assert.equal(persisted.mode, 'life')
  assert.equal(persisted.year, null)
  assert.equal(persisted.gender, 'female')
  assert.equal(persisted.mbti, 'ENFP')
  assert.equal(persisted.focusArea, 'career,health')
})
