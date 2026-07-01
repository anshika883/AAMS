import { useEffect, useState } from 'react'
import Icon from './Icon'

const AVAILABLE_FURNITURE = [
  'King Bed',
  'Queen Bed',
  'Twin Beds',
  'Single Bed',
  'AC',
  'Mini Fridge',
  'Study Table',
  'Sofa Set',
  'Armchair',
  'Wardrobe',
  'Coffee Table',
  'Dressing Mirror',
]

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']

export default function GuestRoomModal({ isOpen, onClose, room, onSave, mode = 'add' }) {
  const [roomNo, setRoomNo] = useState('')
  const [floor, setFloor] = useState('Ground Floor')
  const [status, setStatus] = useState('Vacant')
  const [maintenance, setMaintenance] = useState('none')
  const [selectedFurniture, setSelectedFurniture] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      if (mode === 'edit' && room) {
        setRoomNo(room.roomNo)
        setFloor(room.floor)
        setStatus(room.status || 'Vacant')
        setMaintenance(room.maintenance || 'none')
        setSelectedFurniture(room.furniture || [])
      } else {
        setRoomNo('')
        setFloor('Ground Floor')
        setStatus('Vacant')
        setMaintenance('none')
        setSelectedFurniture([])
      }
    }
  }, [isOpen, room, mode])

  if (!isOpen) return null

  const handleToggleFurniture = (item) => {
    if (selectedFurniture.includes(item)) {
      setSelectedFurniture(selectedFurniture.filter((f) => f !== item))
    } else {
      setSelectedFurniture([...selectedFurniture, item])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!roomNo.trim()) {
      setError('Room number is required')
      return
    }

    const payload = {
      floor,
      roomNo: roomNo.trim(),
      furniture: selectedFurniture,
      status,
      maintenance,
    }

    const result = onSave(payload)
    if (result && result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col" style={{ width: '450px', maxWidth: '95vw' }}>
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon name={mode === 'add' ? 'add_home' : 'edit_square'} className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              {mode === 'add' ? 'Add Guest House Room' : `Manage Room ${roomNo}`}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
          {error && (
            <div className="rounded bg-error-container/20 border border-error/20 p-3 text-sm text-error font-semibold flex items-center gap-2">
              <Icon name="error_outline" />
              {error}
            </div>
          )}

          {/* Room Number Input */}
          <div className="space-y-1">
            <label htmlFor="roomNo" className="text-label-sm uppercase tracking-wider text-secondary">
              Room Number
            </label>
            <input
              type="text"
              id="roomNo"
              disabled={mode === 'edit'}
              required
              placeholder="e.g. 104, G-03, N2-105"
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none disabled:bg-surface-container-low disabled:text-outline"
            />
          </div>

          {/* Floor Selection */}
          <div className="space-y-1">
            <label htmlFor="floor" className="text-label-sm uppercase tracking-wider text-secondary">
              Floor Location
            </label>
            <select
              id="floor"
              disabled={mode === 'edit'}
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none disabled:bg-surface-container-low"
            >
              {FLOORS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* Status & Maintenance toggles (Only Edit Mode) */}
          {mode === 'edit' && (
            <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/30 pt-3">
              <div className="space-y-1">
                <label className="text-label-sm uppercase tracking-wider text-secondary">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary focus:outline-none"
                >
                  <option value="Vacant">Vacant</option>
                  <option value="Occupied">Occupied / Booked</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-label-sm uppercase tracking-wider text-secondary">Maintenance</label>
                <select
                  value={maintenance}
                  onChange={(e) => setMaintenance(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary focus:outline-none"
                >
                  <option value="none">Functional</option>
                  <option value="pending">Needs Attention</option>
                </select>
              </div>
            </div>
          )}

          {/* Furniture Asset Tags */}
          <div className="space-y-2 border-t border-outline-variant/30 pt-3">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Furniture Inventory</label>
            <div className="flex flex-wrap gap-1.5 max-h-[160px] overflow-y-auto p-1 border border-outline-variant/20 rounded-lg bg-surface-bright">
              {AVAILABLE_FURNITURE.map((item) => {
                const selected = selectedFurniture.includes(item)
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleFurniture(item)}
                    className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      selected
                        ? 'border-primary bg-primary text-white'
                        : 'border-outline-variant hover:bg-surface-container text-secondary'
                    }`}
                  >
                    {selected && <Icon name="check" className="text-[10px]" />}
                    {item}
                  </button>
                )
              })}
            </div>
            {selectedFurniture.length === 0 && (
              <p className="text-xs italic text-outline">No furniture currently assigned.</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary bg-white hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container"
            >
              {mode === 'add' ? 'Add Room' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
