export const money = (value, currency = 'TZS') =>
  new Intl.NumberFormat('en-TZ', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0)

export const dateTime = (value) =>
  new Intl.DateTimeFormat('en-TZ', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export const initials = (name = '') => name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase()

export const newId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const nextCode = (prefix, existingCodes = [], digits = 5) => {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  const highest = existingCodes.reduce((max, code) => {
    const match = String(code || '').match(pattern)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  return `${prefix}-${String(highest + 1).padStart(digits, '0')}`
}

export const cleanText = (value = '') => String(value).trim().replace(/\s+/g, ' ')

export const comparableText = (value = '') => cleanText(value).toLowerCase()

export const grossMargin = (price, cost) =>
  Number(price) > 0 ? ((Number(price) - Number(cost)) / Number(price)) * 100 : 0
