import { useState } from 'react'
import Icon from './Icon'

export default function CustomReportModal({ isOpen, onClose, onGenerate, departments = [] }) {
  const [target, setTarget] = useState('residential') // residential or guest
  const [building, setBuilding] = useState('All') // All, NT1, NT2
  const [status, setStatus] = useState('All') // All, Occupied, Vacant
  const [selectedDept, setSelectedDept] = useState('All')
  const [furnitureFilter, setFurnitureFilter] = useState('All') // All, NIL, HasAC, HasBed
  const [columns, setColumns] = useState({
    floor: true,
    roomNo: true,
    resident: true,
    deptt: true,
    status: true,
    furniture: true,
  })

  if (!isOpen) return null

  const handleCheckboxChange = (col) => {
    setColumns((prev) => ({
      ...prev,
      [col]: !prev[col],
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Ensure at least one column is selected
    const selectedCols = Object.keys(columns).filter((k) => columns[k])
    if (selectedCols.length === 0) {
      alert('Please select at least one column to display.')
      return
    }

    onGenerate({
      target,
      building,
      status,
      selectedDept,
      furnitureFilter,
      columns: selectedCols,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col" style={{ width: '500px', maxWidth: '95vw' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon name="add_chart" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Configure Custom Report
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-grow overflow-y-auto">
          {/* Target */}
          <div className="space-y-1.5">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Data Source</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTarget('residential')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-bold transition-all ${
                  target === 'residential'
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant hover:bg-surface-container text-secondary'
                }`}
              >
                <Icon name="apartment" className="text-sm" />
                Residential Flats
              </button>
              <button
                type="button"
                onClick={() => setTarget('guest')}
                className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-bold transition-all ${
                  target === 'guest'
                    ? 'border-primary bg-primary-container/10 text-primary'
                    : 'border-outline-variant hover:bg-surface-container text-secondary'
                }`}
              >
                <Icon name="hotel" className="text-sm" />
                Guest Rooms
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="building" className="text-label-sm uppercase tracking-wider text-secondary">Building</label>
              <select
                id="building"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:outline-none"
              >
                <option value="All">All Towers</option>
                <option value="NT1">NT1 Building</option>
                <option value="NT2">NT2 Building</option>
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="status" className="text-label-sm uppercase tracking-wider text-secondary">Occupancy Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="selectedDept" className="text-label-sm uppercase tracking-wider text-secondary">Department Filter</label>
              <select
                id="selectedDept"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:outline-none"
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="furnitureFilter" className="text-label-sm uppercase tracking-wider text-secondary">Furniture Filter</label>
              <select
                id="furnitureFilter"
                value={furnitureFilter}
                onChange={(e) => setFurnitureFilter(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:outline-none"
              >
                <option value="All">All (No furniture filter)</option>
                <option value="NIL">No Furniture Assigned (NIL)</option>
                <option value="HasAC">Contains AC</option>
                <option value="HasBed">Contains Bed (King/Queen/Twin/Single)</option>
              </select>
            </div>
          </div>

          {/* Columns Selector */}
          <div className="space-y-2 border-t border-outline-variant/30 pt-3">
            <label className="text-label-sm uppercase tracking-wider text-secondary">Display Columns</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-surface-bright p-3 rounded-lg border border-outline-variant/30">
              <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={columns.floor}
                  onChange={() => handleCheckboxChange('floor')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Floor No.
              </label>
              <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={columns.roomNo}
                  onChange={() => handleCheckboxChange('roomNo')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Room/Flat No.
              </label>
              <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={columns.resident}
                  onChange={() => handleCheckboxChange('resident')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Resident Name
              </label>
              <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={columns.deptt}
                  onChange={() => handleCheckboxChange('deptt')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Department
              </label>
              <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={columns.status}
                  onChange={() => handleCheckboxChange('status')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Status
              </label>
              <label className="flex items-center gap-2 text-body-md text-on-surface cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={columns.furniture}
                  onChange={() => handleCheckboxChange('furniture')}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Furniture
              </label>
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
              Generate Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
