import { useEffect, useState } from 'react'
import Icon from './Icon'
import { useAams } from '../lib/useAams'

export default function FlatManageModal({ isOpen, onClose, unit, onSave }) {
  const { furnitureLibrary, addFurniture } = useAams()

  const [residentName, setResidentName] = useState('')
  const [occupancy, setOccupancy] = useState('Vacant')
  const [deptt, setDeptt] = useState('')
  const [occupantCount, setOccupantCount] = useState(0)
  const [selectedFurniture, setSelectedFurniture] = useState([])
  const [furnitureInput, setFurnitureInput] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    if (unit) {
      setResidentName(unit.residentName === '-' ? '' : unit.residentName)
      setOccupancy(unit.occupancy || 'Vacant')
      setDeptt(unit.deptt || '')
      setOccupantCount(unit.occupantCount || 0)
      setFurnitureInput('')
      setIsDropdownOpen(false)
      
      const currentFurniture = unit.furniture && unit.furniture !== 'NIL'
        ? unit.furniture.split(',').map((f) => f.trim())
        : []
      setSelectedFurniture(currentFurniture)
    }
  }, [unit])

  if (!isOpen || !unit) return null

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
      deptt: deptt.trim(),
      occupantCount: parseInt(occupantCount, 10) || 0,
      furniture: furnitureStr,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl transition-all duration-300 flex flex-col" style={{ width: '450px', maxWidth: '95vw' }}>
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon name="edit_square" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Manage Unit {unit.buildingCode}-{unit.roomNo} {unit.isGuesthouse && <span className="text-[10px] font-bold text-purple-600 bg-purple-100 border border-purple-200 rounded px-1.5 py-0.5 ml-1">GH</span>}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Active Guest stays for Guesthouse */}
          {unit.isGuesthouse && (
            <GuesthouseStaySummary roomNo={unit.roomNo} />
          )}

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
            <div className="space-y-4">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="deptt" className="text-label-sm uppercase tracking-wider text-secondary">
                    Department
                  </label>
                  <input
                    type="text"
                    id="deptt"
                    placeholder="e.g. IT, Nurse, F&B"
                    value={deptt}
                    onChange={(e) => setDeptt(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="occupantCount" className="text-label-sm uppercase tracking-wider text-secondary">
                    No. of People
                  </label>
                  <input
                    type="number"
                    id="occupantCount"
                    min="0"
                    value={occupantCount}
                    onChange={(e) => setOccupantCount(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Furniture Selector with Autocomplete */}
          <div className="space-y-3 relative">
            <label className="text-label-sm uppercase tracking-wider text-secondary block font-bold">
              Furniture Inventory
            </label>
            
            {/* Selected furniture tags */}
            <div className="flex flex-wrap gap-1.5 p-1.5 border border-outline-variant/20 rounded-lg bg-surface-bright min-h-[50px]">
              {selectedFurniture.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => setSelectedFurniture(selectedFurniture.filter((f) => f !== item))}
                    className="hover:text-error-container cursor-pointer text-xs font-bold ml-1.5"
                  >
                    <Icon name="close" className="text-[10px]" />
                  </button>
                </span>
              ))}
              {selectedFurniture.length === 0 && (
                <p className="text-xs italic text-outline self-center px-2 py-1">No furniture assigned (NIL)</p>
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
                    className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2.5 text-body-md focus:border-primary focus:outline-none"
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
                  className="rounded-lg bg-primary px-4 py-2.5 text-label-md font-bold text-on-primary hover:bg-primary-container transition-all cursor-pointer whitespace-nowrap"
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
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-colors"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GuesthouseStaySummary({ roomNo }) {
  const { bookings } = useAams()
  
  // Find bookings for this room number
  const roomBookings = bookings
    .filter((b) => b.roomNo === roomNo)
    .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate))

  const activeBooking = roomBookings.find(
    (b) => b.bookingStatus === 'Occupied' || b.bookingStatus === 'Reserved'
  )

  const history = roomBookings.filter((b) => b.bookingStatus === 'Checked Out').slice(0, 3)

  return (
    <div className="space-y-3">
      {activeBooking && (
        <div className="bg-primary-container/10 border border-primary/20 rounded-lg p-3 space-y-1.5">
          <h4 className="text-xs uppercase font-bold text-primary tracking-wider flex items-center gap-1.5">
            <Icon name="event_note" className="text-sm" /> Active Guest Stay
          </h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-secondary font-semibold">Guest Name:</span>
            <span className="text-on-surface font-bold">{activeBooking.guestName}</span>
            <span className="text-secondary font-semibold">Status:</span>
            <span className="text-on-surface font-bold">{activeBooking.bookingStatus}</span>
            <span className="text-secondary font-semibold">Duration:</span>
            <span className="text-on-surface font-bold">{activeBooking.expectedCheckInDate} → {activeBooking.expectedCheckOutDate}</span>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] uppercase font-bold text-secondary tracking-wider flex items-center gap-1">
            <Icon name="history" className="text-sm text-purple-600" /> Recent Guest History
          </p>
          <div className="space-y-1">
            {history.map((b) => (
              <div key={b.id} className="rounded border border-outline-variant/30 px-2.5 py-1.5 bg-surface-container-low text-xs flex justify-between items-center">
                <div>
                  <span className="font-semibold text-on-surface block">{b.guestName}</span>
                  <span className="text-[10px] text-secondary">{b.expectedCheckInDate} → {b.expectedCheckOutDate}</span>
                </div>
                <span className="text-[10px] font-bold text-outline uppercase">Checked Out</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

