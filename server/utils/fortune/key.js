import { createHash } from 'node:crypto'

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`
  }

  const keys = Object.keys(value).sort()
  const body = keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')
  return `{${body}}`
}

export function buildFortuneCacheKey(input) {
  const canonical = stableStringify(input)
  return createHash('sha256').update(canonical).digest('hex')
}
