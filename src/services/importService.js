import * as XLSX from 'xlsx'

const normalizeHeader = (value) => String(value).trim().toLowerCase().replace(/[^a-z0-9]/g, '')
const headerHints = new Set([
  'name',
  'product',
  'productname',
  'productcode',
  'sku',
  'barcode',
  'barcodeoptional',
  'sellingprice',
  'saleprice',
  'purchasecost',
  'unitcost',
  'quantity',
  'supplier',
])

const findHeaderRow = (sheet) => {
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  const headerRow = rows.findIndex((row) => {
    const headers = row.map(normalizeHeader).filter(Boolean)
    return headers.length >= 2 && headers.some((header) => headerHints.has(header))
  })
  return headerRow >= 0 ? headerRow : 0
}

export async function readSpreadsheetRows(file) {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  if (!sheet) return []
  const headerRow = findHeaderRow(sheet)
  return XLSX.utils.sheet_to_json(sheet, { defval: '', range: headerRow })
    .map((row, index) => {
      const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]))
      Object.defineProperty(normalized, '__rowNumber', { value: headerRow + index + 2 })
      return normalized
    })
    .filter((row) => Object.values(row).some((value) => String(value).trim() !== ''))
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
