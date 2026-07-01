import { useState } from 'react'
import Icon from './Icon'

export default function BuildingMapModal({
  isOpen,
  onClose,
  residentialNT1,
  residentialNT2,
  onManageFlat,
}) {
  const [activeTab, setActiveTab] = useState('NT1')

  if (!isOpen) return null

  const units = activeTab === 'NT1' ? residentialNT1 : residentialNT2

  // Group units by floor
  const floors = {}
  units.forEach((u) => {
    if (!floors[u.floor]) {
      floors[u.floor] = []
    }
    floors[u.floor].push(u)
  })

  // Sort floors descending
  const sortedFloors = Object.keys(floors)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col" style={{ width: '850px', maxWidth: '95vw' }}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="grid_view" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Interactive Building Occupancy Map
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Modal Controls */}
        <div className="border-b border-outline-variant bg-surface-container-low px-6 py-3 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-surface-container p-1 w-fit">
            <button
              type="button"
              onClick={() => setActiveTab('NT1')}
              className={`rounded-md px-4 py-1.5 text-label-md font-bold transition-all ${
                activeTab === 'NT1' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
              }`}
            >
              NT1 Tower
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('NT2')}
              className={`rounded-md px-4 py-1.5 text-label-md font-bold transition-all ${
                activeTab === 'NT2' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
              }`}
            >
              NT2 Tower
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-secondary">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-[#22c55e]" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-primary" />
              <span>Vacant</span>
            </div>
            <span className="text-outline">| Click cell to edit</span>
          </div>
        </div>

        {/* Map Grid Container */}
        <div className="flex-grow overflow-y-auto p-6 bg-surface-bright">
          <div className="mx-auto max-w-2xl border border-outline-variant rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <h4 className="text-center font-headline-sm text-headline-sm text-primary mb-6">
              {activeTab} Accommodation Grid
            </h4>
            
            <div className="space-y-2">
              {sortedFloors.map((floorNum) => {
                const floorUnits = floors[floorNum]
                // Sort units by room number ascending
                const sortedUnits = [...floorUnits].sort((a, b) => a.roomNo.localeCompare(b.roomNo))

                return (
                  <div key={floorNum} className="flex items-center gap-3">
                    <span className="w-16 text-right text-xs font-bold text-secondary shrink-0">
                      Floor {floorNum}
                    </span>
                    <div className="grid grid-cols-6 gap-2 flex-grow">
                      {sortedUnits.map((u) => {
                        const occupied = u.occupancy === 'Occupied'
                        const tooltipText = occupied
                          ? `Flat ${u.roomNo}: Occupied by ${u.residentName}`
                          : `Flat ${u.roomNo}: Vacant`
                        
                        return (
                          <div
                            key={u.roomNo}
                            onClick={() => onManageFlat(activeTab, u.roomNo)}
                            title={tooltipText}
                            className={`group relative cursor-pointer flex flex-col justify-center items-center py-2.5 rounded-lg font-bold text-xs text-white transition-all shadow-sm hover:scale-105 ${
                              occupied
                                ? 'bg-[#22c55e] hover:bg-[#16a34a]'
                                : 'bg-primary hover:bg-primary-container'
                            }`}
                          >
                            <span>{u.roomNo}</span>
                            {/* Hover Details (Micro-popover) */}
                            <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-48 -translate-x-1/2 rounded bg-inverse-surface px-2 py-1 text-[10px] font-medium text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100 shadow-md text-center">
                              {tooltipText}
                              <br />
                              <span className="italic text-outline-variant text-[9px] mt-0.5 block">
                                Furniture: {u.furniture}
                              </span>
                            </span>
                          </div>
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

        {/* Modal Footer */}
        <div className="border-t border-outline-variant bg-surface-container px-6 py-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary bg-white transition-colors hover:bg-surface-container"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  )
}
