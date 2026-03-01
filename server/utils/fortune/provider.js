function normalizeBaseUrl(baseUrl) {
  const trimmed = String(baseUrl || '').trim()
  if (!trimmed) {
    return 'https://api.openai.com/v1'
  }
  return trimmed.replace(/\/+$/, '')
}

const DEFAULT_OPENAI_TIMEOUT_MS = 15000
const MAX_OPENAI_TIMEOUT_MS = 30000

export function buildChatCompletionsUrl(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`
}

export function normalizeTimeoutMs(timeoutMs) {
  const parsed = Number(timeoutMs)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_OPENAI_TIMEOUT_MS
  }
  return Math.min(Math.floor(parsed), MAX_OPENAI_TIMEOUT_MS)
}

export async function createOpenAICompletion({
  apiKey,
  baseUrl,
  model,
  messages,
  temperature = 0.7,
  timeoutMs = DEFAULT_OPENAI_TIMEOUT_MS,
  fetchImpl = fetch
}) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing')
  }

  const resolvedTimeoutMs = normalizeTimeoutMs(timeoutMs)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), resolvedTimeoutMs)
  let response
  try {
    response = await fetchImpl(buildChatCompletionsUrl(baseUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature
      }),
      signal: controller.signal
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error(`OpenAI request timeout after ${resolvedTimeoutMs}ms`)
      timeoutError.statusCode = 504
      throw timeoutError
    }
    throw error
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    const detail = await response.text()
    const err = new Error(`OpenAI request failed: ${response.status} ${detail}`)
    err.statusCode = response.status
    err.detail = detail
    throw err
  }

  const data = await response.json()
  return {
    text: data?.choices?.[0]?.message?.content ?? '',
    model: data?.model ?? model,
    usage: data?.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  }
}

export function normalizeModelList(primaryModel, fallbackModelsRaw) {
  const primary = String(primaryModel || '').trim()
  if (!primary) {
    return []
  }

  const fallbackRaw = String(fallbackModelsRaw || '').trim()
  if (!fallbackRaw) {
    return [primary]
  }

  const list = [primary]
  const fallback = fallbackRaw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  for (const model of fallback) {
    if (!list.includes(model)) {
      list.push(model)
    }
  }

  return list.filter(Boolean)
}

export async function createOpenAICompletionWithFallback({
  apiKey,
  baseUrl,
  models,
  messages,
  temperature = 0.7,
  timeoutMs = DEFAULT_OPENAI_TIMEOUT_MS,
  fetchImpl = fetch,
  onAttempt
}) {
  let lastError
  for (const model of models) {
    const startedAt = Date.now()
    try {
      const result = await createOpenAICompletion({
        apiKey,
        baseUrl,
        model,
        messages,
        temperature,
        timeoutMs,
        fetchImpl
      })
      if (typeof onAttempt === 'function') {
        onAttempt({
          model,
          ok: true,
          statusCode: 200,
          elapsedMs: Date.now() - startedAt
        })
      }
      return result
    } catch (error) {
      lastError = error
      if (typeof onAttempt === 'function') {
        onAttempt({
          model,
          ok: false,
          statusCode: Number.isInteger(error?.statusCode) ? error.statusCode : null,
          message: error?.message || 'unknown error',
          elapsedMs: Date.now() - startedAt
        })
      }
      if (error?.statusCode !== 429) {
        throw error
      }
    }
  }

  throw lastError || new Error('OpenAI completion failed on all models.')
}
