import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import GuestRoomModal from '../../components/GuestRoomModal'
import { IMAGES } from '../../constants/images'
import { useAams } from '../../lib/useAams'
import { exportToCsv } from '../../lib/export'

function InventoryRow({ floor, roomNo, furniture, status, maintenance, onManage }) {
  const isOccupied = status === 'Occupied'
  const isMaintenance = maintenance === 'pending'
  
  // Style tags
  const statusClass = isOccupied
    ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
    : 'bg-primary-container/10 text-primary border-primary/20'
  const dotClass = isOccupied ? 'bg-[#22c55e]' : 'bg-primary'

  const actionIcon = isMaintenance ? 'warning' : (furniture.length === 0 ? 'add_circle' : 'edit')
  const actionColor = isMaintenance ? 'text-error' : (furniture.length === 0 ? 'text-primary' : 'text-secondary')

  return (
    <tr className="transition-colors hover:bg-surface-container-low/30">
      <td className="px-lg py-4 text-body-md text-on-surface-variant">{floor}</td>
      <td className="px-lg py-4 text-body-md font-bold text-primary">{roomNo}</td>
      <td className="px-lg py-4">
        {status && (
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold mr-3 ${statusClass}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
            {status}
          </span>
        )}
        
        {isMaintenance && (
          <span className="inline-flex items-center gap-1 rounded-full border border-error/30 bg-error-container/20 px-2 py-0.5 text-xs font-bold text-error mr-3">
            <Icon name="warning" className="text-[10px]" />
            Maintenance
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
        <button
          type="button"
          onClick={onManage}
          className={`rounded-full p-2 hover:bg-surface-container transition-colors cursor-pointer ${actionColor}`}
          title="Manage Room Details"
        >
          <Icon name={actionIcon} className="text-[20px]" />
        </button>
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
  } = useAams()

  // Local state
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFloorFilter, setActiveFloorFilter] = useState('All')
  const [sortBy, setSortBy] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [selectedRoom, setSelectedRoom] = useState(null)

  const itemsPerPage = 5

  // Get current guest house rooms
  const rooms = useMemo(() => {
    return code === 'NT2' ? guestHouseNT2 : guestHouseNT1
  }, [code, guestHouseNT1, guestHouseNT2])

  // Get unique floors for filter buttons
  const uniqueFloors = useMemo(() => {
    const list = rooms.map((r) => r.floor)
    const unique = Array.from(new Set(list))
    // Simple sorting: Ground Floor, 1st, 2nd, 3rd, 4th
    const order = { 'Ground Floor': 0, '1st Floor': 1, '2nd Floor': 2, '3rd Floor': 3, '4th Floor': 4 }
    return unique.sort((a, b) => (order[a] ?? 9) - (order[b] ?? 9))
  }, [rooms])

  // Dynamic calculations
  const stats = useMemo(() => {
    const total = rooms.length
    const occupied = rooms.filter((r) => r.status === 'Occupied').length
    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
    const maintenanceCount = rooms.filter((r) => r.maintenance === 'pending').length
    const floorsCount = uniqueFloors.length

    return { total, occupied, pct, maintenanceCount, floorsCount }
  }, [rooms, uniqueFloors])

  // Filter, sort, paginate rooms
  const processedRooms = useMemo(() => {
    // 1. Search filter
    let list = rooms.filter((r) => {
      const furnitureStr = r.furniture.join(' ')
      const hay = `${r.floor} ${r.roomNo} ${r.status} ${r.maintenance} ${furnitureStr}`.toLowerCase()
      return hay.includes(searchTerm.trim().toLowerCase())
    })

    // 2. Floor filter
    if (activeFloorFilter !== 'All') {
      list = list.filter((r) => r.floor === activeFloorFilter)
    }

    // 3. Sorting
    list.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        return b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      }
    })

    return list
  }, [rooms, searchTerm, activeFloorFilter, sortBy])

  // Paginated rooms
  const paginatedRooms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return processedRooms.slice(start, start + itemsPerPage)
  }, [processedRooms, currentPage])

  const totalPages = Math.ceil(processedRooms.length / itemsPerPage) || 1

  // Handle Export
  const handleExport = () => {
    exportToCsv(
      `${code}_Guest_House_Inventory`,
      ['floor', 'roomNo', 'status', 'maintenance', 'furniture'],
      rooms.map((r) => ({
        ...r,
        furniture: r.furniture.join(', ')
      }))
    )
  }

  // Handle opening modal for editing
  const handleOpenEdit = (room) => {
    setSelectedRoom(room)
    setModalMode('edit')
    setModalOpen(true)
  }

  // Handle opening modal for adding
  const handleOpenAdd = () => {
    setSelectedRoom(null)
    setModalMode('add')
    setModalOpen(true)
  }

  // Handle save from modal
  const handleSaveRoom = (payload) => {
    if (modalMode === 'add') {
      const res = addGuestRoom(code, payload)
      if (res && res.error) return res
      setCurrentPage(1) // Go to page 1
    } else {
      updateGuestHouse(code, payload.roomNo, {
        status: payload.status,
        maintenance: payload.maintenance,
        furniture: payload.furniture,
      })
    }
  }

  return (
    <>
      <TopBar
        searchPlaceholder="Search rooms or facilities..."
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
                Manage room inventory, furniture tracking, and floor assignments.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2.5 text-label-md font-bold text-on-surface hover:bg-surface-container transition-all cursor-pointer shadow-sm"
              >
                <Icon name="download" className="text-[20px]" />
                Export List
              </button>
              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-all cursor-pointer"
              >
                <Icon name="add_home" className="text-[20px]" />
                Add New Room
              </button>
            </div>
          </div>

          {/* Stats widgets */}
          <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Total Rooms</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{stats.total}</span>
                <span className="text-xs text-primary font-bold">G to 4th Floor</span>
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
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Maintenance Log</span>
              <div className="flex items-end justify-between">
                <span className={`text-headline-md font-headline-md ${stats.maintenanceCount > 0 ? 'text-error font-bold' : 'text-on-surface'}`}>
                  {stats.maintenanceCount}
                </span>
                {stats.maintenanceCount > 0 ? (
                  <span className="rounded bg-error-container/20 px-2 py-0.5 text-xs font-bold text-error border border-error/20">
                    Action Required
                  </span>
                ) : (
                  <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-xs font-bold text-[#166534] border border-[#bbf7d0]">
                    Functional
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary font-semibold uppercase tracking-wider">Total Floors</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">{stats.floorsCount}</span>
                <span className="text-xs text-secondary font-bold">Active Floors</span>
              </div>
            </div>
          </div>

          {/* Matrix table container */}
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
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
                    <th className="border-b border-outline-variant px-lg py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Status &amp; Alert</th>
                    <th className="border-b border-outline-variant px-lg py-4 text-left text-xs font-bold uppercase tracking-wider text-secondary">Furniture Inventory</th>
                    <th className="border-b border-outline-variant px-lg py-4 text-right text-xs font-bold uppercase tracking-wider text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {paginatedRooms.map((r) => (
                    <InventoryRow
                      key={r.roomNo}
                      floor={r.floor}
                      roomNo={r.roomNo}
                      furniture={r.furniture}
                      status={r.status}
                      maintenance={r.maintenance}
                      onManage={() => handleOpenEdit(r)}
                    />
                  ))}

                  {paginatedRooms.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-lg py-12 text-center text-outline italic">
                        No guest rooms match the filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/15 px-lg py-4">
              <p className="text-label-sm text-secondary font-semibold">
                Showing {paginatedRooms.length} of {processedRooms.length} matching rooms
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
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        room={selectedRoom}
        mode={modalMode}
        onSave={handleSaveRoom}
      />
    </>
  )
}
