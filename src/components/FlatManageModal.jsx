import { useEffect, useState } from 'react'
import Icon from './Icon'

const AVAILABLE_FURNITURE = ['Bed', 'AC', 'Study Table', 'Wardrobe', 'Chair']

export default function FlatManageModal({ isOpen, onClose, unit, onSave }) {
  const [residentName, setResidentName] = useState('')
  const [occupancy, setOccupancy] = useState('Vacant')
  const [selectedFurniture, setSelectedFurniture] = useState([])

  useEffect(() => {
    if (unit) {
      setResidentName(unit.residentName === '-' ? '' : unit.residentName)
      setOccupancy(unit.occupancy || 'Vacant')
      
      const currentFurniture = unit.furniture && unit.furniture !== 'NIL'
        ? unit.furniture.split(',').map((f) => f.trim())
        : []
      setSelectedFurniture(currentFurniture)
    }
  }, [unit])

  if (!isOpen || !unit) return null

  const handleToggleFurniture = (item) => {
    if (selectedFurniture.includes(item)) {
      setSelectedFurniture(selectedFurniture.filter((f) => f !== item))
    } else {
      setSelectedFurniture([...selectedFurniture, item])
    }
  }

  const handleStatusChange = (status) => {
    setOccupancy(status)
    if (status === 'Vacant') {
      setResidentName('')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const furnitureStr = selectedFurniture.length > 0 ? selectedFurniture.join(', ') : 'NIL'
    onSave(unit.buildingCode, unit.roomNo, {
      occupancy,
      residentName: occupancy === 'Vacant' ? '-' : (residentName.trim() || 'Guest'),
      furniture: furnitureStr,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl transition-all duration-300 flex flex-col" style={{ width: '450px', maxWidth: '95vw' }}>
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon name="edit_square" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Manage Unit {unit.buildingCode}-{unit.roomNo}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Selection */}
          <div className="space-y-2">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Occupancy Status</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleStatusChange('Occupied')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-3 font-bold transition-all ${
                  occupancy === 'Occupied'
                    ? 'border-[#22c55e] bg-[#f0fdf4] text-[#15803d]'
                    : 'border-outline-variant hover:bg-surface-container-low text-secondary'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${occupancy === 'Occupied' ? 'bg-[#22c55e]' : 'bg-outline'}`} />
                Occupied
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('Vacant')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-3 font-bold transition-all ${
                  occupancy === 'Vacant'
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant hover:bg-surface-container-low text-secondary'
                }`}
              >
                <span className={`h-2.5 w-2.5 rounded-full ${occupancy === 'Vacant' ? 'bg-primary' : 'bg-outline'}`} />
                Vacant
              </button>
            </div>
          </div>

          {/* Resident Input */}
          {occupancy === 'Occupied' && (
            <div className="space-y-2">
              <label htmlFor="residentName" className="text-label-sm uppercase tracking-wider text-secondary">
                Resident Name
              </label>
              <div className="relative">
                <Icon name="person" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  id="residentName"
                  required
                  placeholder="Enter full name of the resident"
                  value={residentName}
                  onChange={(e) => setResidentName(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 pl-10 text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          )}

          {/* Furniture Selector */}
          <div className="space-y-2">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Furniture Inventory</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_FURNITURE.map((item) => {
                const selected = selectedFurniture.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleFurniture(item)}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                      selected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-outline-variant hover:bg-surface-container-low text-secondary'
                    }`}
                  >
                    {selected && <Icon name="check" className="text-xs" />}
                    {item}
                  </button>
                )
              })}
            </div>
            {selectedFurniture.length === 0 && (
              <p className="text-xs italic text-outline mt-1">No furniture assigned (NIL)</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary transition-colors hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-md transition-all hover:bg-primary-container"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
