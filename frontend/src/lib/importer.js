import * as XLSX from 'xlsx'

/**
 * Parses AAMS residential occupancy and furniture Excel sheet.
 *
 * Expected sheet layout (first sheet, "BOOKING WITH FURN DETAILS …"):
 *   Row 11 (0-based) = Header row:
 *     Col 0: (empty / notes)
 *     Col 1: "Flat"         – e.g. NTA1-101, NTA2-305A
 *     Col 2: "Deptt"        – department
 *     Col 3: "Name"         – occupant name(s)
 *     Col 4: (people count) – number of people
 *     Col 5: "Furni&Fix"    – appliances / fixtures text
 *     Col 6: (beds / extra furniture detail text)
 *     Cols 7-12: individual "Doctor furniture" item columns (sofa, c.Table, etc.)
 *
 * NT1 rows start after header, NT2 rows follow after a break with "NT2" marker.
 * NT2 flats may have A/B sub-unit suffixes (NTA2-305A, NTA2-305B).
 *
 * @param {File} file
 * @returns {Promise<{nt1: Array, nt2: Array, furniture: Array}>}
 */
export function parseAamsExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellStyles: true })

        // Use first sheet (the main booking sheet)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

        // --------------- Locate Header Row ---------------
        // Look for a row that has "Flat" in it (case-insensitive).
        let headerRowIdx = -1
        for (let i = 0; i < Math.min(json.length, 50); i++) {
          const row = json[i]
          if (!row) continue
          if (row.some(cell => String(cell).trim().toLowerCase() === 'flat' || String(cell).trim().toLowerCase() === 'flat no.')) {
            headerRowIdx = i
            break
          }
        }

        if (headerRowIdx === -1) {
          throw new Error(
            'Could not find "Flat" column header in the spreadsheet. ' +
            'Ensure the sheet contains a header row with a "Flat" column.'
          )
        }

        // Determine column indices dynamically from the header row
        const headerRow = json[headerRowIdx].map(h => String(h ?? '').trim())

        const flatIdx = findColIndex(headerRow, ['flat', 'flat no.', 'flat no'], 0)
        // Department column: immediately after flat, or labelled
        const deptIdx = findColIndex(headerRow, ['deptt', 'dept', 'department'], flatIdx + 1)
        // Name column
        const nameIdx = findColIndex(headerRow, ['name', 'resident', 'occupant'], deptIdx !== -1 ? deptIdx + 1 : flatIdx + 1)
        // People count is typically the column right after Name (may be unlabelled)
        const countIdx = nameIdx !== -1 ? nameIdx + 1 : -1
        // Rent column
        const rentIdx = findColIndex(headerRow, ['monthly rent', 'rent', 'monthly rent (₹)*'], -1)
        // Furniture & Fixtures column
        const furnFixIdx = findColIndex(headerRow, ['furni&fix', 'furni & fix', 'furniture', 'furniture & fixtures', 'furniture&fixtures'], countIdx !== -1 ? countIdx + 1 : flatIdx + 2)
        // Extra beds/furniture detail column (one after Furni&Fix)
        const bedsIdx = furnFixIdx !== -1 ? furnFixIdx + 1 : -1
        // Doctor furniture individual item columns start after beds column
        const doctorFurnStart = bedsIdx !== -1 ? bedsIdx + 1 : -1

        if (flatIdx === -1) {
          throw new Error('Could not locate "Flat" column in the header row.')
        }

        // --------------- Parse Data Rows ---------------
        const nt1 = []
        const nt2 = []
        const allFurnitureItems = new Set()

        for (let i = headerRowIdx + 1; i < json.length; i++) {
          const row = json[i]
          if (!row) continue

          const flatRaw = String(row[flatIdx] ?? '').trim()
          if (!flatRaw) continue

          // Skip known non-data rows
          const flatLower = flatRaw.toLowerCase()
          if (
            flatLower === 'flat' ||
            flatLower === 'total' ||
            flatLower === 'nt1' ||
            flatLower === 'nt2' ||
            flatLower === 'vacant'
          ) {
            continue
          }

          // Match flat codes: NTA1-101, NTA2-305A, NTA2-305B, etc.
          const match = flatRaw.match(/^NTA(\d)[-–](\d+)([AB]?)$/i)
          if (!match) continue

          const towerNum = match[1] // '1' or '2'
          const roomNumStr = match[2]
          const subUnit = match[3] ? match[3].toUpperCase() : ''

          // Derive floor number from the room number string
          let floorNum = 1
          if (roomNumStr.length > 2) {
            floorNum = parseInt(roomNumStr.slice(0, -2), 10) || 1
          }

          // Extract fields
          const dept = deptIdx !== -1 ? cleanCell(row[deptIdx]) : ''
          const name = nameIdx !== -1 ? cleanCell(row[nameIdx]) : ''
          const peopleCount = countIdx !== -1 ? parseCount(row[countIdx]) : 0
          const rentVal = rentIdx !== -1 ? row[rentIdx] : ''
          const rentRate = parseFloat(String(rentVal).replace(/[^\d.]/g, '')) || 0
          const furnFix = furnFixIdx !== -1 ? cleanCell(row[furnFixIdx]) : ''
          const bedsDetail = bedsIdx !== -1 ? cleanCell(row[bedsIdx]) : ''

          // Collect Doctor furniture items from cols 7-12+ (individual named items)
          const doctorFurnItems = []
          if (doctorFurnStart > 0) {
            for (let j = doctorFurnStart; j < Math.min(row.length, doctorFurnStart + 20); j++) {
              const cellVal = String(row[j] ?? '').trim()
              if (cellVal && cellVal !== '0') {
                doctorFurnItems.push(cellVal)
              }
            }
          }

          // Determine occupancy
          let occupancy = 'Vacant'
          let residentName = '-'

          const cleanedName = name.replace(/[\s,_'"]/g, '').toLowerCase()
          if (
            name &&
            cleanedName !== 'vacant' &&
            cleanedName !== 'nil' &&
            cleanedName !== '-' &&
            cleanedName !== '' &&
            cleanedName !== '""'
          ) {
            occupancy = 'Occupied'
            residentName = name
          }

          // Build combined furniture string — preserve brackets like (RPS), (Metal), (NCO)
          const furnitureStr = buildFurnitureString(furnFix, bedsDetail, doctorFurnItems, allFurnitureItems)

          // Guesthouse detection: check cell color in Column A (Flat)
          const cellAddress = XLSX.utils.encode_cell({ r: i, c: flatIdx })
          const cellObj = worksheet[cellAddress]
          let isGuesthouseColor = false
          if (cellObj && cellObj.s && cellObj.s.fill) {
            const fill = cellObj.s.fill
            if (fill.fgColor && fill.fgColor.rgb) {
              const rgb = String(fill.fgColor.rgb).toUpperCase().replace(/^FF/, '')
              if (rgb === 'C6EFCE') {
                isGuesthouseColor = true
              }
            }
          }

          const lowerDept = dept.toLowerCase().trim()
          const lowerName = name.toLowerCase().trim()
          const isGuesthouseText = 
            lowerDept === 'gh' || 
            lowerDept === 'guest house' || 
            lowerDept === 'guesthouse' ||
            lowerDept.startsWith('gh ') ||
            lowerDept.endsWith(' gh') ||
            lowerDept.includes('guest flats') ||
            lowerDept.includes('guest house') ||
            lowerName === 'gh' || 
            lowerName === 'guest house' || 
            lowerName === 'guesthouse' ||
            lowerName === 'guest'

          const isGuesthouse = isGuesthouseColor || isGuesthouseText

          const unit = {
            floor: floorNum,
            roomNo: flatRaw.toUpperCase().replace('–', '-'),
            occupancy,
            residentName,
            deptt: dept,
            occupantCount: peopleCount,
            furniture: furnitureStr || 'NIL',
            isGuesthouse,
            rentRate,
          }

          if (towerNum === '1') {
            nt1.push(unit)
          } else if (towerNum === '2') {
            nt2.push(unit)
          }
        }

        resolve({
          nt1,
          nt2,
          furniture: Array.from(allFurnitureItems),
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = (err) => reject(err)
    reader.readAsArrayBuffer(file)
  })
}

// --------------- Helpers ---------------

/**
 * Find column index by trying multiple possible header names.
 * If none match, return fallback (or -1).
 */
function findColIndex(headerRow, candidates, fallbackIdx) {
  for (let i = 0; i < headerRow.length; i++) {
    const h = headerRow[i].toLowerCase()
    if (candidates.some(c => h === c || h.includes(c))) {
      return i
    }
  }
  // If no explicit match, use positional fallback if it's within bounds
  if (typeof fallbackIdx === 'number' && fallbackIdx >= 0 && fallbackIdx < headerRow.length) {
    return fallbackIdx
  }
  return -1
}

/**
 * Clean a cell value — return trimmed string, skipping "_" placeholders.
 */
function cleanCell(val) {
  if (val === null || val === undefined) return ''
  const s = String(val).trim()
  if (s === '_' || s === '-') return ''
  return s
}

/**
 * Parse a count value (may be number or string).
 */
function parseCount(val) {
  if (typeof val === 'number') return val
  const n = parseInt(String(val).trim(), 10)
  return isNaN(n) ? 0 : n
}

/**
 * Build a combined furniture string from all sources.
 * Preserves bracket annotations like (RPS), (Metal), (NCO).
 * Splits on commas carefully, avoiding splitting inside parentheses.
 */
function buildFurnitureString(furnFix, bedsDetail, doctorFurnItems, allFurnitureSet) {
  const allParts = []

  // Parse furnFix (appliances column) — e.g. "1AC(RPS),1Gey,WM,Fridge"
  if (furnFix && furnFix !== '_' && furnFix.toLowerCase() !== 'nil') {
    const items = smartSplit(furnFix)
    allParts.push(...items)
  }

  // Parse bedsDetail — e.g. "6x4 - 2beds(RPS)", "Doctor furniture"
  if (bedsDetail && bedsDetail !== '_' && bedsDetail.toLowerCase() !== 'nil') {
    const items = smartSplit(bedsDetail)
    allParts.push(...items)
  }

  // Add Doctor furniture individual items — these can be names ("sofa") or counts (1)
  for (const item of doctorFurnItems) {
    const s = String(item).trim()
    // If it's a pure number, skip (it's a quantity reference for a named column header)
    if (/^\d+$/.test(s)) continue
    allParts.push(s)
  }

  // Clean and collect into the furniture library set
  const cleaned = allParts
    .map(p => p.trim())
    .filter(p => {
      if (!p) return false
      const lower = p.toLowerCase()
      return lower !== 'nil' && lower !== '_' && lower !== 'vacant' && p !== '-'
    })

  // Add each to the global set for the furniture library
  for (const item of cleaned) {
    allFurnitureSet.add(item)
  }

  return cleaned.length > 0 ? cleaned.join(', ') : 'NIL'
}

/**
 * Split a string by commas, but NOT inside parentheses.
 * This preserves items like "Fridge(Alongwith transplant)" or "table (RPS)" as single tokens.
 */
function smartSplit(str) {
  const results = []
  let current = ''
  let depth = 0

  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch === '(') {
      depth++
      current += ch
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1)
      current += ch
    } else if (ch === ',' && depth === 0) {
      const trimmed = current.trim()
      if (trimmed) results.push(trimmed)
      current = ''
    } else {
      current += ch
    }
  }

  const trimmed = current.trim()
  if (trimmed) results.push(trimmed)

  return results
}
