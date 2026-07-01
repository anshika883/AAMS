import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import FlatManageModal from '../../components/FlatManageModal'
import { useAams } from '../../lib/useAams'
import { exportToCsv } from '../../lib/export'

export default function BuildingInventory() {
  const { buildingCode } = useParams()
  const navigate = useNavigate()
  const code = String(buildingCode ?? 'nt1').toUpperCase()

  const { residentialNT1, residentialNT2, updateResidential } = useAams()
  
  // Local states
  const [term, setTerm] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)

  // Select appropriate units from central state
  const units = useMemo(() => {
    return code === 'NT2' ? residentialNT2 : residentialNT1
  }, [code, residentialNT1, residentialNT2])

  // Compute dynamic occupant metrics
  const stats = useMemo(() => {
    const occupied = units.filter((u) => u.occupancy === 'Occupied').length
    const vacant = units.length - occupied
    return { occupied, vacant }
  }, [units])

  // Filter units by search term
  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase()
    if (!t) return units
    return units.filter((u) => {
      const hay = `floor ${u.floor} ${u.roomNo} ${u.residentName} ${u.occupancy} ${u.furniture}`.toLowerCase()
      return hay.includes(t)
    })
  }, [term, units])

  // Handle Export
  const handleExport = () => {
    exportToCsv(
      `${code}_Building_Inventory`,
      ['floor', 'roomNo', 'occupancy', 'residentName', 'furniture'],
      units
    )
  }

  // Handle building switch
  const selectTower = (targetCode) => {
    setDropdownOpen(false)
    navigate(`/residential/${targetCode.toLowerCase()}`)
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
                <button
                  type="button"
                  onClick={() => selectTower('NT1')}
                  className="w-full px-4 py-2 text-left text-body-md hover:bg-surface-container text-on-surface"
                >
                  NT1 Tower
                </button>
                <button
                  type="button"
                  onClick={() => selectTower('NT2')}
                  className="w-full px-4 py-2 text-left text-body-md hover:bg-surface-container text-on-surface"
                >
                  NT2 Tower
                </button>
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

          <div className="flex items-center gap-3">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                <span className="text-xs font-bold text-secondary">Occupied: {stats.occupied}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-xs font-bold text-secondary">Vacant: {stats.vacant}</span>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/95 cursor-pointer shadow-sm"
              >
                <Icon name="download" className="text-sm" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Floor</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Room No.</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Occupancy</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Resident Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Furniture</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-secondary">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {filtered.map((u) => {
                  const occupied = u.occupancy === 'Occupied'
                  const statusClass = occupied
                    ? 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                    : 'bg-primary-container/10 text-primary border-primary/20'
                  const dotClass = occupied ? 'bg-[#22c55e]' : 'bg-primary'

                  return (
                    <tr key={u.roomNo} className="transition-colors hover:bg-surface-container-low/30">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">Floor {u.floor}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">{u.roomNo}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                          {u.occupancy}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant font-medium">
                        {u.residentName}
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">
                        {u.furniture === 'NIL' ? (
                          <span className="italic text-outline">NIL</span>
                        ) : (
                          u.furniture
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedUnit({ ...u, buildingCode: code })}
                          className="text-xs font-bold uppercase tracking-tight text-primary hover:underline cursor-pointer"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-outline italic">
                      No units matched the search query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Page>

      {/* Flat Management Modal */}
      <FlatManageModal
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        unit={selectedUnit}
        onSave={updateResidential}
      />
    </>
  )
}
