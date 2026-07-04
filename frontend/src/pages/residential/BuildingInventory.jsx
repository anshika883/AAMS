import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import FlatManageModal from '../../components/FlatManageModal'
import BuildingMapModal from '../../components/BuildingMapModal'
import SmartExportModal from '../../components/SmartExportModal'
import { useAams } from '../../lib/useAams'

function getBaseRoom(roomNo) {
  return roomNo.replace(/[AB]$/i, '')
}

function hasSubUnits(units) {
  return units.some(u => /[AB]$/i.test(u.roomNo))
}

export default function BuildingInventory() {
  const { buildingCode } = useParams()
  const navigate = useNavigate()
  const code = String(buildingCode ?? 'nt1').toUpperCase()

  const { residentialNT1, residentialNT2, updateResidential } = useAams()
  
  const [term, setTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [mapOpen, setMapOpen] = useState(false)
  const [expandedRooms, setExpandedRooms] = useState(new Set())
  const [sortBy, setSortBy] = useState('asc') // 'asc' | 'desc'
  const [exportOpen, setExportOpen] = useState(false)

  const units = useMemo(() => {
    return code === 'NT2' ? residentialNT2 : residentialNT1
  }, [code, residentialNT1, residentialNT2])

  const isGrouped = useMemo(() => hasSubUnits(units), [units])

  const stats = useMemo(() => {
    const occupied = units.filter((u) => u.occupancy === 'Occupied').length
    const vacant = units.length - occupied
    const guesthouses = units.filter((u) => u.isGuesthouse).length
    return { occupied, vacant, guesthouses }
  }, [units])

  // Build grouped structure for NT2
  const groupedRows = useMemo(() => {
    if (!isGrouped) return null

    const t = term.trim().toLowerCase()
    const baseMap = new Map()

    units.forEach(u => {
      const base = getBaseRoom(u.roomNo)
      if (!baseMap.has(base)) baseMap.set(base, { baseKey: base, floor: u.floor, subUnits: [] })
      baseMap.get(base).subUnits.push(u)
    })

    // Sort sub-units within each group
    baseMap.forEach(g => {
      g.subUnits.sort((a, b) => {
        if (sortBy === 'asc') {
          return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
        } else {
          return b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
        }
      })
    })

    let groups = Array.from(baseMap.values())

    // Filter groups
    if (t) {
      groups = groups.filter(g => {
        return g.subUnits.some(u => {
          const hay = `floor ${u.floor} ${u.roomNo} ${g.baseKey} ${u.residentName} ${u.occupancy} ${u.furniture} ${u.deptt || ''}`.toLowerCase()
          return hay.includes(t)
        })
      })
    }

    // Sort groups by base room key
    groups.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.baseKey.localeCompare(b.baseKey, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        return b.baseKey.localeCompare(a.baseKey, undefined, { numeric: true, sensitivity: 'base' })
      }
    })

    return groups
  }, [units, isGrouped, term, sortBy])

  // Flat filtered list for NT1
  const filtered = useMemo(() => {
    if (isGrouped) return []
    const t = term.trim().toLowerCase()
    let list = [...units]
    if (t) {
      list = units.filter((u) => {
        const hay = `floor ${u.floor} ${u.roomNo} ${u.residentName} ${u.occupancy} ${u.furniture} ${u.deptt || ''}`.toLowerCase()
        return hay.includes(t)
      })
    }
    // Sort list by room number
    list.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        return b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      }
    })
    return list
  }, [term, units, isGrouped, sortBy])

  const filteredUnits = useMemo(() => {
    return isGrouped ? (groupedRows ? groupedRows.flatMap(g => g.subUnits) : []) : filtered
  }, [isGrouped, groupedRows, filtered])

  const handleExport = () => {
    setExportOpen(true)
  }

  const selectTower = (targetCode) => {
    setDropdownOpen(false)
    setExpandedRooms(new Set())
    navigate(`/residential/${targetCode.toLowerCase()}`)
  }

  const toggleExpand = (baseKey) => {
    setExpandedRooms(prev => {
      const next = new Set(prev)
      if (next.has(baseKey)) next.delete(baseKey)
      else next.add(baseKey)
      return next
    })
  }

  return (
    <>
      <TopBar
        searchPlaceholder="Search units, residents, or floor..."
        searchValue={term}
        onSearchChange={(e) => setTerm(e.target.value)}
        rightContent={
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 font-label-md text-label-md text-primary cursor-pointer hover:bg-surface-container"
            >
              <span>{code} Tower</span>
              <Icon name="expand_more" className={`text-sm text-primary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 z-50 w-40 rounded-lg border border-outline-variant bg-white py-1 shadow-lg">
                <button type="button" onClick={() => selectTower('NT1')} className="w-full px-4 py-2 text-left text-body-md hover:bg-surface-container text-on-surface">NT1 Tower</button>
                <button type="button" onClick={() => selectTower('NT2')} className="w-full px-4 py-2 text-left text-body-md hover:bg-surface-container text-on-surface">NT2 Tower</button>
              </div>
            )}
          </div>
        }
      />
      <Page>
        <div className="mb-lg flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant">
              <span>Residential</span>
              <Icon name="chevron_right" className="text-xs" />
              <span className="font-medium text-primary">{code} Building</span>
            </nav>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">{code} Building Inventory</h2>
            <p className="mt-1 text-on-surface-variant">
              Detailed structural overview of all units and current occupancy status.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Sort Room:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer border border-outline-variant rounded-md bg-white px-2 py-1.5 text-xs font-bold text-on-surface focus:outline-none shadow-xs"
              >
                <option value="asc">Ascending (101 → 402)</option>
                <option value="desc">Descending (402 → 101)</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-secondary">Occupied (Full): {stats.occupied}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-secondary">Vacant (Empty): {stats.vacant}</span>
              </div>
              {stats.guesthouses > 0 && (
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs font-bold text-secondary">Guesthouses: {stats.guesthouses}</span>
                </div>
              )}
              <button type="button" onClick={() => setMapOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-bold text-primary bg-white transition-colors hover:bg-surface-container-low cursor-pointer shadow-sm font-label-md">
                <Icon name="grid_view" className="text-sm" /> Interactive Map
              </button>
              <button type="button" onClick={handleExport} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/95 cursor-pointer shadow-sm">
                <Icon name="download" className="text-sm" /> Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  {isGrouped && <th className="px-3 py-4 w-10" />}
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Floor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Room No.</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Resident Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Deptt</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Occupancy</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary text-center">Count</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Furniture</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {/* NT2 Grouped Rows */}
                {isGrouped && groupedRows && groupedRows.map(group => {
                  const isExpanded = expandedRooms.has(group.baseKey)
                  const anyOccupied = group.subUnits.some(u => u.occupancy === 'Occupied')
                  const allOccupied = group.subUnits.every(u => u.occupancy === 'Occupied')
                  const totalCount = group.subUnits.reduce((sum, u) => sum + (u.occupantCount || 0), 0)

                  // Summary values
                  const depts = [...new Set(group.subUnits.map(u => u.deptt).filter(Boolean))]
                  const names = group.subUnits.map(u => u.residentName).filter(n => n && n !== '-')

                  let statusLabel = 'Vacant'
                  let statusClass = 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
                  let dotClass = 'bg-green-500'
                  if (allOccupied) {
                    statusLabel = 'Occupied'
                    statusClass = 'bg-red-50/50 text-red-700 border-red-200'
                    dotClass = 'bg-red-500'
                  } else if (anyOccupied) {
                    statusLabel = 'Partial'
                    statusClass = 'bg-amber-50/50 text-amber-700 border-amber-200'
                    dotClass = 'bg-amber-500'
                  }

                  const baseLabel = group.baseKey.replace(/^NTA\d-/, '')

                  return (
                    <GroupedTableRows
                      key={group.baseKey}
                      group={group}
                      isExpanded={isExpanded}
                      onToggle={() => toggleExpand(group.baseKey)}
                      statusLabel={statusLabel}
                      statusClass={statusClass}
                      dotClass={dotClass}
                      baseLabel={baseLabel}
                      depts={depts}
                      names={names}
                      totalCount={totalCount}
                      code={code}
                      onManage={(u) => setSelectedUnit({ ...u, buildingCode: code })}
                    />
                  )
                })}

                {/* NT1 Flat Rows */}
                {!isGrouped && filtered.map((u) => {
                  const occupied = u.occupancy === 'Occupied'
                  const isGH = u.isGuesthouse === true
                  const statusClass = isGH
                    ? (occupied ? 'bg-purple-50/80 text-purple-700 border-purple-200' : 'bg-violet-50/80 text-violet-700 border-violet-200')
                    : (occupied ? 'bg-red-50/50 text-red-700 border-red-200' : 'bg-emerald-50/50 text-emerald-700 border-emerald-200')
                  const dotClass = isGH
                    ? (occupied ? 'bg-purple-500' : 'bg-violet-400')
                    : (occupied ? 'bg-red-500' : 'bg-green-500')

                  return (
                    <tr key={u.roomNo} className={`transition-colors hover:bg-surface-container-low/30 ${isGH ? 'bg-violet-50/20' : ''}`}>
                      <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">Floor {u.floor}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">
                        <span className="flex items-center gap-2">
                          {u.roomNo}
                          {isGH && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 border border-purple-200 rounded px-1.5 py-0.5">GH</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{u.residentName}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{u.deptt || <span className="italic text-outline">—</span>}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} /> {u.occupancy}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-on-surface-variant font-semibold">{u.occupantCount || '—'}</td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant" style={{ maxWidth: '280px', wordBreak: 'break-word' }}>
                        {u.furniture === 'NIL' ? <span className="italic text-outline">NIL</span> : u.furniture}
                      </td>
                      <td className="px-6 py-4">
                        <button type="button" onClick={() => setSelectedUnit({ ...u, buildingCode: code })} className="text-xs font-bold uppercase tracking-tight text-primary hover:underline cursor-pointer">Manage</button>
                      </td>
                    </tr>
                  )
                })}

                {/* Empty state */}
                {((isGrouped && groupedRows && groupedRows.length === 0) || (!isGrouped && filtered.length === 0)) && (
                  <tr>
                    <td colSpan={isGrouped ? 9 : 8} className="px-6 py-12 text-center text-outline italic">
                      No units matched the search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Page>

      <FlatManageModal
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        unit={selectedUnit}
        onSave={updateResidential}
      />

      <BuildingMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        residentialNT1={residentialNT1}
        residentialNT2={residentialNT2}
        onManageFlat={(building, roomNo) => {
          const pool = building === 'NT2' ? residentialNT2 : residentialNT1
          const unit = pool.find((u) => u.roomNo === roomNo)
          if (unit) {
            setSelectedUnit({ ...unit, buildingCode: building })
          }
        }}
      />

      <SmartExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title={`Smart Export: ${code} Residential`}
        defaultFileName={`${code}_Residential_Inventory`}
        allData={units}
        filteredData={filteredUnits}
        availableColumns={[
          { key: 'floor', label: 'Floor No.' },
          { key: 'roomNo', label: 'Room/Flat No.' },
          { key: 'residentName', label: 'Resident Name' },
          { key: 'deptt', label: 'Department' },
          { key: 'occupancy', label: 'Occupancy Status' },
          { key: 'occupantCount', label: 'No. of Occupants' },
          { key: 'furniture', label: 'Furniture Inventory' },
        ]}
      />
    </>
  )
}

// ─── Grouped Table Rows (parent + expandable children) ────────────────

function GroupedTableRows({ group, isExpanded, onToggle, statusLabel, statusClass, dotClass, baseLabel, depts, names, totalCount, code, onManage }) {
  return (
    <>
      {/* Parent Row */}
      <tr className="transition-colors hover:bg-surface-container-low/30 cursor-pointer" onClick={onToggle}>
        <td className="pl-3 pr-1 py-4">
          <button type="button" className="p-1 rounded hover:bg-surface-container-high transition-colors cursor-pointer">
            <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-sm text-secondary" />
          </button>
        </td>
        <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">Floor {group.floor}</td>
        <td className="px-6 py-4 text-sm font-bold text-on-surface">
          <span className="flex items-center gap-1.5">
            {baseLabel}
            <span className="text-[10px] font-semibold text-secondary bg-surface-container rounded px-1.5 py-0.5">
              {group.subUnits.length} units
            </span>
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">{names.length > 0 ? names.join(', ') : '—'}</td>
        <td className="px-6 py-4 text-sm text-on-surface-variant">{depts.length > 0 ? depts.join(', ') : <span className="italic text-outline">—</span>}</td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} /> {statusLabel}
          </span>
        </td>
        <td className="px-6 py-4 text-sm text-center text-on-surface-variant font-semibold">{totalCount || '—'}</td>
        <td className="px-6 py-4 text-sm text-on-surface-variant">—</td>
        <td className="px-6 py-4 text-xs font-bold text-primary">
          <span className="flex items-center gap-1">
            <Icon name={isExpanded ? 'unfold_less' : 'unfold_more'} className="text-sm" />
            {isExpanded ? 'Collapse' : 'Expand'}
          </span>
        </td>
      </tr>

      {/* Child Rows */}
      {isExpanded && group.subUnits.map(u => {
        const occupied = u.occupancy === 'Occupied'
        const subStatusClass = occupied ? 'bg-red-50/50 text-red-700 border-red-200' : 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
        const subDotClass = occupied ? 'bg-red-500' : 'bg-green-500'
        const suffix = u.roomNo.slice(-1)

        return (
          <tr key={u.roomNo} className="bg-surface-container-low/20 transition-colors hover:bg-surface-container-low/50">
            <td className="pl-3 pr-1 py-3">
              <div className="flex justify-center">
                <span className="w-px h-4 bg-outline-variant" />
              </div>
            </td>
            <td className="px-6 py-3 text-sm text-on-surface-variant" />
            <td className="px-6 py-3 text-sm text-on-surface">
              <span className="flex items-center gap-2">
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white ${subDotClass}`}>{suffix}</span>
                <span className="font-semibold">{u.roomNo}</span>
              </span>
            </td>
            <td className="px-6 py-3 text-sm text-on-surface-variant font-medium">{u.residentName}</td>
            <td className="px-6 py-3 text-sm text-on-surface-variant">{u.deptt || <span className="italic text-outline">—</span>}</td>
            <td className="px-6 py-3">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${subStatusClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${subDotClass}`} /> {u.occupancy}
              </span>
            </td>
            <td className="px-6 py-3 text-sm text-center text-on-surface-variant font-semibold">{u.occupantCount || '—'}</td>
            <td className="px-6 py-3 text-sm text-on-surface-variant" style={{ maxWidth: '280px', wordBreak: 'break-word' }}>
              {u.furniture === 'NIL' ? <span className="italic text-outline">NIL</span> : u.furniture}
            </td>
            <td className="px-6 py-3">
              <button type="button" onClick={(e) => { e.stopPropagation(); onManage(u) }} className="text-xs font-bold uppercase tracking-tight text-primary hover:underline cursor-pointer">Manage</button>
            </td>
          </tr>
        )
      })}
    </>
  )
}
