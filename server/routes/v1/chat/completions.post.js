import { createFortuneRepository } from '../../../utils/fortune/repository.js'
import { createOpenAICompletionWithFallback, normalizeModelList } from '../../../utils/fortune/provider.js'
import { runFortuneCompletion } from '../../../utils/fortune/service.js'
import { buildChatCompletionResponse, buildOpenAIError } from '../../../utils/fortune/openai-shape.js'
import { createServerFortuneLogger, sanitizeDebugPayload } from '../../../utils/fortune/debug-log.js'
import { randomUUID } from 'node:crypto'

function normalizeBirthInput(metadata = {}) {
  if (!metadata.birth) {
    return null
  }

  const birth = metadata.birth
  if (!birth.date) {
    return null
  }

  return {
    date: birth.date,
    time: birth.time || undefined,
    timezone: birth.timezone || 'Asia/Taipei',
    mode: metadata.mode === 'life' ? 'traditional' : 'gregorian'
  }
}

export default defineEventHandler(async (event) => {
  const log = createServerFortuneLogger({ scope: 'route.chat-completions' })
  const opsLog = (name, data = {}) => {
    console.info(`[fortune][route.chat-completions] ${name}`, sanitizeDebugPayload(data))
  }
  const startedAt = Date.now()
  const incomingRequestId = String(event.node.req.headers['x-request-id'] || '').trim()
  const requestId = incomingRequestId || randomUUID()
  setResponseHeader(event, 'x-request-id', requestId)

  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    log('request.invalid-body', { requestId, kind: typeof body })
    throw buildOpenAIError({ message: 'Request body is required.' })
  }

  const metadata = body.metadata || {}
  const mode = metadata.mode === 'life' ? 'life' : 'year'
  const year = Number(metadata.year || new Date().getFullYear())
  const gender = metadata.gender || ''
  const mbti = metadata.mbti || ''
  const focusAreas = Array.isArray(metadata.focus_areas) ? metadata.focus_areas : []
  const birthInput = normalizeBirthInput(metadata)
  const fiveElements = metadata.five_elements || null
  const userMessages = Array.isArray(body.messages) ? body.messages : []
  log('request.received', {
    requestId,
    mode,
    year,
    hasBirth: Boolean(birthInput),
    hasFiveElements: Boolean(fiveElements),
    hasGender: Boolean(gender),
    hasMbti: Boolean(mbti),
    focusAreaCount: focusAreas.length,
    messageCount: userMessages.length
  })
  opsLog('request.received', {
    requestId,
    mode,
    year
  })

  if (!birthInput && !fiveElements) {
    log('request.invalid-profile-input', { requestId, mode, year })
    throw buildOpenAIError({
      message: 'Provide either metadata.birth or metadata.five_elements.',
      code: 'missing_profile_input',
      statusCode: 400
    })
  }

  const config = useRuntimeConfig(event)
  const openaiApiKey = process.env.OPENAI_API_KEY || process.env.NUXT_OPENAI_API_KEY || config.openaiApiKey
  const openaiBaseUrl = process.env.OPENAI_BASE_URL || process.env.NUXT_OPENAI_BASE_URL || config.openaiBaseUrl
  const openaiModel = process.env.OPENAI_MODEL || process.env.NUXT_OPENAI_MODEL || config.openaiModel
  const openaiFallbackModels = process.env.OPENAI_FALLBACK_MODELS
    || process.env.NUXT_OPENAI_FALLBACK_MODELS
    || config.openaiFallbackModels
  const openaiTimeoutMs = Number(process.env.OPENAI_TIMEOUT_MS || config.openaiTimeoutMs || 15000)
  const databaseUrl = process.env.DATABASE_URL || config.databaseUrl || ''
  const repository = createFortuneRepository({
    databaseUrl,
    host: process.env.MYSQL_HOST || config.mysqlHost,
    port: Number(process.env.MYSQL_PORT || config.mysqlPort),
    user: process.env.MYSQL_USER || config.mysqlUser,
    password: process.env.MYSQL_PASSWORD || config.mysqlPassword,
    database: process.env.MYSQL_DATABASE || config.mysqlDatabase
  })

  try {
    const models = normalizeModelList(openaiModel || 'gpt-4.1-mini', openaiFallbackModels)
    log('provider.models', {
      requestId,
      modelCount: models.length,
      firstModel: models[0] || '',
      timeoutMs: openaiTimeoutMs
    })

    const result = await runFortuneCompletion({
      mode,
      year,
      gender,
      mbti,
      focusAreas,
      birthInput,
      fiveElements,
      userMessages,
      requestId,
      repository,
      provider: {
        createCompletion: ({ messages }) => createOpenAICompletionWithFallback({
          apiKey: openaiApiKey,
          baseUrl: openaiBaseUrl,
          models,
          timeoutMs: openaiTimeoutMs,
          messages,
          onAttempt: (attempt) => {
            log('provider.attempt', {
              requestId,
              ...attempt
            })
          }
        })
      }
    })
    log('request.completed', {
      requestId,
      source: result.source,
      model: result.model,
      elapsedMs: Date.now() - startedAt
    })
    opsLog('request.completed', {
      requestId,
      source: result.source,
      model: result.model,
      elapsedMs: Date.now() - startedAt
    })

    return buildChatCompletionResponse({
      model: result.model,
      text: result.text,
      usage: result.usage
    })
  } catch (error) {
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500
    log('request.failed', {
      requestId,
      message: error?.message || 'unknown error',
      statusCode,
      elapsedMs: Date.now() - startedAt
    })
    opsLog('request.failed', {
      requestId,
      message: error?.message || 'unknown error',
      statusCode,
      elapsedMs: Date.now() - startedAt
    })
    throw buildOpenAIError({
      message: error.message || 'Completion failed.',
      type: 'api_error',
      code: 'completion_failed',
      statusCode
    })
  }
})
