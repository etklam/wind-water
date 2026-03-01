function normalizeBaseUrl(baseUrl) {
  const trimmed = String(baseUrl || '').trim()
  if (!trimmed) {
    return 'https://api.openai.com/v1'
  }
  return trimmed.replace(/\/+$/, '')
}

export function buildChatCompletionsUrl(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`
}

export async function createOpenAICompletion({
  apiKey,
  baseUrl,
  model,
  messages,
  temperature = 0.7,
  timeoutMs = 45000,
  fetchImpl = fetch
}) {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Number(timeoutMs || 45000))
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
      const timeoutError = new Error(`OpenAI request timeout after ${Number(timeoutMs || 45000)}ms`)
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
  timeoutMs = 45000,
  fetchImpl = fetch
}) {
  let lastError
  for (const model of models) {
    try {
      return await createOpenAICompletion({
        apiKey,
        baseUrl,
        model,
        messages,
        temperature,
        timeoutMs,
        fetchImpl
      })
    } catch (error) {
      lastError = error
      if (error?.statusCode !== 429) {
        throw error
      }
    }
  }

  throw lastError || new Error('OpenAI completion failed on all models.')
}
