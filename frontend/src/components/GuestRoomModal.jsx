import { useEffect, useState } from 'react'
import Icon from './Icon'
import { useAams } from '../lib/useAams'

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']

export default function GuestRoomModal({ isOpen, onClose, room, onSave, mode = 'add' }) {
  const { furnitureLibrary, addFurniture, bookings, markRoomClean } = useAams()

  const [roomNo, setRoomNo] = useState('')
  const [floor, setFloor] = useState('Ground Floor')
  const [status, setStatus] = useState('Available')
  const [maintenance, setMaintenance] = useState('none')
  const [selectedFurniture, setSelectedFurniture] = useState([])
  const [furnitureInput, setFurnitureInput] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      setFurnitureInput('')
      setIsDropdownOpen(false)
      if (mode === 'edit' && room) {
        setRoomNo(room.roomNo)
        setFloor(room.floor)
        setStatus(room.status || 'Available')
        setMaintenance(room.maintenance || 'none')
        setSelectedFurniture(room.furniture || [])
      } else {
        setRoomNo('')
        setFloor('Ground Floor')
        setStatus('Available')
        setMaintenance('none')
        setSelectedFurniture([])
      }
    }
  }, [isOpen, room, mode])

  if (!isOpen) return null

  // Find active booking for this room
  const activeBooking = bookings.find(
    (b) => b.roomNo === roomNo && (b.bookingStatus === 'Occupied' || b.bookingStatus === 'Reserved')
  )

  const handleClean = () => {
    // Extract house code prefix from room number or default to current URL parameters (which will be handled by onSave in GuestHouses)
    // Actually, GuestHouses exports markRoomClean, which is exposed in context. Let's just call it.
    // Wait, how do we know the houseCode? We can extract it.
    // If the roomNo starts with 'N2', it's NT2 guest house. Otherwise NT1.
    const house = roomNo.startsWith('N2') ? 'NT2' : 'NT1'
    markRoomClean(house, roomNo)
    setStatus('Available')
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
      status: status === 'Maintenance' ? 'Maintenance' : status, // keep status aligned
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

          {/* Room details status summary (Only Edit Mode) */}
          {mode === 'edit' && (
            <div className="flex justify-between items-center bg-surface-container-low border border-outline-variant/30 rounded-lg p-3">
              <div>
                <span className="text-xs text-secondary font-semibold uppercase block">Room Status</span>
                <span className="font-bold text-on-surface">{status}</span>
              </div>
              
              {status === 'Under Cleaning' && (
                <button
                  type="button"
                  onClick={handleClean}
                  className="flex items-center gap-1 rounded bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 text-xs font-bold text-[#15803d] hover:bg-[#dcfce7] transition-all cursor-pointer shadow-xs"
                >
                  <Icon name="cleaning_services" className="text-xs" /> Mark as Cleaned
                </button>
              )}
            </div>
          )}

          {/* Active Booking Summary */}
          {mode === 'edit' && activeBooking && (
            <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <h4 className="text-xs uppercase font-bold text-primary tracking-wider flex items-center gap-1.5">
                <Icon name="event_note" className="text-sm" /> Active Guest Stay
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                <span className="text-secondary font-semibold">Guest Name:</span>
                <span className="text-on-surface font-bold">{activeBooking.guestName}</span>
                <span className="text-secondary font-semibold">Booking Status:</span>
                <span className="text-on-surface font-bold">{activeBooking.bookingStatus}</span>
                <span className="text-secondary font-semibold">Expected Check-in:</span>
                <span className="text-on-surface font-bold">{activeBooking.expectedCheckInDate}</span>
                <span className="text-secondary font-semibold">Expected Check-out:</span>
                <span className="text-on-surface font-bold">{activeBooking.expectedCheckOutDate}</span>
              </div>
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

          {/* Maintenance toggles (Only Edit Mode) */}
          {mode === 'edit' && (
            <div className="space-y-1 border-t border-outline-variant/30 pt-3">
              <label htmlFor="maintenanceSelect" className="text-label-sm uppercase tracking-wider text-secondary">Maintenance Status</label>
              <select
                id="maintenanceSelect"
                value={maintenance}
                onChange={(e) => {
                  setMaintenance(e.target.value)
                  if (e.target.value === 'pending') {
                    setStatus('Maintenance')
                  } else if (status === 'Maintenance') {
                    setStatus('Available')
                  }
                }}
                className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
              >
                <option value="none">Functional / Available</option>
                <option value="pending">Needs Attention / Under Maintenance</option>
              </select>
            </div>
          )}

          {/* Furniture Selector with Autocomplete */}
          <div className="space-y-3 border-t border-outline-variant/30 pt-3 relative">
            <label className="text-label-sm uppercase tracking-wider text-secondary block">
              Furniture Inventory
            </label>
            
            {/* Selected furniture tags */}
            <div className="flex flex-wrap gap-1.5 p-1 border border-outline-variant/20 rounded-lg bg-surface-bright min-h-[50px]">
              {selectedFurniture.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-white shadow-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => setSelectedFurniture(selectedFurniture.filter((f) => f !== item))}
                    className="hover:text-error-container cursor-pointer text-[12px] font-bold ml-1"
                  >
                    <Icon name="close" className="text-[10px]" />
                  </button>
                </span>
              ))}
              {selectedFurniture.length === 0 && (
                <p className="text-xs italic text-outline self-center px-2 py-1">No furniture currently assigned.</p>
              )}
            </div>

            {/* Autocomplete Input */}
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Type to search or add furniture..."
                    value={furnitureInput}
                    onChange={(e) => {
                      setFurnitureInput(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
                  />
                  {furnitureInput && (
                    <button
                      type="button"
                      onClick={() => setFurnitureInput('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                    >
                      <Icon name="close" className="text-sm" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = furnitureInput.trim()
                    if (trimmed) {
                      addFurniture(trimmed)
                      if (!selectedFurniture.includes(trimmed)) {
                        setSelectedFurniture([...selectedFurniture, trimmed])
                      }
                      setFurnitureInput('')
                      setIsDropdownOpen(false)
                    }
                  }}
                  className="rounded-lg bg-primary px-4 py-2 text-label-sm font-bold text-on-primary hover:bg-primary-container transition-all cursor-pointer whitespace-nowrap"
                >
                  Add Custom
                </button>
              </div>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-outline-variant bg-surface-container-lowest shadow-lg py-1">
                    {furnitureLibrary
                      .filter(item => !selectedFurniture.includes(item) && item.toLowerCase().includes(furnitureInput.toLowerCase()))
                      .map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setSelectedFurniture([...selectedFurniture, item])
                            setFurnitureInput('')
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-body-md text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                        >
                          {item}
                        </button>
                      ))}
                    {furnitureInput.trim() && !furnitureLibrary.some(item => item.toLowerCase() === furnitureInput.trim().toLowerCase()) && (
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = furnitureInput.trim()
                          addFurniture(trimmed)
                          if (!selectedFurniture.includes(trimmed)) {
                            setSelectedFurniture([...selectedFurniture, trimmed])
                          }
                          setFurnitureInput('')
                          setIsDropdownOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-body-md text-primary font-bold hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Icon name="add" className="text-sm" />
                        Create new option "{furnitureInput.trim()}"
                      </button>
                    )}
                    {furnitureLibrary.filter(item => !selectedFurniture.includes(item) && item.toLowerCase().includes(furnitureInput.toLowerCase())).length === 0 && !furnitureInput.trim() && (
                      <div className="px-4 py-2 text-xs italic text-outline">All library items selected.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary bg-white hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-colors"
            >
              {mode === 'add' ? 'Create Room' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
