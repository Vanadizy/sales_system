import * as XLSX from 'xlsx'

const normalizeHeader = (value) => String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, '')

export async function readSpreadsheetRows(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  return XLSX.utils.sheet_to_json(sheet, { defval: '' }).map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])),
  )
}

export function spreadsheetValue(row, ...headers) {
  const key = headers.map(normalizeHeader).find((header) => row[header] !== '' && row[header] != null)
  return key ? row[key] : ''
}

export function spreadsheetNumber(row, ...headers) {
  const value = spreadsheetValue(row, ...headers)
  if (value === '') return null
  const number = Number(String(value).replaceAll(',', '').trim())
  return Number.isFinite(number) ? number : NaN
}
