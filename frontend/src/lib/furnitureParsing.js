/**
 * furnitureParsing.js — parses the real-world "Category: detail; Category: detail"
 * Furniture & Fixtures text used in the AAMS booking export (see
 * BOOKING_WITH_FURN_DETAILS_CLEANED.xlsx), e.g.:
 *   "AC/Electrical: 1AC,gey,heater; Bed/Other: 6x4 -2 beds,6x3 1 bed; Sofa; Dining Table (2)"
 *
 * Bed and table entries are classified by size when the source text gives
 * one (a "WxH" dimension like "6x4", or a named size like "Queen"/"King").
 * Bed info is occasionally mis-entered under the wrong category in the
 * source data (e.g. "AC/Electrical: 6x4 bed 2 nos.") — that's detected via
 * the word "bed"/"cot" appearing in the detail text, not just the category
 * label, since the source is hand-entered and inconsistent.
 *
 * This is a best-effort heuristic over messy free text, not a full grammar —
 * it favors extracting a usable size/qty over failing silently.
 */

const DIMENSION_RE = /(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i
const NAMED_BED_SIZE_RE = /\b(king|queen|double|single|twin)\b/i
const BED_WORD_RE = /\b(bed|cot|beds|cots)\b/i

const TABLE_CATEGORIES = new Set(['Centre Table', 'Dining Table', 'Side Table', 'Bedside Table', 'Study Table'])

/** Split on a delimiter, but not inside parentheses (preserves "(RPS)", "(2)", etc.). */
function splitOutsideParens(text, delimiter) {
  const parts = []
  let current = ''
  let depth = 0
  for (const ch of text) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === delimiter && depth === 0) {
      if (current.trim()) parts.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

function extractQty(text) {
  if (!text) return 1
  let m = text.match(/\((\d+)\s*(?:nos?\.?|no\.?)?\)/i) // "(2)" / "(2 Nos.)"
  if (m) return parseInt(m[1], 10) || 1
  m = text.match(/(\d+)\s*nos?\.?/i) // "2 nos.", "2 No."
  if (m) return parseInt(m[1], 10) || 1
  m = text.match(/-\s*(\d+)\s*(?:beds?|cots?)?\s*$/i) // trailing "-2", "-2 beds"
  if (m) return parseInt(m[1], 10) || 1
  // Only count words for the item's own category (beds/cots) — accompanying
  // descriptive counts like "with 6 chairs" describe a different item, not
  // this one, so they're deliberately excluded here.
  m = text.match(/\b(\d+)\s*(?:beds?|cots?)\b/i) // "2 beds", "5 cots"
  if (m) return parseInt(m[1], 10) || 1
  return 1
}

function extractSizeLabel(text) {
  if (!text) return null
  const dim = text.match(DIMENSION_RE)
  if (dim) return `${dim[1]}x${dim[2]} ft`
  const named = text.match(NAMED_BED_SIZE_RE)
  if (named) return `${named[1][0].toUpperCase()}${named[1].slice(1).toLowerCase()} Size`
  return null
}

/** Bed detail can list several differently-sized beds in one comma-separated segment. */
function parseBedDetail(detail) {
  const chunks = splitOutsideParens(detail, ',')
  if (chunks.length === 0) return [{ name: 'Bed/Other', qty: 1 }]
  return chunks.map((chunk) => {
    const size = extractSizeLabel(chunk)
    return { name: size ? `Bed (${size})` : 'Bed/Other', qty: extractQty(chunk) }
  })
}

/** Parse one "Category[: detail]" segment into one or more canonical items. */
function parseSegment(segment) {
  const idx = segment.indexOf(':')
  let category = (idx === -1 ? segment : segment.slice(0, idx)).trim()
  const detail = (idx === -1 ? '' : segment.slice(idx + 1)).trim()

  if (!category) return []

  // A bare category can itself carry a trailing qty marker: "Dining Table (2)"
  let bareQty = null
  const categoryQtyMatch = category.match(/^(.*?)\s*\((\d+)\)\s*$/)
  if (categoryQtyMatch) {
    category = categoryQtyMatch[1].trim()
    bareQty = parseInt(categoryQtyMatch[2], 10) || 1
  }
  if (!category) return []

  // Bed info is sometimes mis-entered under the wrong category label.
  const looksLikeBed = category === 'Bed/Other' || BED_WORD_RE.test(detail)
  if (looksLikeBed) {
    return parseBedDetail(detail || category)
  }

  if (TABLE_CATEGORIES.has(category)) {
    const size = extractSizeLabel(detail)
    const name = size ? `${category} (${size})` : category
    return [{ name, qty: bareQty ?? extractQty(detail) }]
  }

  return [{ name: category, qty: bareQty ?? extractQty(detail) }]
}

/**
 * Parse a Furniture & Fixtures cell into canonical {name, qty} items.
 * Detects the "Category: detail; Category: detail" export format; falls
 * back to a plain comma-separated item list for any other text shape.
 */
export function parseFurnitureText(text) {
  if (!text || typeof text !== 'string') return []
  const trimmed = text.trim()
  if (!trimmed || trimmed.toLowerCase() === 'nil' || trimmed === '_') return []

  const looksCategorized = trimmed.includes(':') || trimmed.includes(';')
  if (!looksCategorized) {
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, qty: 1 }))
  }

  return splitOutsideParens(trimmed, ';').flatMap(parseSegment)
}

/**
 * Format parsed items into the app's canonical comma-joined furniture
 * string, baking quantities into a "(xN)" suffix so downstream consumers
 * (see assetAnalytics.js) recover them without re-parsing free text.
 */
export function formatFurnitureItems(items) {
  if (!items || items.length === 0) return 'NIL'
  return items.map((it) => (it.qty && it.qty > 1 ? `${it.name} (x${it.qty})` : it.name)).join(', ')
}
