import { useState } from 'react'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import { useAams } from '../../lib/useAams'

export default function Settings() {
  const { settings, lastSync, updateSystemSettings, refresh } = useAams()

  // Local state for tabs
  const [activeTab, setActiveTab] = useState('general')

  // Form states initialized from central settings
  const [institutionName, setInstitutionName] = useState(settings.institutionName || 'AAMS National College')
  const [academicYear, setAcademicYear] = useState(settings.academicYear || '2026-2027')
  const [contactEmail, setContactEmail] = useState(settings.contactEmail || 'admin@aamsportal.edu')
  const [maintenancePhone, setMaintenancePhone] = useState(settings.maintenancePhone || '+1 (555) 019-2834')
  const [theme, setTheme] = useState(settings.theme || 'light')
  const [syncInterval, setSyncInterval] = useState(settings.syncInterval || '5')
  const [autoSync, setAutoSync] = useState(settings.autoSync !== false)

  // Success toast indicator
  const [toastMessage, setToastMessage] = useState('')

  // Mock staff roster
  const [staffList, setStaffList] = useState([
    { id: 1, name: 'Admin User', email: 'admin@aamsportal.edu', role: 'Super Administrator', status: 'Active' },
    { id: 2, name: 'Sarah Jenkins', email: 's.jenkins@aamsportal.edu', role: 'Accommodation Manager', status: 'Active' },
    { id: 3, name: 'Rajesh Kumar', email: 'r.kumar@aamsportal.edu', role: 'Guest House Supervisor', status: 'Active' },
    { id: 4, name: 'Michael Chang', email: 'm.chang@aamsportal.edu', role: 'Maintenance Coordinator', status: 'On Leave' },
  ])
  
  const [newStaffName, setNewStaffName] = useState('')
  const [newStaffEmail, setNewStaffEmail] = useState('')
  const [newStaffRole, setNewStaffRole] = useState('Guest House Supervisor')
  const [addStaffOpen, setAddStaffOpen] = useState(false)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 3000)
  }

  // Handle Save Settings
  const handleSaveGeneral = (e) => {
    e.preventDefault()
    updateSystemSettings({
      institutionName,
      academicYear,
      contactEmail,
      maintenancePhone,
      theme,
      syncInterval,
      autoSync,
    })
    showToast('General settings saved successfully!')
  }

  // Add staff
  const handleAddStaff = (e) => {
    e.preventDefault()
    if (!newStaffName.trim() || !newStaffEmail.trim()) return

    const newStaff = {
      id: Date.now(),
      name: newStaffName.trim(),
      email: newStaffEmail.trim(),
      role: newStaffRole,
      status: 'Active',
    }

    setStaffList([...staffList, newStaff])
    setNewStaffName('')
    setNewStaffEmail('')
    setAddStaffOpen(false)
    showToast('New staff member registered!')
  }

  // Reset database back to default
  const handleResetDatabase = () => {
    if (confirm('Are you sure you want to reset the database? All custom occupancy changes, added guest rooms, and audit logs will be permanently deleted.')) {
      localStorage.removeItem('aams_initialized')
      localStorage.removeItem('aams_residential_NT1')
      localStorage.removeItem('aams_residential_NT2')
      localStorage.removeItem('aams_guest_rooms')
      localStorage.removeItem('aams_audit_log')
      localStorage.removeItem('aams_settings')
      
      // Reinitialize
      refresh()
      
      // Reload states locally
      showToast('Database reset successfully!')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  }

  const triggerManualSync = () => {
    refresh()
    showToast('Database sync completed successfully!')
  }

  return (
    <>
      <TopBar searchPlaceholder="Search settings..." />
      <Page>
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-lg border-b border-outline-variant pb-md">
            <h2 className="font-headline-md text-headline-md text-on-surface">System Settings</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Manage institution profiles, user roles, database synchronization, and themes.
            </p>
          </div>

          {/* Success Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-inverse-surface px-5 py-3 text-body-md text-inverse-on-surface shadow-xl animate-bounce">
              <Icon name="check_circle" className="text-[#22c55e]" />
              {toastMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
            {/* Sidebar Tabs */}
            <div className="md:col-span-1 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 border-b md:border-b-0 border-outline-variant md:border-r md:pr-4">
              <button
                type="button"
                onClick={() => setActiveTab('general')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-md font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'general'
                    ? 'bg-primary-container/10 text-primary'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name="tune" />
                General Configuration
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-md font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'staff'
                    ? 'bg-primary-container/10 text-primary'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name="badge" />
                Staff Access Control
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sync')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-label-md font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'sync'
                    ? 'bg-primary-container/10 text-primary'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name="database" />
                Database &amp; Sync
              </button>
            </div>

            {/* Tab Contents */}
            <div className="md:col-span-3">
              {/* GENERAL SETTINGS */}
              {activeTab === 'general' && (
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-xs">
                  <h3 className="text-headline-sm font-headline-sm text-on-surface mb-6 flex items-center gap-2">
                    <Icon name="tune" className="text-primary" />
                    General Configuration
                  </h3>
                  <form onSubmit={handleSaveGeneral} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="instName" className="text-label-sm uppercase tracking-wider text-secondary">
                          Institution Name
                        </label>
                        <input
                          type="text"
                          id="instName"
                          required
                          value={institutionName}
                          onChange={(e) => setInstitutionName(e.target.value)}
                          className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="acadYear" className="text-label-sm uppercase tracking-wider text-secondary">
                          Academic Session
                        </label>
                        <input
                          type="text"
                          id="acadYear"
                          required
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                          className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="email" className="text-label-sm uppercase tracking-wider text-secondary">
                          Support Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label htmlFor="phone" className="text-label-sm uppercase tracking-wider text-secondary">
                          Maintenance Hotline
                        </label>
                        <input
                          type="text"
                          id="phone"
                          required
                          value={maintenancePhone}
                          onChange={(e) => setMaintenancePhone(e.target.value)}
                          className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 pt-2 border-t border-outline-variant/30">
                      <label className="text-label-sm uppercase tracking-wider text-secondary">
                        Color Theme
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-body-md text-on-surface">
                          <input
                            type="radio"
                            name="theme"
                            checked={theme === 'light'}
                            onChange={() => setTheme('light')}
                            className="text-primary focus:ring-primary"
                          />
                          Light theme (Default)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer font-bold text-body-md text-on-surface">
                          <input
                            type="radio"
                            name="theme"
                            checked={theme === 'dark'}
                            onChange={() => setTheme('dark')}
                            className="text-primary focus:ring-primary"
                          />
                          Dark theme (System Controlled)
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-outline-variant">
                      <button
                        type="submit"
                        className="rounded-lg bg-primary px-6 py-2.5 font-bold text-on-primary shadow-md hover:bg-primary-container transition-colors cursor-pointer"
                      >
                        Save Configurations
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ACCESS CONTROL */}
              {activeTab === 'staff' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-xs">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-headline-sm font-headline-sm text-on-surface flex items-center gap-2">
                        <Icon name="badge" className="text-primary" />
                        Staff Access Control
                      </h3>
                      <button
                        type="button"
                        onClick={() => setAddStaffOpen(true)}
                        className="flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-container transition-all cursor-pointer"
                      >
                        <Icon name="person_add" className="text-sm" /> Add Roster
                      </button>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-outline-variant">
                      <table className="w-full border-collapse text-left text-xs font-bold">
                        <thead>
                          <tr className="bg-surface-container-low border-b border-outline-variant text-secondary">
                            <th className="px-4 py-3">NAME</th>
                            <th className="px-4 py-3">EMAIL</th>
                            <th className="px-4 py-3">ROLE</th>
                            <th className="px-4 py-3">STATUS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/40 text-on-surface font-medium">
                          {staffList.map((staff) => (
                            <tr key={staff.id} className="hover:bg-surface-container-low/20">
                              <td className="px-4 py-3 font-semibold">{staff.name}</td>
                              <td className="px-4 py-3 text-secondary">{staff.email}</td>
                              <td className="px-4 py-3">{staff.role}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                                  staff.status === 'Active'
                                    ? 'bg-[#f0fdf4] text-[#166534]'
                                    : 'bg-surface-container text-secondary'
                                }`}>
                                  {staff.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add staff modal */}
                  {addStaffOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-xs">
                      <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl" style={{ width: '380px', maxWidth: '95vw' }}>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface mb-4">Register Staff</h4>
                        <form onSubmit={handleAddStaff} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs text-secondary font-bold">Full Name</label>
                            <input
                              type="text"
                              required
                              value={newStaffName}
                              onChange={(e) => setNewStaffName(e.target.value)}
                              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-secondary font-bold">Email Address</label>
                            <input
                              type="email"
                              required
                              value={newStaffEmail}
                              onChange={(e) => setNewStaffEmail(e.target.value)}
                              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-secondary font-bold">System Role</label>
                            <select
                              value={newStaffRole}
                              onChange={(e) => setNewStaffRole(e.target.value)}
                              className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                            >
                              <option value="Guest House Supervisor">Guest House Supervisor</option>
                              <option value="Accommodation Manager">Accommodation Manager</option>
                              <option value="Maintenance Coordinator">Maintenance Coordinator</option>
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setAddStaffOpen(false)}
                              className="rounded border border-outline-variant px-3 py-1.5 text-xs font-bold text-secondary bg-white hover:bg-surface-container"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="rounded bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-container"
                            >
                              Add Staff
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DATABASE & SYNC */}
              {activeTab === 'sync' && (
                <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-xs space-y-6">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface mb-2 flex items-center gap-2">
                      <Icon name="database" className="text-primary" />
                      Database &amp; Synchronization
                    </h3>
                    <p className="text-body-md text-on-surface-variant">
                      Configure background database synchronization interval or reset all tables.
                    </p>
                  </div>

                  <div className="rounded-lg bg-surface-container-low border border-outline-variant/30 p-4 space-y-4">
                    <div className="flex justify-between items-center text-body-md text-on-surface">
                      <span>Database Engine:</span>
                      <span className="font-bold text-primary">Web LocalStorage (Persistent)</span>
                    </div>
                    <div className="flex justify-between items-center text-body-md text-on-surface">
                      <span>Last Synced:</span>
                      <span className="font-bold text-[#166534]">{lastSync.toLocaleTimeString()} ({lastSync.toLocaleDateString()})</span>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                    <h4 className="font-bold text-body-md text-on-surface">Synchronization Settings</h4>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="autoSync"
                        checked={autoSync}
                        onChange={(e) => setAutoSync(e.target.checked)}
                        className="rounded text-primary focus:ring-primary h-4 w-4"
                      />
                      <label htmlFor="autoSync" className="text-body-md text-on-surface cursor-pointer select-none">
                        Enable Automatic Background Synchronization
                      </label>
                    </div>

                    {autoSync && (
                      <div className="space-y-1 max-w-xs">
                        <label htmlFor="syncInt" className="text-xs text-secondary font-bold uppercase">Sync Frequency</label>
                        <select
                          id="syncInt"
                          value={syncInterval}
                          onChange={(e) => setSyncInterval(e.target.value)}
                          className="w-full rounded border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                        >
                          <option value="1">Every 1 Minute</option>
                          <option value="5">Every 5 Minutes (Default)</option>
                          <option value="15">Every 15 Minutes</option>
                          <option value="30">Every 30 Minutes</option>
                          <option value="60">Every 1 Hour</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 pt-6 border-t border-outline-variant">
                    <button
                      type="button"
                      onClick={triggerManualSync}
                      className="flex items-center gap-1.5 rounded-lg border border-primary px-5 py-2.5 font-bold text-primary bg-white hover:bg-surface-container-low transition-colors cursor-pointer shadow-xs"
                    >
                      <Icon name="sync" />
                      Sync Database Now
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDatabase}
                      className="flex items-center gap-1.5 rounded-lg bg-error px-5 py-2.5 font-bold text-on-primary hover:bg-error/90 transition-colors cursor-pointer shadow-md"
                    >
                      <Icon name="delete_forever" />
                      Wipe &amp; Reset Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Page>
    </>
  )
}
