import { useState, useMemo } from 'react'
import Icon from './Icon'
import { exportToCsv } from '../lib/export'

export default function SmartExportModal({
  isOpen,
  onClose,
  title = 'Configure Smart Export',
  defaultFileName = 'AAMS_Export',
  allData = [],
  filteredData = [],
  availableColumns = [],
}) {
  const [scope, setScope] = useState('all') // 'all' or 'filtered'
  const [selectedDept, setSelectedDept] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCols, setSelectedCols] = useState(() => {
    const initial = {}
    availableColumns.forEach((c) => {
      initial[c.key] = true
    })
    return initial
  })

  // Get active dataset based on scope
  const activeDataset = useMemo(() => {
    return scope === 'all' ? allData : filteredData
  }, [scope, allData, filteredData])

  // Get unique departments present in the dataset
  const uniqueDepts = useMemo(() => {
    const depts = new Set()
    activeDataset.forEach((item) => {
      // Check direct deptt/dept or guest bookings
      const deptVal = item.deptt || item.dept || item.department
      if (deptVal && deptVal !== '-') {
        depts.add(deptVal.trim())
      }
    })
    return ['All', ...Array.from(depts).sort()]
  }, [activeDataset])

  // Get unique status values present in the dataset
  const uniqueStatuses = useMemo(() => {
    const statuses = new Set()
    activeDataset.forEach((item) => {
      const statusVal = item.occupancy || item.status || item.bookingStatus
      if (statusVal) {
        statuses.add(statusVal.trim())
      }
    })
    return ['All', ...Array.from(statuses).sort()]
  }, [activeDataset])

  if (!isOpen) return null

  const handleCheckboxChange = (key) => {
    setSelectedCols((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleExport = () => {
    // 1. Filter the dataset based on selections
    let exportData = [...activeDataset]

    // Filter by department
    if (selectedDept !== 'All') {
      exportData = exportData.filter((item) => {
        const deptVal = item.deptt || item.dept || item.department
        return deptVal && deptVal.trim().toLowerCase() === selectedDept.toLowerCase()
      })
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      exportData = exportData.filter((item) => {
        const statusVal = item.occupancy || item.status || item.bookingStatus
        return statusVal && statusVal.trim().toLowerCase() === selectedStatus.toLowerCase()
      })
    }

    // 2. Select only the columns that are checked
    const colsToExport = availableColumns.filter((c) => selectedCols[c.key])
    if (colsToExport.length === 0) {
      alert('Please select at least one column to export.')
      return
    }

    const colKeys = colsToExport.map((c) => c.key)
    const rows = exportData.map((item) => {
      const rowObj = {}
      colsToExport.forEach((c) => {
        let val = item[c.key]
        if (Array.isArray(val)) {
          val = val.join(', ')
        }
        rowObj[c.key] = val !== undefined && val !== null ? val : ''
      })
      return rowObj
    })

    // 3. Export to CSV
    exportToCsv(
      `${defaultFileName}_SmartExport`,
      colKeys,
      rows
    )

    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col transition-all duration-300"
        style={{ width: '500px', maxWidth: '95vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon name="download" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              {title}
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

        {/* Content */}
        <div className="p-6 space-y-5 flex-grow overflow-y-auto max-h-[70vh]">
          {/* Scope Select */}
          <div className="space-y-1.5">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Export Scope</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setScope('all')
                  setSelectedDept('All')
                  setSelectedStatus('All')
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-bold transition-all cursor-pointer ${
                  scope === 'all'
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant hover:bg-surface-container text-secondary'
                }`}
              >
                <Icon name="dns" className="text-sm" />
                All ({allData.length} records)
              </button>
              <button
                type="button"
                onClick={() => {
                  setScope('filtered')
                  setSelectedDept('All')
                  setSelectedStatus('All')
                }}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-bold transition-all cursor-pointer ${
                  scope === 'filtered'
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant hover:bg-surface-container text-secondary'
                }`}
              >
                <Icon name="filter_alt" className="text-sm" />
                Filtered ({filteredData.length} records)
              </button>
            </div>
          </div>

          {/* Smart Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-3">
            {/* Department Filter */}
            {uniqueDepts.length > 2 && (
              <div className="space-y-1">
                <label htmlFor="export-dept" className="text-label-sm uppercase tracking-wider text-secondary">
                  Filter by Department
                </label>
                <select
                  id="export-dept"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:outline-none"
                >
                  {uniqueDepts.map((d) => (
                    <option key={d} value={d}>
                      {d === 'All' ? 'All Departments' : d}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="space-y-1">
              <label htmlFor="export-status" className="text-label-sm uppercase tracking-wider text-secondary">
                Filter by Status
              </label>
              <select
                id="export-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:outline-none"
              >
                {uniqueStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'All' ? 'All Statuses' : s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Column Checklist */}
          <div className="space-y-2 border-t border-outline-variant/30 pt-3">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Select Columns to Export</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-bright p-3 rounded-lg border border-outline-variant/30">
              {availableColumns.map((c) => (
                <label
                  key={c.key}
                  className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={!!selectedCols[c.key]}
                    onChange={() => handleCheckboxChange(c.key)}
                    className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-outline-variant bg-surface-container">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-5 py-2.5 text-label-md font-bold text-secondary bg-white hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-colors cursor-pointer"
          >
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  )
}
