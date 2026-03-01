const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'debug'])
const REDACT_KEYS = new Set([
  'apikey',
  'openaiapikey',
  'authorization',
  'token',
  'password',
  'databaseurl',
  'mysqlpassword'
])

function toBoolean(value) {
  return TRUE_VALUES.has(String(value || '').trim().toLowerCase())
}

export function isFortuneDebugEnabled(env = process.env) {
  return toBoolean(
    env?.DEBUG_FORTUNE
    || env?.NUXT_DEBUG_FORTUNE
    || env?.NUXT_PUBLIC_DEBUG_FORTUNE
  )
}

export function sanitizeDebugPayload(input) {
  if (Array.isArray(input)) {
    return input.map((item) => sanitizeDebugPayload(item))
  }
  if (!input || typeof input !== 'object') {
    return input
  }

  const out = {}
  for (const [key, value] of Object.entries(input)) {
    const normalizedKey = String(key || '').toLowerCase()
    if (REDACT_KEYS.has(normalizedKey)) {
      out[key] = '[redacted]'
      continue
    }
    out[key] = sanitizeDebugPayload(value)
  }
  return out
}

export function createServerFortuneLogger({
  scope = 'fortune',
  enabled = isFortuneDebugEnabled(),
  sink
} = {}) {
  const output = typeof sink === 'function'
    ? sink
    : (entry) => console.debug(`[fortune][${entry.scope}] ${entry.event}`, entry.data)

  return (event, data = {}) => {
    if (!enabled) {
      return
    }
    output({
      at: new Date().toISOString(),
      scope,
      event,
      data: sanitizeDebugPayload(data)
    })
  }
}
