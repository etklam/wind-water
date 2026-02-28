export const COMMON_TIMEZONES = [
  { value: 'Asia/Taipei', label: '台北（UTC+08:00）' },
  { value: 'Asia/Shanghai', label: '上海（UTC+08:00）' },
  { value: 'Asia/Hong_Kong', label: '香港（UTC+08:00）' },
  { value: 'Asia/Tokyo', label: '東京（UTC+09:00）' },
  { value: 'Asia/Seoul', label: '首爾（UTC+09:00）' },
  { value: 'Asia/Singapore', label: '新加坡（UTC+08:00）' },
  { value: 'Asia/Bangkok', label: '曼谷（UTC+07:00）' },
  { value: 'Asia/Dubai', label: '杜拜（UTC+04:00）' },
  { value: 'Europe/London', label: '倫敦（UTC+00:00）' },
  { value: 'Europe/Paris', label: '巴黎（UTC+01:00）' },
  { value: 'Europe/Berlin', label: '柏林（UTC+01:00）' },
  { value: 'America/New_York', label: '紐約（UTC-05:00）' },
  { value: 'America/Chicago', label: '芝加哥（UTC-06:00）' },
  { value: 'America/Denver', label: '丹佛（UTC-07:00）' },
  { value: 'America/Los_Angeles', label: '洛杉磯（UTC-08:00）' },
  { value: 'America/Vancouver', label: '溫哥華（UTC-08:00）' },
  { value: 'Australia/Sydney', label: '雪梨（UTC+10:00）' },
  { value: 'Pacific/Auckland', label: '奧克蘭（UTC+12:00）' }
]

export function buildTimezoneOptions(userTimezone) {
  if (!userTimezone) {
    return COMMON_TIMEZONES
  }

  const hasUserTimezone = COMMON_TIMEZONES.some((item) => item.value === userTimezone)
  if (hasUserTimezone) {
    return COMMON_TIMEZONES
  }

  return [{ value: userTimezone, label: `目前時區（${userTimezone}）` }, ...COMMON_TIMEZONES]
}
