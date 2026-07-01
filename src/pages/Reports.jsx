import { useMemo, useState } from 'react'
import Page from '../components/Page'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import CustomReportModal from '../components/CustomReportModal'
import { IMAGES } from '../constants/images'
import { REPORT_TYPES } from '../lib/data'
import { useAams } from '../lib/useAams'
import { exportToCsv } from '../lib/export'

export default function Reports() {
  const {
    residentialNT1,
    residentialNT2,
    guestHouseNT1,
    guestHouseNT2,
  } = useAams()

  // Local state
  const [selected, setSelected] = useState('occupancy')
  const [timeframe, setTimeframe] = useState('current') // current or historical
  const [currentPage, setCurrentPage] = useState(1)
  const [customModalOpen, setCustomModalOpen] = useState(false)
  const [customReportConfig, setCustomReportConfig] = useState(null)
  
  const itemsPerPage = 5

  // Calculations for KPI Cards
  const kpis = useMemo(() => {
    const totalFlats = residentialNT1.length + residentialNT2.length || 204
    const occupiedFlats =
      residentialNT1.filter((u) => u.occupancy === 'Occupied').length +
      residentialNT2.filter((u) => u.occupancy === 'Occupied').length
    
    // Overall Occupancy Rate
    const occPct = totalFlats > 0 ? ((occupiedFlats / totalFlats) * 100).toFixed(1) : '86.4'
    const vacantCount = totalFlats - occupiedFlats

    return {
      occPct,
      vacantCount,
      pendingRequests: 15,
      assetValue: '$1.2M',
    }
  }, [residentialNT1, residentialNT2])

  // Custom Report generator logic
  const customReportData = useMemo(() => {
    if (selected !== 'custom' || !customReportConfig) return []

    const { target, building, status, furnitureFilter } = customReportConfig

    // Choose pool
    let pool = []
    if (target === 'residential') {
      if (building === 'All' || building === 'NT1') pool = [...pool, ...residentialNT1.map(u => ({ ...u, type: 'Residential', name: 'NT1' }))]
      if (building === 'All' || building === 'NT2') pool = [...pool, ...residentialNT2.map(u => ({ ...u, type: 'Residential', name: 'NT2' }))]
    } else {
      if (building === 'All' || building === 'NT1') pool = [...pool, ...guestHouseNT1.map(u => ({ ...u, type: 'Guest House', name: 'NT1' }))]
      if (building === 'All' || building === 'NT2') pool = [...pool, ...guestHouseNT2.map(u => ({ ...u, type: 'Guest House', name: 'NT2' }))]
    }

    // Apply status filter
    if (status !== 'All') {
      pool = pool.filter((u) => {
        const val = target === 'residential' ? u.occupancy : u.status
        return val === status
      })
    }

    // Apply furniture filter
    if (furnitureFilter !== 'All') {
      pool = pool.filter((u) => {
        const furn = target === 'residential' ? u.furniture : u.furniture.join(', ')
        if (furnitureFilter === 'NIL') {
          return furn === 'NIL' || furn === '' || !furn
        }
        if (furnitureFilter === 'HasAC') {
          return furn.toLowerCase().includes('ac')
        }
        if (furnitureFilter === 'HasBed') {
          return furn.toLowerCase().includes('bed')
        }
        return true
      })
    }

    return pool
  }, [selected, customReportConfig, residentialNT1, residentialNT2, guestHouseNT1, guestHouseNT2])

  // Get current dataset based on selected report type
  const reportRows = useMemo(() => {
    // Current vs Historical simulations
    const offset = timeframe === 'historical' ? 1 : 0

    if (selected === 'occupancy') {
      const nt1Total = residentialNT1.length || 102
      const nt1Occupied = residentialNT1.filter((u) => u.occupancy === 'Occupied').length
      
      const nt2Total = residentialNT2.length || 102
      const nt2Occupied = residentialNT2.filter((u) => u.occupancy === 'Occupied').length

      return [
        {
          building: 'NT1 Tower (Residential)',
          capacity: nt1Total,
          occupied: nt1Occupied - offset * 4,
          vacant: nt1Total - nt1Occupied + offset * 4,
          usage: `${Math.round(((nt1Occupied - offset * 4) / nt1Total) * 100)}%`,
          status: 'STABLE',
        },
        {
          building: 'NT2 Tower (Residential)',
          capacity: nt2Total,
          occupied: nt2Occupied - offset * 6,
          vacant: nt2Total - nt2Occupied + offset * 6,
          usage: `${Math.round(((nt2Occupied - offset * 6) / nt2Total) * 100)}%`,
          status: 'STABLE',
        },
        {
          building: 'NT1 Guest House',
          capacity: guestHouseNT1.length,
          occupied: guestHouseNT1.filter(r => r.status === 'Occupied').length - offset,
          vacant: guestHouseNT1.length - guestHouseNT1.filter(r => r.status === 'Occupied').length + offset,
          usage: `${Math.round(((guestHouseNT1.filter(r => r.status === 'Occupied').length - offset) / guestHouseNT1.length) * 100)}%`,
          status: 'STABLE',
        },
        {
          building: 'NT2 Guest House',
          capacity: guestHouseNT2.length,
          occupied: guestHouseNT2.filter(r => r.status === 'Occupied').length - offset,
          vacant: guestHouseNT2.length - guestHouseNT2.filter(r => r.status === 'Occupied').length + offset,
          usage: `${Math.round(((guestHouseNT2.filter(r => r.status === 'Occupied').length - offset) / guestHouseNT2.length) * 100)}%`,
          status: 'STABLE',
        },
      ]
    }

    if (selected === 'building') {
      return [
        { name: 'NT1 Residential', floors: '17 Floors', manager: 'John Smith', status: 'Good', lastInspection: timeframe === 'current' ? 'Jun 12, 2026' : 'Oct 12, 2025' },
        { name: 'NT2 Residential', floors: '17 Floors', manager: 'Sarah Johnson', status: 'Minor Repairs', lastInspection: timeframe === 'current' ? 'Jun 05, 2026' : 'Nov 05, 2025' },
        { name: 'NT1 Guest House', floors: '5 Floors', manager: 'Emma Davis', status: 'Excellent', lastInspection: timeframe === 'current' ? 'May 20, 2026' : 'Dec 02, 2025' },
        { name: 'NT2 Guest House', floors: '3 Floors', manager: 'Robert Wilson', status: 'Attention Required', lastInspection: timeframe === 'current' ? 'Jun 18, 2026' : 'Jan 15, 2026' },
      ]
    }

    if (selected === 'pending') {
      return [
        { id: '#REQ-8291', user: 'Michael Doe', type: 'Transfer Request', date: timeframe === 'current' ? '2 days ago' : '1 year ago', priority: 'URGENT' },
        { id: '#REQ-8295', user: 'Anna Lee', type: 'Furniture Repair', date: timeframe === 'current' ? '1 week ago' : '1 year ago', priority: 'NORMAL' },
        { id: '#REQ-8302', user: 'Rajesh Sen', type: 'AC Install Request', date: timeframe === 'current' ? '3 days ago' : '1 year ago', priority: 'URGENT' },
        { id: '#REQ-8310', user: 'Sunita Roy', type: 'Key Duplicate', date: timeframe === 'current' ? 'Yesterday' : '1 year ago', priority: 'LOW' },
      ]
    }

    if (selected === 'furniture') {
      return [
        { category: 'Beds & Frames', total: 450, inUse: 412, stock: 38, condition: 'Excellent' },
        { category: 'Study Desks', total: 320, inUse: 295, stock: 25, condition: 'Fair' },
        { category: 'Air Conditioners', total: 180, inUse: 154, stock: 26, condition: 'Excellent' },
        { category: 'Wardrobes', total: 410, inUse: 375, stock: 35, condition: 'Good' },
        { category: 'Armchairs', total: 240, inUse: 210, stock: 30, condition: 'Fair' },
      ]
    }

    if (selected === 'custom') {
      return customReportData
    }

    return []
  }, [selected, timeframe, customReportData, residentialNT1, residentialNT2, guestHouseNT1, guestHouseNT2])

  // Pagination calculation
  const totalPages = Math.ceil(reportRows.length / itemsPerPage) || 1
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return reportRows.slice(start, start + itemsPerPage)
  }, [reportRows, currentPage])

  // Custom Report callback
  const handleGenerateCustom = (config) => {
    setCustomReportConfig(config)
    setSelected('custom')
    setCurrentPage(1)
  }

  // Handle Export
  const handleExportReport = () => {
    if (selected === 'occupancy') {
      exportToCsv('Occupancy_Report', ['building', 'capacity', 'occupied', 'vacant', 'usage', 'status'], reportRows)
    } else if (selected === 'building') {
      exportToCsv('Building_Report', ['name', 'floors', 'manager', 'status', 'lastInspection'], reportRows)
    } else if (selected === 'pending') {
      exportToCsv('Pending_Requests_Report', ['id', 'user', 'type', 'date', 'priority'], reportRows)
    } else if (selected === 'furniture') {
      exportToCsv('Furniture_Asset_Report', ['category', 'total', 'inUse', 'stock', 'condition'], reportRows)
    } else if (selected === 'custom') {
      const cols = customReportConfig?.columns || []
      const rows = reportRows.map((r) => {
        const item = {}
        if (cols.includes('floor')) item.floor = r.floor
        if (cols.includes('roomNo')) item.roomNo = r.roomNo
        if (cols.includes('status')) item.status = customReportConfig.target === 'residential' ? r.occupancy : r.status
        if (cols.includes('resident')) item.resident = r.residentName || '-'
        if (cols.includes('furniture')) item.furniture = Array.isArray(r.furniture) ? r.furniture.join(', ') : r.furniture
        return item
      })
      exportToCsv('Custom_AAMS_Report', cols, rows)
    }
  }

  return (
    <>
      <TopBar
        searchPlaceholder="Search reports or residents..."
        rightContent={
          <div className="flex cursor-pointer items-center gap-3 group">
            <div className="text-right">
              <p className="font-label-md text-label-md text-on-surface">Admin User</p>
              <p className="text-[11px] text-on-surface-variant">System Administrator</p>
            </div>
            <img
              className="h-10 w-10 rounded-full border-2 border-primary-container object-cover"
              alt="Admin"
              src={IMAGES.reportsAdmin}
            />
          </div>
        }
        showCollegeLogo={false}
        showNotificationDot
      />

      <Page>
        <div className="mb-xl flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <span>Portal</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="font-bold text-primary">System Reports</span>
            </nav>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">System Reports</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Generate and analyze real-time data for the college accommodation system.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative inline-block w-64">
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 pr-10 text-body-md shadow-sm focus:border-primary focus:ring-primary focus:outline-none"
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
                {customReportConfig && (
                  <option value="custom">★ Custom Configured Report</option>
                )}
              </select>
              <Icon
                name="expand_more"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
            </div>
            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-on-primary shadow-sm hover:bg-primary-container transition-colors cursor-pointer"
            >
              <Icon name="add_chart" />
              Create Custom Report
            </button>
          </div>
        </div>

        {/* Dynamic Metric cards */}
        <div className="mb-xl grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10 text-primary">
              <Icon name="pie_chart" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant text-[11px]">Total Occupancy</h3>
            <p className="text-2xl font-bold text-on-surface">{kpis.occPct}%</p>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#16a34a]">
              <Icon name="trending_up" className="text-[14px]" /> Real-time active database
            </div>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container/20 text-secondary">
              <Icon name="meeting_room" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant text-[11px]">Vacant Units</h3>
            <p className="text-2xl font-bold text-on-surface">{kpis.vacantCount} Units</p>
            <div className="mt-2 text-[11px] font-semibold text-on-surface-variant">Available for allocation</div>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-error-container/20 text-error">
              <Icon name="pending_actions" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant text-[11px]">Pending Requests</h3>
            <p className="text-2xl font-bold text-on-surface">{kpis.pendingRequests} Requests</p>
            <div className="mt-2 text-[11px] font-semibold text-error">5 Critical priority</div>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container/10 text-tertiary">
              <Icon name="inventory_2" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant text-[11px]">Asset Value</h3>
            <p className="text-2xl font-bold text-on-surface">{kpis.assetValue}</p>
            <div className="mt-2 text-[11px] font-semibold text-on-surface-variant">Furniture &amp; Equipment</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12">
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              {/* Report Sub-header */}
              <div className="flex flex-col gap-md border-b border-outline-variant bg-surface-container-low/30 p-gutter md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">
                    {selected === 'custom'
                      ? `Custom Report (${customReportConfig?.target === 'residential' ? 'Residential' : 'Guest Rooms'})`
                      : REPORT_TYPES.find((r) => r.id === selected)?.name ?? 'Occupancy Report'}
                  </h4>
                  <p className="mt-1 text-label-sm uppercase tracking-widest text-on-surface-variant">
                    {timeframe === 'current' ? 'Showing Current Academic Year' : 'Showing Historical Data'}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg bg-surface-container p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTimeframe('current')
                        setCurrentPage(1)
                      }}
                      className={`rounded px-3.5 py-1 text-label-sm font-bold transition-all cursor-pointer ${
                        timeframe === 'current'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      Current
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTimeframe('historical')
                        setCurrentPage(1)
                      }}
                      className={`rounded px-3.5 py-1 text-label-sm font-bold transition-all cursor-pointer ${
                        timeframe === 'historical'
                          ? 'bg-white text-primary shadow-sm'
                          : 'text-secondary hover:text-on-surface'
                      }`}
                    >
                      Historical
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportReport}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant bg-white px-4 py-2 text-label-sm font-bold text-primary transition-all hover:bg-surface-container-low shadow-sm cursor-pointer"
                  >
                    <Icon name="download" className="text-[18px]" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-surface-container-low/75 backdrop-blur-xs">
                    <tr className="border-b border-outline-variant/65">
                      {selected === 'occupancy' && (
                        <>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">BUILDING</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">CAPACITY</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">OCCUPIED</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">VACANT</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">USAGE %</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">STATUS</th>
                        </>
                      )}
                      {selected === 'building' && (
                        <>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">BUILDING NAME</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">TOTAL FLOORS</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">MANAGER</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">MAINTENANCE STATUS</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">LAST INSPECTION</th>
                        </>
                      )}
                      {selected === 'pending' && (
                        <>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">REQUEST ID</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">USER</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">REQUEST TYPE</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">DATE FILED</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">PRIORITY</th>
                        </>
                      )}
                      {selected === 'furniture' && (
                        <>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">ITEM CATEGORY</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">TOTAL QTY</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">IN USE</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">IN STOCK</th>
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">CONDITION</th>
                        </>
                      )}
                      {selected === 'custom' && customReportConfig && (
                        <>
                          {customReportConfig.columns.includes('floor') && <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">FLOOR</th>}
                          {customReportConfig.columns.includes('roomNo') && <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">ROOM/FLAT</th>}
                          <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">BUILDING</th>
                          {customReportConfig.columns.includes('status') && <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">STATUS</th>}
                          {customReportConfig.columns.includes('resident') && <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">RESIDENT NAME</th>}
                          {customReportConfig.columns.includes('furniture') && <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">FURNITURE</th>}
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/40">
                    {paginatedRows.map((row, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-surface-container-low/30">
                        {selected === 'occupancy' && (
                          <>
                            <td className="px-gutter py-4 text-body-md text-on-surface font-medium">{row.building}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center">{row.capacity}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center font-bold text-[#16a34a]">{row.occupied}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center font-bold text-primary">{row.vacant}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center font-bold">{row.usage}</td>
                            <td className="px-gutter py-4">
                              <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-bold text-[#15803d] border border-[#bbf7d0]">
                                {row.status}
                              </span>
                            </td>
                          </>
                        )}
                        {selected === 'building' && (
                          <>
                            <td className="px-gutter py-4 text-body-md text-on-surface font-medium">{row.name}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface">{row.floors}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface">{row.manager}</td>
                            <td className={`px-gutter py-4 text-body-md font-bold ${row.status === 'Good' || row.status === 'Excellent' ? 'text-[#16a34a]' : 'text-error'}`}>
                              {row.status}
                            </td>
                            <td className="px-gutter py-4 text-body-md text-on-surface">{row.lastInspection}</td>
                          </>
                        )}
                        {selected === 'pending' && (
                          <>
                            <td className="px-gutter py-4 text-body-md font-bold text-primary">{row.id}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface">{row.user}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface">{row.type}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface">{row.date}</td>
                            <td className="px-gutter py-4">
                              <span className={`rounded px-2.5 py-0.5 text-[10px] font-bold border ${
                                row.priority === 'URGENT'
                                  ? 'bg-error-container/20 border-error/20 text-error'
                                  : 'bg-surface-container-high border-outline-variant text-secondary'
                              }`}>
                                {row.priority}
                              </span>
                            </td>
                          </>
                        )}
                        {selected === 'furniture' && (
                          <>
                            <td className="px-gutter py-4 text-body-md text-on-surface font-medium">{row.category}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center">{row.total}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center font-bold text-secondary">{row.inUse}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface text-center font-bold text-primary">{row.stock}</td>
                            <td className="px-gutter py-4 text-body-md text-on-surface font-medium text-[#16a34a]">{row.condition}</td>
                          </>
                        )}
                        {selected === 'custom' && customReportConfig && (
                          <>
                            {customReportConfig.columns.includes('floor') && <td className="px-gutter py-4 text-sm text-on-surface">Floor {row.floor}</td>}
                            {customReportConfig.columns.includes('roomNo') && <td className="px-gutter py-4 text-sm font-bold text-primary">{row.roomNo}</td>}
                            <td className="px-gutter py-4 text-sm text-on-surface font-medium">{row.name} ({row.type})</td>
                            {customReportConfig.columns.includes('status') && (
                              <td className="px-gutter py-4">
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold ${
                                  (row.occupancy || row.status) === 'Occupied'
                                    ? 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]'
                                    : 'bg-primary-container/10 text-primary border-primary/20'
                                }`}>
                                  {(row.occupancy || row.status)}
                                </span>
                              </td>
                            )}
                            {customReportConfig.columns.includes('resident') && <td className="px-gutter py-4 text-sm text-on-surface-variant font-medium">{row.residentName || '-'}</td>}
                            {customReportConfig.columns.includes('furniture') && (
                              <td className="px-gutter py-4 text-sm text-on-surface-variant">
                                {Array.isArray(row.furniture)
                                  ? (row.furniture.length > 0 ? row.furniture.join(', ') : 'NIL')
                                  : (row.furniture || 'NIL')}
                              </td>
                            )}
                          </>
                        )}
                      </tr>
                    ))}

                    {paginatedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-gutter py-12 text-center text-outline italic">
                          No report entries match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest p-gutter">
                <span className="text-label-sm text-on-surface-variant font-semibold">
                  Showing {paginatedRows.length} of {reportRows.length} rows
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="rounded border border-outline-variant px-3 py-1 transition-all hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Icon name="chevron_left" className="text-[18px]" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`rounded border px-3 py-1 font-bold transition-all cursor-pointer ${
                        currentPage === p
                          ? 'border-primary bg-primary text-white'
                          : 'border-outline-variant bg-white text-secondary hover:bg-surface-container'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded border border-outline-variant px-3 py-1 transition-all hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Download Button */}
        <button
          type="button"
          onClick={handleExportReport}
          className="group fixed bottom-gutter right-gutter z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Icon name="download" className="text-3xl" />
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded bg-inverse-surface px-3 py-1.5 text-body-md text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100 shadow-md">
            Download Current Report
          </span>
        </button>
      </Page>

      {/* Custom Report Configuration Modal */}
      <CustomReportModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onGenerate={handleGenerateCustom}
      />
    </>
  )
}
