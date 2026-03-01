import { createFortuneRepository } from '../../../utils/fortune/repository.js'
import { createOpenAICompletionWithFallback, normalizeModelList } from '../../../utils/fortune/provider.js'
import { runFortuneCompletion } from '../../../utils/fortune/service.js'
import { buildChatCompletionResponse, buildOpenAIError } from '../../../utils/fortune/openai-shape.js'
import { createServerFortuneLogger } from '../../../utils/fortune/debug-log.js'

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
  const startedAt = Date.now()
  const body = await readBody(event)
  if (!body || typeof body !== 'object') {
    log('request.invalid-body', { kind: typeof body })
    throw buildOpenAIError({ message: 'Request body is required.' })
  }

  const metadata = body.metadata || {}
  const mode = metadata.mode === 'life' ? 'life' : 'year'
  const year = Number(metadata.year || new Date().getFullYear())
  const gender = metadata.gender || ''
  const focusAreas = Array.isArray(metadata.focus_areas) ? metadata.focus_areas : []
  const birthInput = normalizeBirthInput(metadata)
  const fiveElements = metadata.five_elements || null
  const userMessages = Array.isArray(body.messages) ? body.messages : []
  log('request.received', {
    mode,
    year,
    hasBirth: Boolean(birthInput),
    hasFiveElements: Boolean(fiveElements),
    hasGender: Boolean(gender),
    focusAreaCount: focusAreas.length,
    messageCount: userMessages.length
  })

  if (!birthInput && !fiveElements) {
    log('request.invalid-profile-input', { mode, year })
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
    log('provider.models', { modelCount: models.length, firstModel: models[0] || '' })

    const result = await runFortuneCompletion({
      mode,
      year,
      gender,
      focusAreas,
      birthInput,
      fiveElements,
      userMessages,
      repository,
      provider: {
        createCompletion: ({ messages }) => createOpenAICompletionWithFallback({
          apiKey: openaiApiKey,
          baseUrl: openaiBaseUrl,
          models,
          messages
        })
      }
    })
    log('request.completed', {
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
    log('request.failed', {
      message: error?.message || 'unknown error',
      elapsedMs: Date.now() - startedAt
    })
    throw buildOpenAIError({
      message: error.message || 'Completion failed.',
      type: 'api_error',
      code: 'completion_failed',
      statusCode: 500
    })
  }
})
