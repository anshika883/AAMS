import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import Donut from '../components/charts/Donut'
import { IMAGES } from '../constants/images'
import { useAams } from '../lib/useAams'
import BuildingMapModal from '../components/BuildingMapModal'
import FlatManageModal from '../components/FlatManageModal'

export default function Dashboard() {
  const {
    residentialNT1,
    residentialNT2,
    guestHouseNT1,
    guestHouseNT2,
    bookings,
    auditLog,
    updateResidential,
    clearLogs,
  } = useAams()

  // Modal open states
  const [mapOpen, setMapOpen] = useState(false)
  const [auditOpen, setAuditOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  
  // Dashboard Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Search text inside Audit Log modal
  const [auditSearch, setAuditSearch] = useState('')

  // Combine and search across both NT1 and NT2 residents
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []

    const nt1 = residentialNT1.map(u => ({ ...u, buildingCode: 'NT1' }))
    const nt2 = residentialNT2.map(u => ({ ...u, buildingCode: 'NT2' }))
    const all = [...nt1, ...nt2]

    return all.filter(u => {
      return (
        (u.residentName && u.residentName.toLowerCase().includes(q)) ||
        (u.roomNo && u.roomNo.toLowerCase().includes(q)) ||
        (u.deptt && u.deptt.toLowerCase().includes(q)) ||
        (u.furniture && u.furniture.toLowerCase().includes(q))
      )
    })
  }, [residentialNT1, residentialNT2, searchQuery])

  // Compute Residential stats
  const resStats = useMemo(() => {
    const nt1Total = residentialNT1.length || 102
    const nt2Total = residentialNT2.length || 102
    const total = nt1Total + nt2Total

    const nt1Occupied = residentialNT1.filter((u) => u.occupancy === 'Occupied').length
    const nt2Occupied = residentialNT2.filter((u) => u.occupancy === 'Occupied').length
    const occupied = nt1Occupied + nt2Occupied
    const vacant = total - occupied

    const nt1Pct = Math.round((nt1Occupied / nt1Total) * 100) || 0
    const nt2Pct = Math.round((nt2Occupied / nt2Total) * 100) || 0

    return {
      total,
      occupied,
      vacant,
      nt1Total,
      nt1Occupied,
      nt1Vacant: nt1Total - nt1Occupied,
      nt1Pct,
      nt2Total,
      nt2Occupied,
      nt2Vacant: nt2Total - nt2Occupied,
      nt2Pct,
    }
  }, [residentialNT1, residentialNT2])

  // Compute Guest House stats
  const guestStats = useMemo(() => {
    const allRooms = [...guestHouseNT1, ...guestHouseNT2]
    const total = allRooms.length
    
    const available = allRooms.filter(r => r.status === 'Available').length
    const reserved = allRooms.filter(r => r.status === 'Reserved').length
    const occupied = allRooms.filter(r => r.status === 'Occupied').length
    const cleaning = allRooms.filter(r => r.status === 'Under Cleaning').length
    const maintenance = allRooms.filter(r => r.status === 'Maintenance').length
    
    const pct = total > 0 ? Math.round((occupied / total) * 100) : 0

    const todayStr = '2026-07-02'
    
    const checkInsToday = bookings.filter(
      b => b.expectedCheckInDate === todayStr && b.bookingStatus === 'Reserved'
    ).length

    const checkOutsToday = bookings.filter(
      b => b.expectedCheckOutDate === todayStr && (b.bookingStatus === 'Occupied' || b.actualCheckOutDateTime?.startsWith(todayStr))
    ).length

    const currentGuests = bookings.filter(
      b => b.guestStatus === 'Checked In'
    ).length

    const upcomingArrivals = bookings.filter(
      b => b.bookingStatus === 'Reserved' && b.expectedCheckInDate >= todayStr
    ).length

    const overstayingGuests = bookings.filter(
      b => b.guestStatus === 'Checked In' && !b.actualCheckOutDateTime && b.expectedCheckOutDate < todayStr
    ).length

    return {
      total,
      occupied,
      vacant: available,
      available,
      reserved,
      cleaning,
      maintenance,
      pct,
      checkInsToday,
      checkOutsToday,
      currentGuests,
      upcomingArrivals,
      overstayingGuests
    }
  }, [guestHouseNT1, guestHouseNT2, bookings])

  // Handle flat management from Map Modal
  const handleManageFlat = (buildingCode, roomNo) => {
    const pool = buildingCode === 'NT1' ? residentialNT1 : residentialNT2
    const unit = pool.find((u) => u.roomNo === roomNo)
    if (unit) {
      setSelectedUnit({ ...unit, buildingCode })
    }
  }

  // Filtered Audit Log
  const filteredAuditLog = useMemo(() => {
    const q = auditSearch.trim().toLowerCase()
    if (!q) return auditLog
    return auditLog.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.timestamp.toLowerCase().includes(q)
    )
  }, [auditLog, auditSearch])

  return (
    <>
      <TopBar
        searchPlaceholder="Search NT1 or NT2 resident names, room numbers, departments..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />
      <Page>
        <div className="mx-auto max-w-[1400px]">
          {searchQuery.trim() && (
            <div className="mb-lg rounded-xl border border-primary/20 bg-[#f8fafc] p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="search" className="text-primary" />
                  <h3 className="text-title-md font-bold text-on-surface">
                    Search Results ({searchResults.length} matches)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  Clear Search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((res) => (
                  <div
                    key={`${res.buildingCode}-${res.roomNo}`}
                    className="p-4 bg-white rounded-lg border border-outline-variant/60 hover:border-primary transition-all flex flex-col justify-between shadow-2xs"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                          {res.buildingCode} — Floor {res.floor}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            res.occupancy === 'Occupied'
                              ? 'bg-red-50 text-red-700 border border-red-200/50'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                          }`}
                        >
                          {res.occupancy}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-on-surface mb-1">
                        Room {res.roomNo}
                      </h4>
                      {res.occupancy === 'Occupied' ? (
                        <div className="space-y-1 text-xs">
                          <p className="text-on-surface">
                            <span className="font-semibold text-secondary">Occupant:</span> {res.residentName}
                          </p>
                          {res.deptt && (
                            <p className="text-secondary">
                              <span className="font-semibold">Dept:</span> {res.deptt}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-secondary italic">Unit is currently vacant</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleManageFlat(res.buildingCode, res.roomNo)}
                      className="mt-3 w-full py-1.5 rounded-md bg-surface-container-low hover:bg-surface-container-high text-xs font-bold text-primary transition-colors cursor-pointer text-center"
                    >
                      View &amp; Edit Details
                    </button>
                  </div>
                ))}
              </div>

              {searchResults.length === 0 && (
                <p className="text-sm italic text-secondary text-center py-4">
                  No NT1 or NT2 resident/room matches found for "{searchQuery}".
                </p>
              )}
            </div>
          )}

          <div className="mb-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">Dashboard</h2>
              <p className="text-body-md text-on-surface-variant">
                Real-time overview of college accommodation and occupancy metrics.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMapOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-bold text-on-primary shadow-md hover:bg-primary-container transition-all"
            >
              <Icon name="grid_view" />
              Open Interactive Map
            </button>
          </div>

          {/* Metrics summary cards */}
          <div className="mb-xl grid grid-cols-1 gap-gutter lg:grid-cols-3">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-md uppercase tracking-wider text-secondary">Residential Summary</h3>
                <Icon name="apartment" className="text-primary" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-label-sm">
                    <span className="text-on-surface">Total Flats</span>
                    <span className="font-bold">{resStats.total}</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${(resStats.nt1Occupied + resStats.nt2Occupied) / 2}%` }}
                    />
                    <div
                      className="h-full bg-primary-fixed-dim transition-all duration-500"
                      style={{ width: `${(resStats.nt1Vacant + resStats.nt2Vacant) / 2}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-secondary">
                    <span>NT1: {resStats.nt1Total}</span>
                    <span>NT2: {resStats.nt2Total}</span>
                  </div>
                </div>

                 <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-red-50/50 border border-red-200 p-3 text-center">
                    <p className="text-xs text-red-700 font-bold uppercase tracking-wide">Occupied (Full)</p>
                    <p className="text-headline-sm text-red-700 font-bold">{resStats.occupied}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-3 text-center">
                    <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Vacant (Empty)</p>
                    <p className="text-headline-sm text-emerald-700 font-bold">{resStats.vacant}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-md uppercase tracking-wider text-secondary">Reports Overview</h3>
                <Icon name="description" className="text-tertiary" />
              </div>
              <div className="flex h-[calc(100%-2.5rem)] flex-col justify-between py-1">
                <div className="mb-2 text-center">
                  <p className="text-label-sm text-secondary">Pending Action Reports</p>
                  <p className="text-[36px] font-bold text-on-surface">3 Active</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded bg-surface-container-low p-2">
                    <span className="flex items-center gap-2 text-body-md text-on-surface">
                      <Icon name="schedule" className="text-sm text-tertiary" />
                      Pending Requests
                    </span>
                    <span className="font-bold text-on-surface">15</span>
                  </div>
                  <div className="flex items-center justify-between rounded bg-surface-container-low p-2">
                    <span className="flex items-center gap-2 text-body-md text-on-surface">
                      <Icon name="build" className="text-sm text-error" />
                      Maintenance Pending
                    </span>
                    <span className="font-bold text-error">3 Rooms</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-md uppercase tracking-wider text-secondary">Guest House Status</h3>
                <Icon name="hotel" className="text-secondary" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Donut percent={guestStats.pct} />
                  <div>
                    <p className="text-label-sm text-on-surface font-bold">Occupancy Rate</p>
                    <p className="text-xs text-secondary">
                      {guestStats.occupied} of {guestStats.total} units occupied today
                    </p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 py-2">
                    <span className="text-body-md text-secondary">Current Bookings</span>
                    <span className="font-bold text-on-surface">{guestStats.occupied} Rooms</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-outline-variant/30 py-2">
                    <span className="text-body-md text-secondary">Available Now</span>
                    <span className="font-bold text-primary">{guestStats.vacant} Rooms</span>
                  </div>
                </div>
                <Link
                  to="/guest-houses/nt1"
                  className="block w-full rounded py-1.5 text-center text-label-sm font-bold text-primary transition-colors hover:bg-primary-container/10"
                >
                  Manage Bookings
                </Link>
              </div>
            </div>
          </div>

          {/* Guest House Operations and Lifecycle Dashboard */}
          <div className="mb-xl rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-outline-variant/30 pb-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <Icon name="hotel" className="text-primary" /> Guest House Operations &amp; Booking Lifecycle
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  Real-time status of rooms, active check-in queue, overstay alerts, and housekeeping releases.
                </p>
              </div>
              <Link
                to="/guest-houses/nt1"
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary shadow-xs hover:bg-primary-container transition-all"
              >
                <Icon name="event_busy" className="text-sm" /> Manage Bookings &amp; Check-ins
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Room Status Breakdown Cards */}
              <div className="lg:col-span-7 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">Rooms Status Inventory</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="rounded-lg border border-emerald-100 bg-[#f0fdf4] p-3 text-center transition-all hover:shadow-xs">
                    <Icon name="check_circle" className="text-emerald-500 mb-1.5" />
                    <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wide">Available</span>
                    <span className="text-2xl font-bold text-emerald-950 block mt-1">{guestStats.available}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Clean &amp; Ready</span>
                  </div>

                  <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3 text-center transition-all hover:shadow-xs">
                    <Icon name="pending" className="text-blue-500 mb-1.5" />
                    <span className="block text-[11px] font-bold text-blue-800 uppercase tracking-wide">Reserved</span>
                    <span className="text-2xl font-bold text-blue-950 block mt-1">{guestStats.reserved}</span>
                    <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">Upcoming Guests</span>
                  </div>

                  <div className="rounded-lg border border-red-100 bg-red-50/50 p-3 text-center transition-all hover:shadow-xs">
                    <Icon name="meeting_room" className="text-red-500 mb-1.5" />
                    <span className="block text-[11px] font-bold text-red-800 uppercase tracking-wide">Occupied</span>
                    <span className="text-2xl font-bold text-red-950 block mt-1">{guestStats.occupied}</span>
                    <span className="text-[10px] text-red-600 font-semibold block mt-0.5">Guests Staying</span>
                  </div>

                  <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3 text-center transition-all hover:shadow-xs">
                    <Icon name="cleaning_services" className="text-amber-500 mb-1.5" />
                    <span className="block text-[11px] font-bold text-amber-800 uppercase tracking-wide">Cleaning</span>
                    <span className="text-2xl font-bold text-amber-950 block mt-1">{guestStats.cleaning}</span>
                    <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">Housekeeping</span>
                  </div>

                  <div className="rounded-lg border border-outline-variant/30 bg-surface-container p-3 text-center transition-all hover:shadow-xs">
                    <Icon name="build" className="text-secondary mb-1.5" />
                    <span className="block text-[11px] font-bold text-secondary uppercase tracking-wide">Maintenance</span>
                    <span className="text-2xl font-bold text-on-surface block mt-1">{guestStats.maintenance}</span>
                    <span className="text-[10px] text-outline font-semibold block mt-0.5">Needs Attention</span>
                  </div>
                </div>
              </div>

              {/* Guest Operations Summary */}
              <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-outline-variant/30 pt-4 lg:pt-0 lg:pl-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">Today's Lifecycle Schedule</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-bright">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-primary-container/10 text-primary">
                      <Icon name="login" className="text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-wide">Today's Check-ins</span>
                      <span className="block text-lg font-bold text-on-surface">{guestStats.checkInsToday}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-bright">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                      <Icon name="logout" className="text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-wide">Today's Check-outs</span>
                      <span className="block text-lg font-bold text-on-surface">{guestStats.checkOutsToday}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-bright">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-blue-50 text-blue-600">
                      <Icon name="groups" className="text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-wide">Current Guests</span>
                      <span className="block text-lg font-bold text-on-surface">{guestStats.currentGuests}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/20 bg-surface-bright">
                    <div className="flex h-9 w-9 items-center justify-center rounded bg-amber-50 text-amber-600">
                      <Icon name="pending_actions" className="text-sm" />
                    </div>
                    <div>
                      <span className="text-[10px] text-outline font-bold uppercase tracking-wide">Upcoming Arrivals</span>
                      <span className="block text-lg font-bold text-on-surface">{guestStats.upcomingArrivals}</span>
                    </div>
                  </div>
                </div>

                {guestStats.overstayingGuests > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-error/20 bg-error-container/20 text-error animate-pulse">
                    <Icon name="warning" />
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wide">Overstay Warning</span>
                      <span className="text-xs font-semibold">There are {guestStats.overstayingGuests} guest(s) currently overstaying expected checkout dates!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Building comparison */}
          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
            <div className="flex flex-col gap-gutter lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Building Comparison</h3>
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="text-label-md font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Icon name="map" className="text-sm" /> View Detailed Map
                </button>
              </div>

              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                <div className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-colors duration-300 hover:border-primary">
                  <div className="relative h-32 overflow-hidden bg-surface-container">
                    <img className="h-full w-full object-cover" alt="NT1 Building" src={IMAGES.nt1Building} />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                      NT1 Building
                    </div>
                  </div>
                  <div className="p-gutter">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-label-sm uppercase tracking-tighter text-secondary">Current Occupancy</p>
                        <p className="font-headline-md text-headline-md text-on-surface">{resStats.nt1Pct}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-body-md font-semibold text-on-surface">{resStats.nt1Total} Total Units</p>
                      </div>
                    </div>
                     <div className="space-y-3">
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-red-500" /> Occupied (Full)
                        </span>
                        <span className="font-bold">{resStats.nt1Occupied}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-green-500" /> Vacant (Empty)
                        </span>
                        <span className="font-bold">{resStats.nt1Vacant}</span>
                      </div>
                    </div>
                    <Link
                      to="/residential/nt1"
                      className="mt-gutter block w-full rounded-lg border border-outline-variant py-2 text-center font-bold text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      Explore Units
                    </Link>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-colors duration-300 hover:border-primary">
                  <div className="relative h-32 overflow-hidden bg-surface-container">
                    <img className="h-full w-full object-cover" alt="NT2 Building" src={IMAGES.nt2Building} />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                      NT2 Building
                    </div>
                  </div>
                  <div className="p-gutter">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-label-sm uppercase tracking-tighter text-secondary">Current Occupancy</p>
                        <p className="font-headline-md text-headline-md text-on-surface">{resStats.nt2Pct}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-body-md font-semibold text-on-surface">{resStats.nt2Total} Total Units</p>
                      </div>
                    </div>
                     <div className="space-y-3">
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-red-500" /> Occupied (Full)
                        </span>
                        <span className="font-bold">{resStats.nt2Occupied}</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-green-500" /> Vacant (Empty)
                        </span>
                        <span className="font-bold">{resStats.nt2Vacant}</span>
                      </div>
                    </div>
                    <Link
                      to="/residential/nt2"
                      className="mt-gutter block w-full rounded-lg border border-outline-variant py-2 text-center font-bold text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      Explore Units
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary-container bg-primary p-lg text-on-primary shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Icon name="sync_saved_locally" className="text-white" />
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm">Database Synced</p>
                    <p className="text-body-md opacity-80">All occupancy records are up to date in localStorage.</p>
                  </div>
                </div>
                <Link
                  to="/reports"
                  className="rounded-lg bg-white px-gutter py-2.5 font-bold text-primary transition-colors hover:bg-primary-fixed shadow-sm"
                >
                  View Reports
                </Link>
              </div>
            </div>

            {/* Audit log preview */}
            <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant p-gutter">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Activity</h3>
                <Icon name="history" className="text-lg text-secondary" />
              </div>
              <div className="flex flex-col gap-6 overflow-y-auto p-gutter max-h-[460px]">
                {auditLog.slice(0, 5).map((log) => {
                  let icon = 'info'
                  let iconColor = 'text-primary'
                  let containerColor = 'border-primary/20 bg-primary-container/10'

                  if (log.type === 'add') {
                    icon = 'person_add'
                    iconColor = 'text-[#16a34a]'
                    containerColor = 'border-[#22c55e]/20 bg-[#f0fdf4]'
                  } else if (log.type === 'remove' || log.type === 'vacate') {
                    icon = 'person_remove'
                    iconColor = 'text-error'
                    containerColor = 'border-error/20 bg-error-container/20'
                  } else if (log.type === 'edit') {
                    icon = 'edit'
                    iconColor = 'text-tertiary'
                    containerColor = 'border-outline-variant bg-surface-container-high'
                  } else if (log.type === 'settings') {
                    icon = 'settings'
                    iconColor = 'text-secondary'
                    containerColor = 'border-secondary/20 bg-secondary-container/20'
                  }

                  return (
                    <div key={log.id} className="relative flex gap-4">
                      <div className="absolute bottom-0 left-5 top-10 w-[1px] bg-outline-variant" />
                      <div className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${containerColor}`}>
                        <Icon name={icon} className={iconColor} />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-body-md text-on-surface leading-tight">
                          <span className="font-bold">{log.action}:</span> {log.details}
                        </p>
                        <p className="text-label-sm text-secondary">{log.timestamp}</p>
                      </div>
                    </div>
                  )
                })}

                {auditLog.length === 0 && (
                  <p className="text-sm italic text-outline text-center py-6">No recent actions.</p>
                )}

                <button
                  type="button"
                  onClick={() => setAuditOpen(true)}
                  className="mt-2 w-full py-2 text-center text-label-md font-bold text-primary transition-colors hover:underline cursor-pointer"
                >
                  View Full Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>

      {/* Building Occupancy Map Modal */}
      <BuildingMapModal
        isOpen={mapOpen}
        onClose={() => setMapOpen(false)}
        residentialNT1={residentialNT1}
        residentialNT2={residentialNT2}
        onManageFlat={handleManageFlat}
      />

      {/* Flat Management Modal */}
      <FlatManageModal
        isOpen={!!selectedUnit}
        onClose={() => setSelectedUnit(null)}
        unit={selectedUnit}
        onSave={updateResidential}
      />

      {/* Audit Log Modal */}
      {auditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
              <div className="flex items-center gap-2">
                <Icon name="history" className="text-primary" />
                <h3 className="text-headline-sm font-headline-sm text-on-surface">
                  System Audit Logs
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAuditOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex gap-3">
              <div className="relative flex-grow">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  placeholder="Search actions or details..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-white py-2 pl-10 pr-4 text-body-md focus:border-primary focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={clearLogs}
                className="flex items-center gap-1.5 rounded-lg border border-error bg-white px-4 py-2 text-label-md font-bold text-error hover:bg-error-container/20 transition-all cursor-pointer"
              >
                <Icon name="delete_sweep" />
                Clear Logs
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {filteredAuditLog.map((log) => (
                <div key={log.id} className="flex gap-4 border-b border-outline-variant/30 pb-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container">
                    <Icon name="schedule" className="text-secondary" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-body-md text-on-surface">{log.action}</span>
                      <span className="text-xs text-outline font-semibold">{log.timestamp}</span>
                    </div>
                    <p className="text-body-md text-secondary mt-1">{log.details}</p>
                  </div>
                </div>
              ))}

              {filteredAuditLog.length === 0 && (
                <div className="text-center py-12 text-outline italic">No log entries found.</div>
              )}
            </div>

            <div className="border-t border-outline-variant bg-surface-container px-6 py-4 flex justify-between items-center text-xs text-secondary shrink-0">
              <span>Showing {filteredAuditLog.length} actions</span>
              <button
                type="button"
                onClick={() => setAuditOpen(false)}
                className="rounded-lg border border-outline-variant px-4 py-2 bg-white font-bold hover:bg-surface-container transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
