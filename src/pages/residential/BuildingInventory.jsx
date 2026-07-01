import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import { generateUnits } from '../../lib/units'

export default function BuildingInventory() {
  const { buildingCode } = useParams()
  const code = String(buildingCode ?? 'nt1').toUpperCase()

  const units = useMemo(() => generateUnits({ buildingCode: code, seed: 42 }), [code])
  const [term, setTerm] = useState('')

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase()
    if (!t) return units
    return units.filter((u) => {
      const hay = `${u.floor} ${u.roomNo} ${u.residentName} ${u.occupancy}`.toLowerCase()
      return hay.includes(t)
    })
  }, [term, units])

  return (
    <>
      <TopBar
        searchPlaceholder="Search units, residents, or floor..."
        searchValue={term}
        onSearchChange={(e) => setTerm(e.target.value)}
        rightContent={
          <div className="flex items-center gap-2">
            <span className="font-label-md text-label-md text-primary">{code} Tower</span>
            <Icon name="expand_more" className="text-sm text-primary" />
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
            <div className="flex items-center gap-6 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                <span className="text-xs font-medium text-secondary">Occupied: 84</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs font-medium text-secondary">Vacant: 12</span>
              </div>
              <button
                type="button"
                className="flex items-center gap-2 rounded bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary/90"
              >
                <Icon name="download" className="text-sm" />
                Export Data
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container">
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-on-surface">Floor</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-on-surface">Room No.</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-on-surface">Occupancy</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-on-surface">Resident Name</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-on-surface">Furniture</th>
                  <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-on-surface">Action</th>
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
                    <tr key={u.roomNo} className="transition-colors hover:bg-surface-container-low/50">
                      <td className="px-6 py-4 text-sm font-medium text-on-surface-variant">Floor {u.floor}</td>
                      <td className="px-6 py-4 text-sm font-bold text-on-surface">{u.roomNo}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                          {u.occupancy}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-on-surface-variant">{u.residentName}</td>
                      <td className="px-6 py-4 text-sm italic text-on-surface-variant">{u.furniture}</td>
                      <td className="px-6 py-4">
                        <button type="button" className="text-xs font-bold uppercase tracking-tight text-primary hover:underline">
                          Manage
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Page>
    </>
  )
}
