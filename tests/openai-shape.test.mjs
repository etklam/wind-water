import test from 'node:test'
import assert from 'node:assert/strict'
import { buildChatCompletionResponse } from '../server/utils/fortune/openai-shape.js'

test('buildChatCompletionResponse returns OpenAI-compatible shape', () => {
  const response = buildChatCompletionResponse({
    model: 'gpt-4.1-mini',
    text: 'fortune text',
    usage: { prompt_tokens: 11, completion_tokens: 22, total_tokens: 33 }
  })

  assert.equal(typeof response.id, 'string')
  assert.equal(response.object, 'chat.completion')
  assert.equal(response.model, 'gpt-4.1-mini')
  assert.equal(response.choices.length, 1)
  assert.equal(response.choices[0].message.role, 'assistant')
  assert.equal(response.choices[0].message.content, 'fortune text')
  assert.equal(response.usage.total_tokens, 33)
})
