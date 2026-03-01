const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'debug'])
const REDACT_KEYS = new Set(['token', 'password', 'apikey', 'authorization'])

function toBoolean(value) {
  return TRUE_VALUES.has(String(value || '').trim().toLowerCase())
}

function sanitizeDebugPayload(input) {
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

export function isClientFortuneDebugEnabled(value) {
  return toBoolean(value)
}

export function createClientFortuneLogger({ scope = 'ui', enabled = false } = {}) {
  const isEnabled = typeof enabled === 'function' ? enabled : () => Boolean(enabled)
  return (event, data = {}) => {
    if (!isEnabled()) {
      return
    }
    console.debug(`[fortune][${scope}] ${event}`, sanitizeDebugPayload(data))
  }
}
