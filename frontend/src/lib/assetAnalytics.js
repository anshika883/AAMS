/**
 * assetAnalytics.js — derives Asset Management (furniture & fixtures) analytics
 * from the existing Residential and Guest House records. Read-only aggregation;
 * no separate storage — Residential/Guest House data stays the single source
 * of truth, so edits there are reflected here automatically.
 */

// A residential unit's furniture is a comma-separated string ('NIL' when empty).
// A guesthouse room's furniture is an array of strings, occasionally suffixed
// with a quantity marker like 'Queen Bed (x2)'.
const QTY_SUFFIX_RE = /\s*\(x(\d+)\)\s*$/i

function parseItem(raw) {
  const trimmed = raw.trim()
  const match = trimmed.match(QTY_SUFFIX_RE)
  if (match) {
    return { name: trimmed.replace(QTY_SUFFIX_RE, '').trim(), qty: parseInt(match[1], 10) || 1 }
  }
  return { name: trimmed, qty: 1 }
}

function itemsFromResidentialUnit(unit) {
  if (!unit.furniture || unit.furniture === 'NIL') return []
  return unit.furniture
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
    .map(parseItem)
}

function itemsFromGuestRoom(room) {
  if (!room.furniture || room.furniture.length === 0) return []
  return room.furniture.map(parseItem)
}

// Blocks are the filterable "building" units shown in the breakdown table —
// residential towers and guest houses are tracked separately since they're
// distinct records, but roll up to the same NT1/NT2 building code.
const BLOCKS = [
  { key: 'NT1-residential', buildingCode: 'NT1', label: 'NT1 Residential' },
  { key: 'NT2-residential', buildingCode: 'NT2', label: 'NT2 Residential' },
  { key: 'NT1-guesthouse', buildingCode: 'NT1', label: 'NT1 Guest House' },
  { key: 'NT2-guesthouse', buildingCode: 'NT2', label: 'NT2 Guest House' },
]

/**
 * Build the full asset analytics model from raw records.
 * @param {object} sources
 * @param {Array} sources.residentialNT1
 * @param {Array} sources.residentialNT2
 * @param {Array} sources.guestHouseNT1
 * @param {Array} sources.guestHouseNT2
 */
export function buildAssetAnalytics({ residentialNT1, residentialNT2, guestHouseNT1, guestHouseNT2 }) {
  const blockSources = {
    'NT1-residential': residentialNT1,
    'NT2-residential': residentialNT2,
    'NT1-guesthouse': guestHouseNT1,
    'NT2-guesthouse': guestHouseNT2,
  }
  const blockParsers = {
    'NT1-residential': itemsFromResidentialUnit,
    'NT2-residential': itemsFromResidentialUnit,
    'NT1-guesthouse': itemsFromGuestRoom,
    'NT2-guesthouse': itemsFromGuestRoom,
  }

  // typeStats: furnitureName -> { totalCount, flatsWithIt (Set of "blockKey-roomNo"), byBuilding: { NT1, NT2 } }
  const typeStats = new Map()
  // blockTypeQty: blockKey -> Map(furnitureName -> qty)
  const blockTypeQty = new Map(BLOCKS.map((b) => [b.key, new Map()]))

  BLOCKS.forEach((block) => {
    const records = blockSources[block.key] || []
    const parse = blockParsers[block.key]

    records.forEach((record) => {
      const items = parse(record)
      if (items.length === 0) return

      const roomKey = `${block.key}-${record.roomNo}`
      const seenInRoom = new Set()

      items.forEach(({ name, qty }) => {
        if (!name) return

        if (!typeStats.has(name)) {
          typeStats.set(name, { totalCount: 0, flatsWithIt: new Set(), byBuilding: { NT1: 0, NT2: 0 } })
        }
        const stat = typeStats.get(name)
        stat.totalCount += qty
        stat.byBuilding[block.buildingCode] += qty
        if (!seenInRoom.has(name)) {
          stat.flatsWithIt.add(roomKey)
          seenInRoom.add(name)
        }

        const typeQtyMap = blockTypeQty.get(block.key)
        typeQtyMap.set(name, (typeQtyMap.get(name) || 0) + qty)
      })
    })
  })

  // Furniture Type Segregation Table
  const furnitureTypeTable = Array.from(typeStats.entries())
    .map(([type, stat]) => {
      const mostPresentBuilding =
        stat.byBuilding.NT1 === stat.byBuilding.NT2
          ? 'NT1 & NT2 (tied)'
          : stat.byBuilding.NT1 > stat.byBuilding.NT2
          ? 'NT1'
          : 'NT2'
      return {
        type,
        totalCount: stat.totalCount,
        flatsCount: stat.flatsWithIt.size,
        mostPresentBuilding,
        byBuilding: stat.byBuilding,
      }
    })
    .sort((a, b) => b.totalCount - a.totalCount)

  // Building-wise Breakdown Table (flattened, one row per block x furniture type)
  const buildingBreakdownTable = []
  BLOCKS.forEach((block) => {
    const typeQtyMap = blockTypeQty.get(block.key)
    Array.from(typeQtyMap.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, qty]) => {
        buildingBreakdownTable.push({ block: block.label, buildingCode: block.buildingCode, type, quantity: qty })
      })
  })

  // Most-allotted-furniture bar chart data (ranked, descending)
  const rankedByCount = furnitureTypeTable.map((r) => ({ type: r.type, value: r.totalCount }))
  const rankedByFlats = furnitureTypeTable
    .map((r) => ({ type: r.type, value: r.flatsCount }))
    .sort((a, b) => b.value - a.value)

  // Per-building distribution for the stacked/grouped bar (top furniture types only, to stay legible)
  const topTypesForDistribution = furnitureTypeTable.slice(0, 8).map((r) => r.type)
  const buildingDistribution = topTypesForDistribution.map((type) => {
    const stat = typeStats.get(type)
    return { type, NT1: stat.byBuilding.NT1, NT2: stat.byBuilding.NT2 }
  })

  // Overall portal-wide proportion (top 5 + "Other")
  const totalUnits = furnitureTypeTable.reduce((sum, r) => sum + r.totalCount, 0)
  const top5 = furnitureTypeTable.slice(0, 5)
  const otherCount = furnitureTypeTable.slice(5).reduce((sum, r) => sum + r.totalCount, 0)
  const proportionData = [
    ...top5.map((r) => ({ type: r.type, value: r.totalCount })),
    ...(otherCount > 0 ? [{ type: 'Other', value: otherCount }] : []),
  ]

  const mostAllotted = furnitureTypeTable[0] || null
  const buildingsCoveredByMostAllotted = mostAllotted
    ? [mostAllotted.byBuilding.NT1 > 0 ? 'NT1' : null, mostAllotted.byBuilding.NT2 > 0 ? 'NT2' : null].filter(Boolean)
        .length
    : 0

  return {
    furnitureTypeTable,
    buildingBreakdownTable,
    rankedByCount,
    rankedByFlats,
    buildingDistribution,
    proportionData,
    totalUnits,
    mostAllotted,
    buildingsCoveredByMostAllotted,
    blocks: BLOCKS,
  }
}
