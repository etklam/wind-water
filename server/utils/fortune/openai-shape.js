import { randomUUID } from 'node:crypto'

export function buildChatCompletionResponse({ model, text, usage }) {
  const now = Math.floor(Date.now() / 1000)
  return {
    id: `chatcmpl-${randomUUID()}`,
    object: 'chat.completion',
    created: now,
    model,
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: text
        },
        finish_reason: 'stop'
      }
    ],
    usage: usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  }
}

export function buildOpenAIError({ message, type = 'invalid_request_error', code = null, statusCode = 400 }) {
  const err = createError({
    statusCode,
    statusMessage: message,
    data: {
      error: {
        message,
        type,
        code
      }
    }
  })
  return err
}
