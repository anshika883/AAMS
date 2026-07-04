import { useState, useMemo } from 'react'
import Icon from './Icon'
import { useAams } from '../lib/useAams'

/**
 * Extract the base room key from a room number.
 * NTA2-305A → NTA2-305, NTA1-101 → NTA1-101
 */
function getBaseRoom(roomNo) {
  return roomNo.replace(/[AB]$/i, '')
}

/**
 * Check if a building has sub-units (A/B pattern).
 */
function hasSubUnits(units) {
  return units.some(u => /[AB]$/i.test(u.roomNo))
}

export default function BuildingMapModal({
  isOpen,
  onClose,
  residentialNT1,
  residentialNT2,
  onManageFlat,
}) {
  const { bookings } = useAams()
  const [activeTab, setActiveTab] = useState('NT1')
  const [selectedBaseRoom, setSelectedBaseRoom] = useState(null)
  const [selectedSubUnit, setSelectedSubUnit] = useState(null) // for NT1 single-unit selection

  const units = activeTab === 'NT1' ? residentialNT1 : residentialNT2
  const isGrouped = hasSubUnits(units)

  // Build floor → grouped rooms structure
  const floorData = useMemo(() => {
    if (!isGrouped) {
      // NT1: simple floor grouping
      const floors = {}
      units.forEach(u => {
        if (!floors[u.floor]) floors[u.floor] = []
        floors[u.floor].push(u)
      })
      return floors
    }

    // NT2: group by base room, then by floor
    const baseMap = {} // baseKey → { floor, baseKey, subUnits: [A, B] }
    units.forEach(u => {
      const base = getBaseRoom(u.roomNo)
      if (!baseMap[base]) {
        baseMap[base] = { floor: u.floor, baseKey: base, subUnits: [] }
      }
      baseMap[base].subUnits.push(u)
    })

    // Sort sub-units within each group
    Object.values(baseMap).forEach(g => {
      g.subUnits.sort((a, b) => a.roomNo.localeCompare(b.roomNo))
    })

    // Group by floor
    const floors = {}
    Object.values(baseMap).forEach(g => {
      if (!floors[g.floor]) floors[g.floor] = []
      floors[g.floor].push(g)
    })

    // Sort groups within each floor
    Object.values(floors).forEach(arr => {
      arr.sort((a, b) => a.baseKey.localeCompare(b.baseKey))
    })

    return floors
  }, [units, isGrouped])

  const sortedFloors = Object.keys(floorData).map(Number).sort((a, b) => b - a)

  // Resolve selected data
  let selectedGroup = null
  let singleSelectedUnit = null

  if (isGrouped && selectedBaseRoom) {
    // Find the group across all floors
    for (const floorArr of Object.values(floorData)) {
      const found = floorArr.find(g => g.baseKey === selectedBaseRoom)
      if (found) { selectedGroup = found; break }
    }
  } else if (!isGrouped && selectedSubUnit) {
    singleSelectedUnit = units.find(u => u.roomNo === selectedSubUnit)
  }

  const hasDetail = !!selectedGroup || !!singleSelectedUnit

  const handleCellClick = (key) => {
    if (isGrouped) {
      setSelectedBaseRoom(key)
      setSelectedSubUnit(null)
    } else {
      setSelectedSubUnit(key)
      setSelectedBaseRoom(null)
    }
  }

  const clearSelection = () => {
    setSelectedBaseRoom(null)
    setSelectedSubUnit(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="max-h-[90vh] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col transition-all duration-300"
        style={{ width: hasDetail ? '1100px' : '850px', maxWidth: '95vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="grid_view" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Interactive Building Occupancy Map
            </h3>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface cursor-pointer">
            <Icon name="close" />
          </button>
        </div>

        {/* Controls */}
        <div className="border-b border-outline-variant bg-surface-container-low px-6 py-3 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-surface-container p-1 w-fit">
            {['NT1', 'NT2'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); clearSelection() }}
                className={`rounded-md px-4 py-1.5 text-label-md font-bold transition-all cursor-pointer ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'}`}
              >
                {tab} Tower
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-secondary flex-wrap">
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" /><span>Occupied</span></div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-500" /><span>Vacant</span></div>
            {isGrouped && (
              <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500" /><span>Partial</span></div>
            )}
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-purple-600" /><span>GH Occupied</span></div>
            <div className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-violet-400" /><span>GH Vacant</span></div>
            <span className="text-outline">| Click unit to view details</span>
          </div>
        </div>

        {/* Grid + Detail Split */}
        <div className="flex-grow overflow-hidden flex bg-surface-bright">

          {/* Grid */}
          <div className="flex-grow overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl border border-outline-variant rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <h4 className="text-center font-headline-sm text-headline-sm text-primary mb-6">
                {activeTab} Tower Occupancy Grid
              </h4>

              <div className="space-y-2">
                {sortedFloors.map(floorNum => {
                  const items = floorData[floorNum]

                  if (isGrouped) {
                    return (
                      <div key={floorNum} className="flex items-center gap-3">
                        <span className="w-16 text-right text-xs font-bold text-secondary shrink-0">Floor {floorNum}</span>
                        <div className="grid grid-cols-6 gap-2 flex-grow">
                          {items.map(group => {
                            const anyOccupied = group.subUnits.some(u => u.occupancy === 'Occupied')
                            const allOccupied = group.subUnits.every(u => u.occupancy === 'Occupied')
                            const isSelected = selectedBaseRoom === group.baseKey
                            const label = group.baseKey.replace(/^NTA\d-/, '')

                            let bgClass = 'bg-green-500 hover:bg-green-600'
                            if (allOccupied) bgClass = 'bg-red-500 hover:bg-red-600'
                            else if (anyOccupied) bgClass = 'bg-amber-500 hover:bg-amber-600'

                            return (
                              <button
                                key={group.baseKey}
                                type="button"
                                onClick={() => handleCellClick(group.baseKey)}
                                title={`${group.baseKey} — ${group.subUnits.map(u => u.roomNo.slice(-1) + ':' + u.occupancy).join(', ')}`}
                                className={`cursor-pointer flex flex-col justify-center items-center py-2.5 rounded-lg font-bold text-xs text-white transition-all shadow-sm hover:scale-105 focus:outline-none ${isSelected ? 'ring-4 ring-primary ring-offset-2 scale-105' : ''} ${bgClass}`}
                              >
                                <span className="truncate w-full text-center text-[10px] sm:text-xs">{label}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  // NT1: flat list
                  const sortedUnits = [...items].sort((a, b) => a.roomNo.localeCompare(b.roomNo))
                  return (
                    <div key={floorNum} className="flex items-center gap-3">
                      <span className="w-16 text-right text-xs font-bold text-secondary shrink-0">Floor {floorNum}</span>
                      <div className="grid grid-cols-6 gap-2 flex-grow">
                        {sortedUnits.map(u => {
                          const occupied = u.occupancy === 'Occupied'
                          const isGuesthouse = u.isGuesthouse === true
                          const isSelected = selectedSubUnit === u.roomNo
                          const label = u.roomNo.replace(/^NTA\d-/, '')
                          let bgClass = occupied
                            ? (isGuesthouse ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-500 hover:bg-red-600')
                            : (isGuesthouse ? 'bg-violet-400 hover:bg-violet-500' : 'bg-green-500 hover:bg-green-600')
                          return (
                            <button
                              key={u.roomNo}
                              type="button"
                              onClick={() => handleCellClick(u.roomNo)}
                              title={`${u.roomNo}${isGuesthouse ? ' [GH]' : ''} — ${occupied ? u.residentName : 'Vacant'}`}
                              className={`cursor-pointer flex flex-col justify-center items-center py-2.5 rounded-lg font-bold text-xs text-white transition-all shadow-sm hover:scale-105 focus:outline-none ${isSelected ? 'ring-4 ring-primary ring-offset-2 scale-105' : ''} ${bgClass}`}
                            >
                              <span className="truncate w-full text-center text-[10px] sm:text-xs">{label}</span>
                              {isGuesthouse && <span className="text-[8px] opacity-80">GH</span>}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 text-center text-xs text-outline italic">
                Floor 17 (Top) down to Floor 1 (Ground level)
              </div>
            </div>
          </div>

          {/* Detail Panel — Grouped (NT2 with A/B sub-units) */}
          {selectedGroup && (
            <GroupedDetailPanel
              group={selectedGroup}
              activeTab={activeTab}
              onManageFlat={onManageFlat}
              onClose={clearSelection}
            />
          )}

          {/* Detail Panel — Single unit (NT1) */}
          {singleSelectedUnit && (
            <SingleDetailPanel
              unit={singleSelectedUnit}
              activeTab={activeTab}
              onManageFlat={onManageFlat}
              onClose={clearSelection}
              bookings={bookings}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant bg-surface-container px-6 py-4 flex justify-end shrink-0">
          <button type="button" onClick={onClose} className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary bg-white transition-colors hover:bg-surface-container cursor-pointer">
            Close Map
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Grouped Detail Panel (NT2 A/B Sub-Map) ───────────────────────────

function GroupedDetailPanel({ group, activeTab, onManageFlat, onClose }) {
  const baseLabel = group.baseKey.replace(/^NTA\d-/, '')

  return (
    <div className="w-96 shrink-0 border-l border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col animate-slide-in overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-outline-variant/40 shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-outline">{activeTab} Tower · Unit</span>
            <h4 className="text-xl font-bold text-on-surface">Flat {baseLabel}</h4>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-secondary hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer">
            <Icon name="close" className="text-sm" />
          </button>
        </div>

        {/* Sub-Unit Mini Map */}
        <div className="mt-3 flex gap-2">
          {group.subUnits.map(u => {
            const suffix = u.roomNo.slice(-1)
            const occupied = u.occupancy === 'Occupied'
            return (
              <div key={u.roomNo} className={`flex-1 rounded-lg border-2 p-2 text-center transition-all ${occupied ? 'border-red-300 bg-red-50/60' : 'border-emerald-300 bg-emerald-50/60'}`}>
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${occupied ? 'bg-red-500' : 'bg-green-500'}`}>
                  {suffix}
                </span>
                <p className={`text-[10px] font-bold uppercase mt-1 ${occupied ? 'text-red-700' : 'text-emerald-700'}`}>{u.occupancy}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sub-Unit Cards (scrollable) */}
      <div className="flex-grow overflow-y-auto px-5 py-4 space-y-4">
        {group.subUnits.map(u => (
          <SubUnitCard key={u.roomNo} unit={u} activeTab={activeTab} onManageFlat={onManageFlat} />
        ))}
      </div>
    </div>
  )
}

function SubUnitCard({ unit, activeTab, onManageFlat }) {
  const suffix = unit.roomNo.slice(-1)
  const occupied = unit.occupancy === 'Occupied'
  const borderColor = occupied ? 'border-red-200' : 'border-emerald-200'
  const bgColor = occupied ? 'bg-red-50/40' : 'bg-emerald-50/40'
  const accentColor = occupied ? 'text-red-700' : 'text-emerald-700'
  const dotColor = occupied ? 'bg-red-500' : 'bg-green-500'

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4 space-y-3`}>
      {/* Sub-unit header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${dotColor}`}>{suffix}</span>
          <span className="font-bold text-sm text-on-surface">{unit.roomNo}</span>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${occupied ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} /> {unit.occupancy}
        </span>
      </div>

      {/* Details */}
      {occupied ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon name="person" className={`text-sm ${accentColor}`} />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">Resident</p>
              <p className="text-xs font-bold text-on-surface">{unit.residentName}</p>
            </div>
          </div>
          {unit.deptt && (
            <div className="flex items-center gap-2">
              <Icon name="domain" className={`text-sm ${accentColor}`} />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">Department</p>
                <p className="text-xs font-bold text-on-surface">{unit.deptt}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-emerald-700 font-medium">No active resident. Ready for allocation.</p>
      )}

      {/* Furniture */}
      {unit.furniture && unit.furniture !== 'NIL' && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-secondary mb-1">Furniture</p>
          <p className="text-[11px] text-on-surface-variant leading-relaxed" style={{ wordBreak: 'break-word' }}>{unit.furniture}</p>
        </div>
      )}

      {/* Manage button */}
      <button
        type="button"
        onClick={() => onManageFlat(activeTab, unit.roomNo)}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-white py-1.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all cursor-pointer shadow-xs"
      >
        <Icon name="edit" className="text-xs" /> Manage {unit.roomNo.slice(-1)}
      </button>
    </div>
  )
}

// ─── Single Detail Panel (NT1, unchanged logic) ───────────────────────

function SingleDetailPanel({ unit, activeTab, onManageFlat, onClose, bookings = [] }) {
  const roomHistory = bookings
    .filter((b) => b.roomNo === unit.roomNo)
    .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate))
    .slice(0, 5)
  const getFurnitureIcon = (item) => {
    const lower = item.toLowerCase()
    if (lower.includes('bed') || lower.includes('mattress')) return 'single_bed'
    if (lower.includes('ac')) return 'ac_unit'
    if (lower.includes('chair')) return 'chair'
    if (lower.includes('table') || lower.includes('desk')) return 'table_restaurant'
    if (lower.includes('fan') || lower.includes('cooler')) return 'mode_fan'
    if (lower.includes('wardrobe')) return 'wardrobe'
    if (lower.includes('fridge') || lower.includes('refrigerator')) return 'kitchen'
    if (lower.includes('geyser') || lower.includes('heater')) return 'water_heater'
    if (lower.includes('sofa')) return 'weekend'
    if (lower.includes('tv') || lower.includes('television')) return 'tv'
    return 'shelves'
  }

  return (
    <div className="w-80 shrink-0 border-l border-outline-variant bg-surface-container-lowest p-6 shadow-2xl flex flex-col justify-between animate-slide-in">
      <div className="space-y-6 overflow-y-auto pr-1 hide-scrollbar">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-outline">{activeTab} Tower Unit Details</span>
            <h4 className="text-2xl font-bold text-on-surface">Flat {unit.roomNo}</h4>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-secondary hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer">
            <Icon name="close" className="text-sm" />
          </button>
        </div>

        <div className={`p-4 rounded-xl border flex flex-col gap-3 ${unit.occupancy === 'Occupied' ? 'bg-red-50/50 border-red-100 text-red-950' : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'}`}>
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full animate-pulse ${unit.occupancy === 'Occupied' ? 'bg-red-500' : 'bg-green-500'}`} />
            <span className="font-bold text-sm tracking-wide uppercase">{unit.occupancy}</span>
          </div>
          {unit.occupancy === 'Occupied' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-700"><Icon name="person" /></div>
                <div>
                  <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Resident Name</p>
                  <p className="font-bold text-base text-red-950">{unit.residentName}</p>
                </div>
              </div>
              {unit.deptt && (
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-700"><Icon name="domain" /></div>
                  <div>
                    <p className="text-[10px] text-red-700 font-bold uppercase tracking-wider">Department</p>
                    <p className="font-bold text-sm text-red-950">{unit.deptt}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-medium text-emerald-800">This unit has no active resident. It is empty and ready for allocation.</p>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-xs text-secondary font-bold uppercase tracking-wider">Furniture &amp; Fixtures Inventory</p>
          {(!unit.furniture || unit.furniture === 'NIL' || !unit.furniture.trim()) ? (
            <div className="p-4 rounded-xl border border-outline-variant bg-surface text-center italic text-outline text-xs">No furniture assigned to this flat.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {unit.furniture.split(',').map((item, idx) => {
                const cleanItem = item.trim()
                if (!cleanItem) return null
                return (
                  <div key={idx} className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs text-on-surface font-medium hover:bg-surface-container transition-colors">
                    <Icon name={getFurnitureIcon(cleanItem)} className="text-xs text-primary" />
                    <span>{cleanItem}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Guesthouse history */}
      {unit.isGuesthouse && roomHistory.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
            <Icon name="history" className="text-sm text-purple-600" /> Guesthouse Booking History
          </p>
          <div className="space-y-1.5">
            {roomHistory.map((b) => (
              <div key={b.id} className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-900">{b.guestName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.bookingStatus === 'Occupied' ? 'bg-red-100 text-red-700' :
                    b.bookingStatus === 'Checked Out' ? 'bg-gray-100 text-gray-600' :
                    'bg-blue-100 text-blue-700'
                  }`}>{b.bookingStatus}</span>
                </div>
                <span className="text-violet-700">{b.expectedCheckInDate} → {b.expectedCheckOutDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-outline-variant flex flex-col gap-2 shrink-0">
        <button type="button" onClick={() => { onManageFlat(activeTab, unit.roomNo); onClose() }} className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-bold text-on-primary shadow-md hover:bg-primary-container transition-all cursor-pointer text-sm">
          <Icon name="edit" className="text-sm" /> Manage / Edit Flat
        </button>
        <button type="button" onClick={onClose} className="w-full rounded-lg border border-outline-variant py-2.5 font-bold text-secondary bg-white hover:bg-surface-container transition-all cursor-pointer text-xs text-center">
          Close Details
        </button>
      </div>
    </div>
  )
}
