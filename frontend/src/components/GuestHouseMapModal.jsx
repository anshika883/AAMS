import { useState, useMemo } from 'react'
import Icon from './Icon'
import { useAams } from '../lib/useAams'

export default function GuestHouseMapModal({
  isOpen,
  onClose,
  guestHouseNT1,
  guestHouseNT2,
  onManageRoom,
}) {
  const { bookings } = useAams()
  const [activeTab, setActiveTab] = useState('NT1')
  const [selectedRoomNo, setSelectedRoomNo] = useState(null)

  const rooms = activeTab === 'NT1' ? guestHouseNT1 : guestHouseNT2

  // Group rooms by floor
  const floorData = useMemo(() => {
    const floors = {}
    rooms.forEach((r) => {
      if (!floors[r.floor]) {
        floors[r.floor] = []
      }
      floors[r.floor].push(r)
    })

    // Sort rooms in each floor by room number
    Object.keys(floors).forEach((floor) => {
      floors[floor].sort((a, b) =>
        a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      )
    })

    return floors
  }, [rooms])

  // Sort floors from highest to lowest
  const sortedFloors = useMemo(() => {
    const floorList = Object.keys(floorData)
    const floorOrder = {
      'Ground Floor': 0,
      '1st Floor': 1,
      '2nd Floor': 2,
      '3rd Floor': 3,
      '4th Floor': 4,
      '5th Floor': 5,
      '6th Floor': 6,
      '7th Floor': 7,
      '8th Floor': 8,
      '9th Floor': 9,
      '10th Floor': 10,
    }
    return floorList.sort((a, b) => {
      const orderA = floorOrder[a] !== undefined ? floorOrder[a] : parseInt(a) || 99
      const orderB = floorOrder[b] !== undefined ? floorOrder[b] : parseInt(b) || 99
      return orderB - orderA
    })
  }, [floorData])

  // Get active bookings map for selected house
  const roomToActiveBookingMap = useMemo(() => {
    const map = {}
    bookings
      .filter(
        (b) =>
          b.houseCode === activeTab &&
          (b.bookingStatus === 'Occupied' || b.bookingStatus === 'Reserved')
      )
      .forEach((b) => {
        map[b.roomNo] = b
      })
    return map
  }, [bookings, activeTab])

  // Get room bookings history
  const selectedRoomHistory = useMemo(() => {
    if (!selectedRoomNo) return []
    return bookings
      .filter((b) => b.houseCode === activeTab && b.roomNo === selectedRoomNo)
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate))
      .slice(0, 5)
  }, [bookings, activeTab, selectedRoomNo])

  const selectedRoom = useMemo(() => {
    if (!selectedRoomNo) return null
    return rooms.find((r) => r.roomNo === selectedRoomNo)
  }, [rooms, selectedRoomNo])

  const activeBookingForSelected = selectedRoom ? roomToActiveBookingMap[selectedRoom.roomNo] : null

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500 hover:bg-green-600'
      case 'Reserved':
        return 'bg-blue-500 hover:bg-blue-600'
      case 'Occupied':
        return 'bg-red-500 hover:bg-red-600'
      case 'Under Cleaning':
        return 'bg-amber-500 hover:bg-amber-600'
      case 'Maintenance':
      default:
        return 'bg-secondary/70 hover:bg-secondary'
    }
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="max-h-[90vh] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col transition-all duration-300"
        style={{ width: selectedRoom ? '1100px' : '850px', maxWidth: '95vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="hotel" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Interactive Guest House Map
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Controls */}
        <div className="border-b border-outline-variant bg-surface-container-low px-6 py-3 shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex rounded-lg bg-surface-container p-1 w-fit">
            {['NT1', 'NT2'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab)
                  setSelectedRoomNo(null)
                }}
                className={`rounded-md px-4 py-1.5 text-label-md font-bold transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                {tab} Guest House
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-secondary flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-green-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-blue-500" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-red-500" />
              <span>Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-amber-500" />
              <span>Cleaning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded bg-secondary/70" />
              <span>Maintenance</span>
            </div>
            <span className="text-outline">| Click room to view details</span>
          </div>
        </div>

        {/* Grid + Detail Split */}
        <div className="flex-grow overflow-hidden flex bg-surface-bright">
          {/* Grid */}
          <div className="flex-grow overflow-y-auto p-6">
            <div className="mx-auto max-w-2xl border border-outline-variant rounded-xl bg-surface-container-lowest p-6 shadow-sm">
              <h4 className="text-center font-headline-sm text-headline-sm text-primary mb-6">
                {activeTab} Guest House Rooms Layout
              </h4>

              <div className="space-y-4">
                {sortedFloors.map((floorName) => {
                  const items = floorData[floorName]

                  return (
                    <div key={floorName} className="flex items-center gap-3">
                      <span className="w-24 text-right text-xs font-bold text-secondary shrink-0">
                        {floorName}
                      </span>
                      <div className="grid grid-cols-5 gap-2 flex-grow">
                        {items.map((r) => {
                          const isSelected = selectedRoomNo === r.roomNo
                          const activeBooking = roomToActiveBookingMap[r.roomNo]
                          const bgClass = getStatusColor(r.status)

                          return (
                            <button
                              key={r.roomNo}
                              type="button"
                              onClick={() => setSelectedRoomNo(r.roomNo)}
                              title={`${r.roomNo} — ${r.status}${
                                activeBooking ? ` (${activeBooking.guestName})` : ''
                              }`}
                              className={`cursor-pointer flex flex-col justify-center items-center py-2.5 rounded-lg font-bold text-xs text-white transition-all shadow-sm hover:scale-105 focus:outline-none ${
                                isSelected ? 'ring-4 ring-primary ring-offset-2 scale-105' : ''
                              } ${bgClass}`}
                            >
                              <span className="truncate w-full text-center">{r.roomNo}</span>
                              {activeBooking && (
                                <span className="text-[8px] opacity-90 truncate max-w-full px-1">
                                  {activeBooking.guestName.split(' ')[0]}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {sortedFloors.length === 0 && (
                <p className="text-center text-outline italic text-sm py-12">
                  No rooms added to this guest house yet.
                </p>
              )}
            </div>
          </div>

          {/* Detail Panel */}
          {selectedRoom && (
            <div className="w-80 shrink-0 border-l border-outline-variant bg-surface-container-lowest p-6 shadow-2xl flex flex-col justify-between animate-slide-in overflow-y-auto">
              <div className="space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-outline">
                      {activeTab} Guest House Unit
                    </span>
                    <h4 className="text-2xl font-bold text-on-surface">Room {selectedRoom.roomNo}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedRoomNo(null)}
                    className="p-1.5 text-secondary hover:text-on-surface rounded-full hover:bg-surface-container-high transition-colors cursor-pointer"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>

                {/* Status card */}
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    selectedRoom.status === 'Available'
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : selectedRoom.status === 'Reserved'
                      ? 'bg-blue-50/50 border-blue-200 text-blue-950'
                      : selectedRoom.status === 'Occupied'
                      ? 'bg-red-50/50 border-red-200 text-red-950'
                      : selectedRoom.status === 'Under Cleaning'
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                      : 'bg-surface-container-high border-outline-variant text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        selectedRoom.status === 'Available'
                          ? 'bg-green-500'
                          : selectedRoom.status === 'Reserved'
                          ? 'bg-blue-500'
                          : selectedRoom.status === 'Occupied'
                          ? 'bg-red-500'
                          : selectedRoom.status === 'Under Cleaning'
                          ? 'bg-amber-500'
                          : 'bg-secondary'
                      }`}
                    />
                    <span className="font-bold text-xs uppercase tracking-wide">
                      {selectedRoom.status}
                    </span>
                  </div>

                  {activeBookingForSelected ? (
                    <div className="mt-2 space-y-1.5 text-xs">
                      <p>
                        Guest:{' '}
                        <strong className="text-on-surface font-semibold">
                          {activeBookingForSelected.guestName}
                        </strong>
                      </p>
                      <p className="text-secondary">
                        Stay: {activeBookingForSelected.expectedCheckInDate} to{' '}
                        {activeBookingForSelected.expectedCheckOutDate}
                      </p>
                      {activeBookingForSelected.actualCheckInDateTime && (
                        <p className="text-secondary text-[11px]">
                          Checked in:{' '}
                          {new Date(activeBookingForSelected.actualCheckInDateTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-secondary font-medium">No active guest booking.</p>
                  )}
                </div>

                {/* Furniture Inventory */}
                <div className="space-y-2">
                  <p className="text-xs text-secondary font-bold uppercase tracking-wider">
                    Furniture Inventory
                  </p>
                  {!selectedRoom.furniture || selectedRoom.furniture.length === 0 ? (
                    <div className="p-3 rounded-xl border border-outline-variant bg-surface text-center italic text-outline text-xs">
                      No furniture assigned to this room.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRoom.furniture.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1 rounded-lg border border-outline-variant bg-surface px-2.5 py-1 text-xs text-on-surface font-medium"
                        >
                          <Icon name={getFurnitureIcon(item)} className="text-[14px] text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookings History */}
                {selectedRoomHistory.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-secondary font-bold uppercase tracking-wider flex items-center gap-1">
                      <Icon name="history" className="text-sm text-primary" /> Recent History
                    </p>
                    <div className="space-y-1.5">
                      {selectedRoomHistory.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-lg bg-surface border border-outline-variant px-3 py-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-on-surface">{b.guestName}</span>
                            <span
                              className={`rounded-full px-1.5 py-0.25 text-[9px] font-bold ${
                                b.bookingStatus === 'Occupied'
                                  ? 'bg-red-100 text-red-700'
                                  : b.bookingStatus === 'Checked Out'
                                  ? 'bg-gray-100 text-gray-600'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {b.bookingStatus}
                            </span>
                          </div>
                          <span className="text-secondary text-[10px]">
                            {b.expectedCheckInDate} → {b.expectedCheckOutDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-outline-variant flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onManageRoom(selectedRoom)
                    onClose()
                  }}
                  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-primary py-2 font-bold text-on-primary shadow-md hover:bg-primary-container transition-all cursor-pointer text-xs"
                >
                  <Icon name="edit" className="text-xs" /> Edit Room Details
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRoomNo(null)}
                  className="w-full rounded-lg border border-outline-variant py-2 font-bold text-secondary bg-white hover:bg-surface-container transition-all cursor-pointer text-[11px] text-center"
                >
                  Close Details
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant bg-surface-container px-6 py-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary bg-white transition-colors hover:bg-surface-container cursor-pointer"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  )
}
