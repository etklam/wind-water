export const COMMON_TIMEZONES = [
  {
    value: 'Asia/Taipei',
    labels: { 'zh-Hant': '台北（UTC+08:00）', 'zh-Hans': '台北（UTC+08:00）' }
  },
  {
    value: 'Asia/Shanghai',
    labels: { 'zh-Hant': '上海（UTC+08:00）', 'zh-Hans': '上海（UTC+08:00）' }
  },
  {
    value: 'Asia/Hong_Kong',
    labels: { 'zh-Hant': '香港（UTC+08:00）', 'zh-Hans': '香港（UTC+08:00）' }
  },
  {
    value: 'Asia/Tokyo',
    labels: { 'zh-Hant': '東京（UTC+09:00）', 'zh-Hans': '东京（UTC+09:00）' }
  },
  {
    value: 'Asia/Seoul',
    labels: { 'zh-Hant': '首爾（UTC+09:00）', 'zh-Hans': '首尔（UTC+09:00）' }
  },
  {
    value: 'Asia/Singapore',
    labels: { 'zh-Hant': '新加坡（UTC+08:00）', 'zh-Hans': '新加坡（UTC+08:00）' }
  },
  {
    value: 'Asia/Bangkok',
    labels: { 'zh-Hant': '曼谷（UTC+07:00）', 'zh-Hans': '曼谷（UTC+07:00）' }
  },
  {
    value: 'Asia/Dubai',
    labels: { 'zh-Hant': '杜拜（UTC+04:00）', 'zh-Hans': '迪拜（UTC+04:00）' }
  },
  {
    value: 'Europe/London',
    labels: { 'zh-Hant': '倫敦（UTC+00:00）', 'zh-Hans': '伦敦（UTC+00:00）' }
  },
  {
    value: 'Europe/Paris',
    labels: { 'zh-Hant': '巴黎（UTC+01:00）', 'zh-Hans': '巴黎（UTC+01:00）' }
  },
  {
    value: 'Europe/Berlin',
    labels: { 'zh-Hant': '柏林（UTC+01:00）', 'zh-Hans': '柏林（UTC+01:00）' }
  },
  {
    value: 'America/New_York',
    labels: { 'zh-Hant': '紐約（UTC-05:00）', 'zh-Hans': '纽约（UTC-05:00）' }
  },
  {
    value: 'America/Chicago',
    labels: { 'zh-Hant': '芝加哥（UTC-06:00）', 'zh-Hans': '芝加哥（UTC-06:00）' }
  },
  {
    value: 'America/Denver',
    labels: { 'zh-Hant': '丹佛（UTC-07:00）', 'zh-Hans': '丹佛（UTC-07:00）' }
  },
  {
    value: 'America/Los_Angeles',
    labels: { 'zh-Hant': '洛杉磯（UTC-08:00）', 'zh-Hans': '洛杉矶（UTC-08:00）' }
  },
  {
    value: 'America/Vancouver',
    labels: { 'zh-Hant': '溫哥華（UTC-08:00）', 'zh-Hans': '温哥华（UTC-08:00）' }
  },
  {
    value: 'Australia/Sydney',
    labels: { 'zh-Hant': '雪梨（UTC+10:00）', 'zh-Hans': '悉尼（UTC+10:00）' }
  },
  {
    value: 'Pacific/Auckland',
    labels: { 'zh-Hant': '奧克蘭（UTC+12:00）', 'zh-Hans': '奥克兰（UTC+12:00）' }
  }
]

function toLocaleLabel(item, locale) {
  return {
    value: item.value,
    label: item.labels[locale] || item.labels['zh-Hant']
  }
}

export function resolveDefaultTimezone(input = {}) {
  const detectedTimezone = input.detectedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const offsetMinutes = Number.isFinite(input.offsetMinutes) ? input.offsetMinutes : new Date().getTimezoneOffset()

  if (offsetMinutes === -480) {
    return 'Asia/Hong_Kong'
  }

  return detectedTimezone || 'Asia/Taipei'
}

export function buildTimezoneOptions(userTimezone, locale = 'zh-Hant') {
  const localizedOptions = COMMON_TIMEZONES.map((item) => toLocaleLabel(item, locale))
  if (!userTimezone) {
    return localizedOptions
  }

  const hasUserTimezone = localizedOptions.some((item) => item.value === userTimezone)
  if (hasUserTimezone) {
    return localizedOptions
  }

  const currentTimezoneLabel = locale === 'zh-Hans' ? '当前时区' : '目前時區'
  return [{ value: userTimezone, label: `${currentTimezoneLabel}（${userTimezone}）` }, ...localizedOptions]
}
