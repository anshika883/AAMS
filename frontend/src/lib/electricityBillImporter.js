import * as XLSX from 'xlsx'

/**
 * electricityBillImporter.js — parses an Excel sheet of electricity bill
 * data into records ready for electricityBillState.js's
 * bulkImportElectricityBills(). Best-effort like importer.js/
 * furnitureParsing.js: malformed rows are fixed where reasonable (clamped
 * numbers, fallback rate) or skipped with a reason, never thrown.
 *
 * Expected columns (header names are matched loosely, case-insensitively):
 *   Building            — "NT1" or "NT2" (no canonical buildings list exists
 *                          in this app; only these two are recognized)
 *   Room No              — flat identifier, e.g. "NTA1-101"
 *   Units Allotted
 *   Units Consumed
 *   Rate/Unit             — optional; missing/blank falls back to the
 *                          current global default rate at import time
 *   Payments              — optional; if present and > 0, becomes a single
 *                          initial payment entry dated to the import date
 */

const BUILDING_CODES = ['NT1', 'NT2']

function findColIndex(headerRow, candidates) {
  for (let i = 0; i < headerRow.length; i++) {
    const h = headerRow[i].toLowerCase()
    if (candidates.some((c) => h === c || h.includes(c))) return i
  }
  return -1
}

function normalizeBuilding(raw) {
  const s = String(raw ?? '').trim().toUpperCase()
  if (BUILDING_CODES.includes(s)) return s
  // Tolerate values like "NT-1", "NT 1", "Tower 1", flat codes like "NTA1-101"
  if (/\b1\b/.test(s) || s.includes('NT1') || s.includes('NTA1')) return 'NT1'
  if (/\b2\b/.test(s) || s.includes('NT2') || s.includes('NTA2')) return 'NT2'
  return null
}

function parseNumericCell(raw, fallback = 0) {
  if (raw === undefined || raw === null || raw === '') return { value: fallback, wasFixed: false }
  const parsed = parseFloat(String(raw).replace(/[^\d.-]/g, ''))
  if (Number.isNaN(parsed)) return { value: fallback, wasFixed: true }
  if (parsed < 0) return { value: 0, wasFixed: true }
  return { value: parsed, wasFixed: false }
}

/**
 * @param {File} file
 * @returns {Promise<{records: Array, summary: { totalRows: number, imported: number, skipped: Array<{row: number, reason: string}>, fixed: Array<{row: number, note: string}> }}>}
 */
export function parseElectricityBillExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

        let headerRowIdx = -1
        for (let i = 0; i < Math.min(json.length, 20); i++) {
          const row = json[i]
          if (!row) continue
          if (row.some((cell) => String(cell).trim().toLowerCase().includes('building'))) {
            headerRowIdx = i
            break
          }
        }
        if (headerRowIdx === -1) {
          throw new Error('Could not find a "Building" column header in the spreadsheet.')
        }

        const headerRow = json[headerRowIdx].map((h) => String(h ?? '').trim())
        const buildingIdx = findColIndex(headerRow, ['building'])
        const roomIdx = findColIndex(headerRow, ['room no', 'room no.', 'flat no', 'flat no.', 'room'])
        const allottedIdx = findColIndex(headerRow, ['units allotted', 'allotted'])
        const consumedIdx = findColIndex(headerRow, ['units consumed', 'consumed'])
        const rateIdx = findColIndex(headerRow, ['rate/unit', 'rate per unit', 'rate'])
        const paymentsIdx = findColIndex(headerRow, ['payments', 'payment', 'amount paid'])

        if (buildingIdx === -1 || roomIdx === -1) {
          throw new Error('Could not locate "Building" and "Room No" columns in the header row.')
        }

        const records = []
        const skipped = []
        const fixed = []
        let totalRows = 0
        const importDate = new Date().toISOString().split('T')[0]

        for (let i = headerRowIdx + 1; i < json.length; i++) {
          const row = json[i]
          if (!row || row.every((c) => String(c).trim() === '')) continue
          totalRows++
          const displayRow = i + 1 // 1-based for user-facing messages

          const buildingCode = normalizeBuilding(row[buildingIdx])
          const roomNo = String(row[roomIdx] ?? '').trim().toUpperCase()

          if (!buildingCode) {
            skipped.push({ row: displayRow, reason: `Unrecognized building "${row[buildingIdx]}" (expected NT1 or NT2)` })
            continue
          }
          if (!roomNo) {
            skipped.push({ row: displayRow, reason: 'Missing Room No.' })
            continue
          }

          const allotted = parseNumericCell(allottedIdx !== -1 ? row[allottedIdx] : undefined, 0)
          const consumed = parseNumericCell(consumedIdx !== -1 ? row[consumedIdx] : undefined, 0)
          const rateCell = rateIdx !== -1 ? row[rateIdx] : ''
          const hasRate = rateCell !== undefined && rateCell !== null && String(rateCell).trim() !== ''
          const rate = hasRate ? parseNumericCell(rateCell, undefined) : null

          if (allotted.wasFixed) fixed.push({ row: displayRow, note: `Units Allotted "${row[allottedIdx]}" was invalid — defaulted to 0` })
          if (consumed.wasFixed) fixed.push({ row: displayRow, note: `Units Consumed "${row[consumedIdx]}" was invalid — defaulted to 0` })
          if (hasRate && rate.wasFixed) fixed.push({ row: displayRow, note: `Rate/Unit "${rateCell}" was invalid — will use the global default rate` })

          const paymentCell = paymentsIdx !== -1 ? row[paymentsIdx] : ''
          const paymentAmount = parseFloat(String(paymentCell).replace(/[^\d.-]/g, ''))
          const payments = !Number.isNaN(paymentAmount) && paymentAmount > 0
            ? [{ amount: paymentAmount, date: importDate, note: 'Imported payment' }]
            : []

          const record = {
            buildingCode,
            roomNo,
            unitsAllotted: allotted.value,
            unitsConsumed: consumed.value,
            payments,
          }
          // Only set ratePerUnit when the sheet actually gave one — omitting it
          // lets upsertElectricityBillRecord fall back to the global default.
          if (hasRate && !rate.wasFixed) record.ratePerUnit = rate.value

          records.push(record)
        }

        resolve({
          records,
          summary: { totalRows, imported: records.length, skipped, fixed },
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  })
}
