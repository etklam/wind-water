import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildChatCompletionsUrl,
  createOpenAICompletionWithFallback,
  createOpenAICompletion,
  normalizeModelList,
  normalizeTimeoutMs
} from '../server/utils/fortune/provider.js'

test('buildChatCompletionsUrl uses provided third-party base url', () => {
  assert.equal(
    buildChatCompletionsUrl('https://openai-proxy.example.com/v1/'),
    'https://openai-proxy.example.com/v1/chat/completions'
  )
})

test('buildChatCompletionsUrl falls back to official default', () => {
  assert.equal(
    buildChatCompletionsUrl(''),
    'https://api.openai.com/v1/chat/completions'
  )
})

test('normalizeModelList keeps primary and appends unique fallbacks', () => {
  const models = normalizeModelList(
    'qwen/main',
    'qwen/fallback-1, qwen/fallback-2, qwen/main'
  )
  assert.deepEqual(models, ['qwen/main', 'qwen/fallback-1', 'qwen/fallback-2'])
})

test('normalizeModelList returns primary only when fallback is empty', () => {
  const models = normalizeModelList('qwen/main', '')
  assert.deepEqual(models, ['qwen/main'])
})

test('normalizeTimeoutMs falls back for invalid values and clamps large values', () => {
  assert.equal(normalizeTimeoutMs(undefined), 15000)
  assert.equal(normalizeTimeoutMs('abc'), 15000)
  assert.equal(normalizeTimeoutMs(0), 15000)
  assert.equal(normalizeTimeoutMs(-1), 15000)
  assert.equal(normalizeTimeoutMs(12000), 12000)
  assert.equal(normalizeTimeoutMs(60000), 30000)
})

test('createOpenAICompletionWithFallback retries next model on 429', async () => {
  const calls = []
  const fetchImpl = async (_url, init) => {
    const payload = JSON.parse(init.body)
    calls.push(payload.model)

    if (payload.model === 'qwen/main') {
      return {
        ok: false,
        status: 429,
        text: async () => '{"error":"rate_limited"}'
      }
    }

    return {
      ok: true,
      json: async () => ({
        model: payload.model,
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
      })
    }
  }

  const result = await createOpenAICompletionWithFallback({
    apiKey: 'test-key',
    baseUrl: 'https://provider.example.com/v1',
    models: ['qwen/main', 'qwen/fallback-1'],
    messages: [{ role: 'user', content: 'hello' }],
    fetchImpl
  })

  assert.deepEqual(calls, ['qwen/main', 'qwen/fallback-1'])
  assert.equal(result.model, 'qwen/fallback-1')
  assert.equal(result.text, 'ok')
})

test('createOpenAICompletionWithFallback does not retry when only primary model configured', async () => {
  const calls = []
  const fetchImpl = async (_url, init) => {
    const payload = JSON.parse(init.body)
    calls.push(payload.model)
    return {
      ok: false,
      status: 429,
      text: async () => '{"error":"rate_limited"}'
    }
  }

  await assert.rejects(
    () => createOpenAICompletionWithFallback({
      apiKey: 'test-key',
      baseUrl: 'https://provider.example.com/v1',
      models: ['qwen/main'],
      messages: [{ role: 'user', content: 'hello' }],
      fetchImpl
    }),
    /OpenAI request failed: 429/
  )

  assert.deepEqual(calls, ['qwen/main'])
})

test('createOpenAICompletionWithFallback reports per-model attempts', async () => {
  const attempts = []
  const fetchImpl = async (_url, init) => {
    const payload = JSON.parse(init.body)
    if (payload.model === 'qwen/main') {
      return {
        ok: false,
        status: 429,
        text: async () => '{"error":"rate_limited"}'
      }
    }
    return {
      ok: true,
      json: async () => ({
        model: payload.model,
        choices: [{ message: { content: 'ok' } }],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 }
      })
    }
  }

  await createOpenAICompletionWithFallback({
    apiKey: 'test-key',
    baseUrl: 'https://provider.example.com/v1',
    models: ['qwen/main', 'qwen/fallback-1'],
    messages: [{ role: 'user', content: 'hello' }],
    fetchImpl,
    onAttempt: (entry) => attempts.push(entry)
  })

  assert.equal(attempts.length, 2)
  assert.deepEqual(
    attempts.map((item) => ({
      model: item.model,
      statusCode: item.statusCode,
      ok: item.ok
    })),
    [
      { model: 'qwen/main', statusCode: 429, ok: false },
      { model: 'qwen/fallback-1', statusCode: 200, ok: true }
    ]
  )
  assert.match(String(attempts[0].elapsedMs), /^[0-9]+$/)
  assert.match(String(attempts[1].elapsedMs), /^[0-9]+$/)
})

test('createOpenAICompletion times out when upstream hangs', async () => {
  const fetchImpl = (_url, init) => new Promise((_resolve, reject) => {
    init.signal.addEventListener('abort', () => {
      const err = new Error('aborted')
      err.name = 'AbortError'
      reject(err)
    })
  })

  await assert.rejects(
    () => createOpenAICompletion({
      apiKey: 'test-key',
      baseUrl: 'https://provider.example.com/v1',
      model: 'qwen/main',
      messages: [{ role: 'user', content: 'hello' }],
      timeoutMs: 5,
      fetchImpl
    }),
    /OpenAI request timeout/
  )
})
