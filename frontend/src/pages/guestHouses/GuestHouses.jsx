import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import GuestRoomModal from '../../components/GuestRoomModal'
import GuestBookingModal from '../../components/GuestBookingModal'
import GuestHouseMapModal from '../../components/GuestHouseMapModal'
import SmartExportModal from '../../components/SmartExportModal'
import { IMAGES } from '../../constants/images'
import { useAams } from '../../lib/useAams'

function InventoryRow({ floor, roomNo, furniture, status, activeBooking, onManage, onMarkClean }) {
  let badgeStyle = ''
  let dotColor = ''
  if (status === 'Available') {
    badgeStyle = 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
    dotColor = 'bg-[#22c55e]'
  } else if (status === 'Reserved') {
    badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200'
    dotColor = 'bg-blue-500'
  } else if (status === 'Occupied') {
    badgeStyle = 'bg-red-50 text-red-700 border-red-200'
    dotColor = 'bg-red-500'
  } else if (status === 'Under Cleaning') {
    badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200'
    dotColor = 'bg-amber-500'
  } else {
    badgeStyle = 'bg-surface-container-high border-outline-variant text-secondary'
    dotColor = 'bg-secondary'
  }

  return (
    <tr className="transition-colors hover:bg-surface-container-low/30">
      <td className="px-lg py-4 text-body-md text-on-surface-variant">{floor}</td>
      <td className="px-lg py-4 text-body-md font-bold text-primary">{roomNo}</td>
      <td className="px-lg py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold mr-3 ${badgeStyle}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
          {status}
        </span>
        
        {activeBooking && (
          <span className="text-xs text-secondary font-medium">
            Guest: <strong className="text-on-surface">{activeBooking.guestName}</strong>
          </span>
        )}
      </td>
      <td className="px-lg py-4">
        {furniture.length === 0 ? (
          <span className="text-body-md italic text-outline">NIL</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {furniture.map((c) => (
              <span
                key={c}
                className="rounded-full border border-outline-variant bg-secondary-container/50 px-2 py-0.5 text-[11px] font-bold text-on-secondary-container shadow-xs"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-lg py-4 text-right">
        <div className="flex justify-end items-center gap-2">
          {status === 'Under Cleaning' && (
            <button
              type="button"
              onClick={onMarkClean}
              className="flex items-center gap-1 rounded bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 text-xs font-bold text-[#15803d] hover:bg-[#dcfce7] transition-all cursor-pointer shadow-xs"
              title="Mark Room as Clean"
            >
              <Icon name="cleaning_services" className="text-xs" /> Mark Clean
            </button>
          )}
          <button
            type="button"
            onClick={onManage}
            className="rounded-full p-2 hover:bg-surface-container transition-colors cursor-pointer text-secondary"
            title="Manage Room Details"
          >
            <Icon name="edit" className="text-[20px]" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function GuestHouses() {
  const { houseCode } = useParams()
  const code = String(houseCode ?? 'nt1').toUpperCase()

  const {
    guestHouseNT1,
    guestHouseNT2,
    updateGuestHouse,
    addGuestRoom,
    bookings,
    createBooking,
    checkInBooking,
    checkOutBooking,
    markRoomClean,
  } = useAams()

  // Local state
  const [viewTab, setViewTab] = useState('rooms') // 'rooms' or 'bookings'
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFloorFilter, setActiveFloorFilter] = useState('All')
  const [sortBy, setSortBy] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [roomModalOpen, setRoomModalOpen] = useState(false)
  const [roomModalMode, setRoomModalMode] = useState('add')
  const [selectedRoom, setSelectedRoom] = useState(null)
  
  const [bookingModalOpen, setBookingModalOpen] = useState(false)
  const [mapOpen, setMapOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  const itemsPerPage = 5

  // Get current guest house rooms
  const rooms = useMemo(() => {
    return code === 'NT2' ? guestHouseNT2 : guestHouseNT1
  }, [code, guestHouseNT1, guestHouseNT2])

  // Get current active bookings mapped by room number for quick access
  const roomToActiveBookingMap = useMemo(() => {
    const map = {}
    bookings
      .filter((b) => b.houseCode === code && (b.bookingStatus === 'Occupied' || b.bookingStatus === 'Reserved'))
      .forEach((b) => {
        map[b.roomNo] = b
      })
    return map
  }, [bookings, code])

  // Get unique floors for filter buttons
  const uniqueFloors = useMemo(() => {
    const list = rooms.map((r) => r.floor)
    const unique = Array.from(new Set(list))
    const order = { 'Ground Floor': 0, '1st Floor': 1, '2nd Floor': 2, '3rd Floor': 3, '4th Floor': 4 }
    return unique.sort((a, b) => (order[a] ?? 9) - (order[b] ?? 9))
  }, [rooms])

  // Dynamic calculations for Stats
  const stats = useMemo(() => {
    const total = rooms.length
    const occupied = rooms.filter((r) => r.status === 'Occupied').length
    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
    
    // Calculate cleaning rooms
    const cleaningCount = rooms.filter((r) => r.status === 'Under Cleaning').length
    
    // Calculate maintenance rooms
    const maintenanceCount = rooms.filter((r) => r.status === 'Maintenance').length

    return { total, occupied, pct, cleaningCount, maintenanceCount }
  }, [rooms])

  // Filter, sort, paginate rooms
  const processedRooms = useMemo(() => {
    let list = rooms.filter((r) => {
      const activeGuest = roomToActiveBookingMap[r.roomNo]?.guestName || ''
      const furnitureStr = r.furniture.join(' ')
      const hay = `${r.floor} ${r.roomNo} ${r.status} ${furnitureStr} ${activeGuest}`.toLowerCase()
      return hay.includes(searchTerm.trim().toLowerCase())
    })

    if (activeFloorFilter !== 'All') {
      list = list.filter((r) => r.floor === activeFloorFilter)
    }

    list.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        return b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      }
    })

    return list
  }, [rooms, searchTerm, activeFloorFilter, sortBy, roomToActiveBookingMap])

  // Filtered and sorted bookings
  const processedBookings = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    
    let list = bookings
      .filter((b) => b.houseCode === code)
      .map((b) => {
        const isOverstay = b.bookingStatus === 'Occupied' && !b.actualCheckOutDateTime && b.expectedCheckOutDate < todayStr
        return { ...b, isOverstay }
      })

    // Apply search filter
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase()
      list = list.filter(
        (b) =>
          b.guestName.toLowerCase().includes(q) ||
          b.roomNo.toLowerCase().includes(q) ||
          b.bookingStatus.toLowerCase().includes(q) ||
          b.guestStatus.toLowerCase().includes(q)
      )
    }

    // Sort: by Room No based on sortBy selection, then booking date descending
    list.sort((a, b) => {
      const roomComp = a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      if (roomComp !== 0) {
        return sortBy === 'asc' ? roomComp : -roomComp
      }
      return b.bookingDate.localeCompare(a.bookingDate)
    })

    return list
  }, [bookings, code, searchTerm, sortBy])

  // Paginated dataset (Room or Bookings)
  const paginatedRows = useMemo(() => {
    const list = viewTab === 'rooms' ? processedRooms : processedBookings
    const start = (currentPage - 1) * itemsPerPage
    return list.slice(start, start + itemsPerPage)
  }, [viewTab, processedRooms, processedBookings, currentPage])

  const totalPages = useMemo(() => {
    const list = viewTab === 'rooms' ? processedRooms : processedBookings
    return Math.ceil(list.length / itemsPerPage) || 1
  }, [viewTab, processedRooms, processedBookings])

  const exportRooms = useMemo(() => {
    return rooms.map((r) => {
      const active = roomToActiveBookingMap[r.roomNo]
      return {
        ...r,
        guestName: active ? active.guestName : '-',
        dept: active ? active.guestStatus : '-',
      }
    })
  }, [rooms, roomToActiveBookingMap])

  const filteredExportRooms = useMemo(() => {
    return processedRooms.map((r) => {
      const active = roomToActiveBookingMap[r.roomNo]
      return {
        ...r,
        guestName: active ? active.guestName : '-',
        dept: active ? active.guestStatus : '-',
      }
    })
  }, [processedRooms, roomToActiveBookingMap])

  const allBookings = useMemo(() => {
    return bookings.filter(b => b.houseCode === code)
  }, [bookings, code])

  const handleExport = () => {
    setExportOpen(true)
  }

  // Handle save from modal
  const handleSaveRoom = (payload) => {
    if (roomModalMode === 'add') {
      const res = addGuestRoom(code, payload)
      if (res && res.error) return res
      setCurrentPage(1)
    } else {
      updateGuestHouse(code, payload.roomNo, {
        status: payload.status,
        maintenance: payload.maintenance,
        furniture: payload.furniture,
        checkInStatus: payload.checkInStatus,
        checkOutStatus: payload.checkOutStatus,
      })
    }
  }

  const handleSaveBooking = (payload) => {
    createBooking(code, payload)
    setViewTab('bookings')
    setCurrentPage(1)
  }

  const handleCheckIn = (bookingId) => {
    if (confirm('Are you sure you want to check in this guest?')) {
      checkInBooking(code, bookingId)
    }
  }

  const handleCheckOut = (bookingId) => {
    if (confirm('Confirm Guest Check-out?')) {
      checkOutBooking(code, bookingId)
    }
  }

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '-'
    const d = new Date(isoStr)
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <>
      <TopBar
        searchPlaceholder={viewTab === 'rooms' ? "Search rooms or furniture..." : "Search bookings or guests..."}
        searchValue={searchTerm}
        onSearchChange={(e) => {
          setSearchTerm(e.target.value)
          setCurrentPage(1)
        }}
        rightContent={
          <img
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary-container"
            alt="Admin"
            src={IMAGES.guestHouseAdmin}
          />
        }
      />
      <Page>
        <div className="mx-auto max-w-7xl space-y-lg">
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-lg md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary font-bold">
                <Icon name="hotel" className="text-[18px]" />
                <span className="text-label-sm uppercase tracking-wider">Guest Accommodation</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{code} Guest House</h2>
              <p className="mt-1 text-body-md text-secondary">
                Manage room availability, automated check-in/out workflows, and cleaning matrices.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-label-md font-bold text-primary bg-white hover:bg-surface-container transition-all cursor-pointer shadow-sm"
              >
                <Icon name="grid_view" className="text-[20px]" />
                Interactive Map
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-label-md font-bold text-on-surface hover:bg-surface-container transition-all cursor-pointer shadow-sm"
              >
                <Icon name="download" className="text-[20px]" />
                Export CSV
              </button>
              
              {viewTab === 'rooms' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRoom(null)
                    setRoomModalMode('add')
                    setRoomModalOpen(true)
                  }}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-all cursor-pointer"
                >
                  <Icon name="add_home" className="text-[20px]" />
                  Add New Room
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-all cursor-pointer"
                >
                  <Icon name="bookmark_add" className="text-[20px]" />
                  Create Booking
                </button>
              )}
            </div>
          </div>

          {/* Stats widgets */}
          <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Total Rooms</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{stats.total}</span>
                <span className="text-xs text-primary font-bold">{rooms.filter(r => r.status === 'Available').length} Available</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Occupancy Rate</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{stats.pct}%</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full bg-primary transition-all duration-500" style={{ width: `${stats.pct}%` }} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Housekeeping</span>
              <div className="flex items-end justify-between">
                <span className={`text-headline-md font-headline-md ${stats.cleaningCount > 0 ? 'text-amber-500 font-bold' : 'text-on-surface'}`}>
                  {stats.cleaningCount}
                </span>
                {stats.cleaningCount > 0 ? (
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                    Needs Cleaning
                  </span>
                ) : (
                  <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-xs font-bold text-[#166534] border border-[#bbf7d0]">
                    Clean
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Maintenance Log</span>
              <div className="flex items-end justify-between">
                <span className={`text-headline-md font-headline-md ${stats.maintenanceCount > 0 ? 'text-error font-bold' : 'text-on-surface'}`}>
                  {stats.maintenanceCount}
                </span>
                <span className="text-xs text-secondary font-bold">Needs attention</span>
              </div>
            </div>
          </div>

          {/* Sub Navigation Page-Level Tabs */}
          <div className="flex border-b border-outline-variant gap-6 mb-2">
            <button
              type="button"
              onClick={() => {
                setViewTab('rooms')
                setCurrentPage(1)
              }}
              className={`flex items-center gap-2 pb-3 text-label-md font-bold transition-all cursor-pointer border-b-2 ${
                viewTab === 'rooms'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name="grid_view" className="text-[18px]" />
              Rooms Matrix
            </button>
            <button
              type="button"
              onClick={() => {
                setViewTab('bookings')
                setCurrentPage(1)
              }}
              className={`flex items-center gap-2 pb-3 text-label-md font-bold transition-all cursor-pointer border-b-2 ${
                viewTab === 'bookings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name="menu_book" className="text-[18px]" />
              Bookings &amp; Guest Lifecycle Log
            </button>
          </div>

          {/* Matrix / Bookings log table container */}
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            {viewTab === 'rooms' ? (
              <>
                <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low/20 px-lg py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mr-3">Inventory Matrix</h3>
                    <div className="flex flex-wrap rounded-lg bg-surface-container p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFloorFilter('All')
                          setCurrentPage(1)
                        }}
                        className={`rounded-md px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                          activeFloorFilter === 'All'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-secondary hover:text-on-surface'
                        }`}
                      >
                        All Floors
                      </button>
                      {uniqueFloors.map((floorName) => (
                        <button
                          key={floorName}
                          type="button"
                          onClick={() => {
                            setActiveFloorFilter(floorName)
                            setCurrentPage(1)
                          }}
                          className={`rounded-md px-3.5 py-1 text-xs font-bold transition-all cursor-pointer ${
                            activeFloorFilter === floorName
                              ? 'bg-white text-primary shadow-sm'
                              : 'text-secondary hover:text-on-surface'
                          }`}
                        >
                          {floorName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-label-sm text-secondary font-semibold">Sort by Room No:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="cursor-pointer border border-outline-variant rounded-md bg-white px-2 py-1 text-xs font-bold text-on-surface focus:outline-none"
                    >
                      <option value="asc">Ascending (101 → 402)</option>
                      <option value="desc">Descending (402 → 101)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/10">
                        <th className="border-b border-outline-variant px-lg py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Floor No.</th>
                        <th className="border-b border-outline-variant px-lg py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Room No.</th>
                        <th className="border-b border-outline-variant px-lg py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Room Status &amp; Guest</th>
                        <th className="border-b border-outline-variant px-lg py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Furniture Inventory</th>
                        <th className="border-b border-outline-variant px-lg py-4 text-right text-xs font-bold uppercase tracking-wider text-secondary">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {paginatedRows.map((r) => (
                        <InventoryRow
                          key={r.roomNo}
                          floor={r.floor}
                          roomNo={r.roomNo}
                          furniture={r.furniture}
                          status={r.status}
                          activeBooking={roomToActiveBookingMap[r.roomNo]}
                          onMarkClean={() => markRoomClean(code, r.roomNo)}
                          onManage={() => {
                            setSelectedRoom(r)
                            setRoomModalMode('edit')
                            setRoomModalOpen(true)
                          }}
                        />
                      ))}

                      {paginatedRows.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-lg py-12 text-center text-outline italic">
                            No guest rooms match the filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                {/* Bookings log tab content */}
                 <div className="flex flex-col gap-4 border-b border-outline-variant bg-surface-container-low/20 px-lg py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mr-3">Guest Lifecycle Log</h3>
                    <p className="text-xs text-secondary mt-0.5">Manage live bookings, check-in guests, perform check-out releases, and review audit history.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-label-sm text-secondary font-semibold">Sort by Room No:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        setCurrentPage(1)
                      }}
                      className="cursor-pointer border border-outline-variant rounded-md bg-white px-2 py-1 text-xs font-bold text-on-surface focus:outline-none shadow-xs"
                    >
                      <option value="asc">Ascending (101 → 402)</option>
                      <option value="desc">Descending (402 → 101)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low/10">
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Room No</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Guest Name</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Booking Status</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Guest Status</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary text-center">Expected Dates</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Actual Check-in</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Actual Check-out</th>
                        <th className="border-b border-outline-variant px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-secondary">Check-in / Check-out</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {paginatedRows.map((b) => {
                        let statusColor = ''
                        if (b.bookingStatus === 'Occupied') statusColor = 'bg-red-50 text-red-700 border-red-200'
                        else if (b.bookingStatus === 'Reserved') statusColor = 'bg-blue-50 text-blue-700 border-blue-200'
                        else statusColor = 'bg-surface-container-high border-outline-variant text-secondary'

                        return (
                          <tr key={b.id} className="transition-colors hover:bg-surface-container-low/30 text-body-md">
                            <td className="px-4 py-4 font-bold text-primary">{b.roomNo}</td>
                            <td className="px-4 py-4 font-semibold text-on-surface">
                              <span className="block">{b.guestName}</span>
                              <span className="text-[10px] text-outline font-medium">ID: {b.id}</span>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-bold ${statusColor}`}>
                                {b.bookingStatus}
                              </span>
                              {b.isOverstay && (
                                <span className="block mt-1 text-[10px] text-error font-bold animate-pulse flex items-center gap-0.5">
                                  <Icon name="warning" className="text-[11px]" /> Guest Overstayed
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${
                                b.guestStatus === 'Checked In' 
                                  ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
                                  : b.guestStatus === 'Checked Out'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-surface-container-high border-outline-variant text-secondary'
                              }`}>
                                {b.guestStatus}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-secondary font-medium text-center">
                              <span className="block">{b.expectedCheckInDate}</span>
                              <span className="block text-[10px] text-outline">to</span>
                              <span className={`block font-bold ${b.isOverstay ? 'text-error' : ''}`}>{b.expectedCheckOutDate}</span>
                            </td>
                            <td className="px-4 py-4 text-xs font-medium text-on-surface-variant">
                              {formatDateTime(b.actualCheckInDateTime)}
                            </td>
                            <td className="px-4 py-4 text-xs font-medium text-on-surface-variant">
                              {formatDateTime(b.actualCheckOutDateTime)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                {b.bookingStatus === 'Reserved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCheckIn(b.id)}
                                    className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-bold text-on-primary shadow-xs hover:bg-primary-container transition-all cursor-pointer"
                                  >
                                    <Icon name="login" className="text-xs" /> Check In
                                  </button>
                                )}
                                {b.bookingStatus === 'Occupied' && (
                                  <button
                                    type="button"
                                    onClick={() => handleCheckOut(b.id)}
                                    className="flex items-center gap-1.5 rounded bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1.5 text-xs font-bold text-[#15803d] shadow-xs hover:bg-[#dcfce7] transition-all cursor-pointer"
                                  >
                                    <Icon name="logout" className="text-xs" /> Check Out
                                  </button>
                                )}
                                {b.bookingStatus === 'Checked Out' && (
                                  <span className="text-xs text-outline italic font-medium pr-2">Released</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}

                      {paginatedRows.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-lg py-12 text-center text-outline italic">
                            No bookings match the filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Pagination controls */}
            <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/15 px-lg py-4">
              <p className="text-label-sm text-secondary font-semibold">
                Showing {paginatedRows.length} of {viewTab === 'rooms' ? processedRooms.length : processedBookings.length} matching rows
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-white text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-bold transition-all cursor-pointer ${
                      currentPage === p
                        ? 'border-primary bg-primary text-white shadow-xs'
                        : 'border-outline-variant bg-white text-secondary hover:text-primary hover:bg-surface-container-low'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-white text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 opacity-60">
            <p className="text-label-sm text-secondary">Last synchronized: Supervised Admin Log System</p>
            <div className="flex gap-4">
              <a className="text-label-sm text-secondary underline hover:text-primary" href="#">
                Privacy Policy
              </a>
              <a className="text-label-sm text-secondary underline hover:text-primary" href="#">
                Internal Guidelines
              </a>
            </div>
          </div>
        </div>
      </Page>

      {/* Guest Room Modal (Add / Edit) */}
      <GuestRoomModal
        isOpen={roomModalOpen}
        onClose={() => setRoomModalOpen(false)}
        room={selectedRoom}
        mode={roomModalMode}
        onSave={handleSaveRoom}
      />

      {/* Guest Booking Modal */}
      <GuestBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        rooms={rooms}
        onSave={handleSaveBooking}
      />

      <GuestHouseMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        guestHouseNT1={guestHouseNT1}
        guestHouseNT2={guestHouseNT2}
        onManageRoom={(room) => {
          setSelectedRoom(room)
          setRoomModalMode('edit')
          setRoomModalOpen(true)
        }}
      />

      <SmartExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        title={viewTab === 'rooms' ? `Smart Export: ${code} GH Rooms` : `Smart Export: ${code} GH Bookings`}
        defaultFileName={viewTab === 'rooms' ? `${code}_GH_Rooms` : `${code}_GH_Bookings`}
        allData={viewTab === 'rooms' ? exportRooms : allBookings}
        filteredData={viewTab === 'rooms' ? filteredExportRooms : processedBookings}
        availableColumns={viewTab === 'rooms' ? [
          { key: 'floor', label: 'Floor No.' },
          { key: 'roomNo', label: 'Room No.' },
          { key: 'status', label: 'Status' },
          { key: 'guestName', label: 'Guest Name' },
          { key: 'dept', label: 'Guest Category/Dept' },
          { key: 'furniture', label: 'Furniture Inventory' },
        ] : [
          { key: 'id', label: 'Booking ID' },
          { key: 'roomNo', label: 'Room No.' },
          { key: 'guestName', label: 'Guest Name' },
          { key: 'guestStatus', label: 'Guest Category/Dept' },
          { key: 'bookingStatus', label: 'Booking Status' },
          { key: 'expectedCheckInDate', label: 'Expected Check-In' },
          { key: 'expectedCheckOutDate', label: 'Expected Check-Out' },
          { key: 'actualCheckInDateTime', label: 'Actual Check-In' },
          { key: 'actualCheckOutDateTime', label: 'Actual Check-Out' },
        ]}
      />
    </>
  )
}
