import { generateUnits } from './units'

const DEFAULT_SETTINGS = {
  institutionName: 'AAMS National College',
  academicYear: '2026-2027',
  contactEmail: 'admin@aamsportal.edu',
  maintenancePhone: '+1 (555) 019-2834',
  theme: 'light',
  syncInterval: '5',
  autoSync: true,
}

const DEFAULT_GUEST_ROOMS = {
  NT1: [
    { floor: 'Ground Floor', roomNo: 'G-01', furniture: ['King Bed', 'Study Table', 'Armchair', 'Wardrobe'], status: 'Occupied', maintenance: 'none' },
    { floor: 'Ground Floor', roomNo: 'G-02', furniture: ['King Bed', 'Mini Fridge'], status: 'Occupied', maintenance: 'none' },
    { floor: '1st Floor', roomNo: '101', furniture: [], status: 'Vacant', maintenance: 'none' },
    { floor: '1st Floor', roomNo: '102', furniture: ['Queen Bed (x2)', 'Coffee Table'], status: 'Occupied', maintenance: 'none' },
    { floor: '2nd Floor', roomNo: '201', furniture: ['Single Bed', 'Dressing Mirror'], status: 'Occupied', maintenance: 'none' },
    { floor: '2nd Floor', roomNo: '202', furniture: [], status: 'Vacant', maintenance: 'none' },
    { floor: '3rd Floor', roomNo: '301', furniture: ['King Bed', 'AC', 'Mini Fridge'], status: 'Occupied', maintenance: 'none' },
    { floor: '3rd Floor', roomNo: '302', furniture: ['Twin Beds'], status: 'Vacant', maintenance: 'none' },
    { floor: '3rd Floor', roomNo: '303', furniture: [], status: 'Vacant', maintenance: 'none' },
    { floor: '4th Floor', roomNo: '401', furniture: ['King Bed', 'Sofa Set'], status: 'Occupied', maintenance: 'none' },
    { floor: '4th Floor', roomNo: '402', furniture: [], status: 'Vacant', maintenance: 'none' },
  ],
  NT2: [
    { floor: '1st Floor', roomNo: 'N2-101', furniture: ['Sofa Set', 'Executive Desk'], status: 'Occupied', maintenance: 'none' },
    { floor: '1st Floor', roomNo: 'N2-102', furniture: ['Twin Beds', 'Mini Fridge'], status: 'Occupied', maintenance: 'none' },
    { floor: '2nd Floor', roomNo: 'N2-201', furniture: ['King Bed', 'Armchair'], status: 'Vacant', maintenance: 'none' },
    { floor: '2nd Floor', roomNo: 'N2-202', furniture: [], status: 'Vacant', maintenance: 'none' },
    { floor: '2nd Floor', roomNo: 'N2-205', furniture: ['Twin Beds'], status: 'Occupied', maintenance: 'none' },
    { floor: '3rd Floor', roomNo: 'N2-301', furniture: ['King Bed', 'AC'], status: 'Occupied', maintenance: 'none' },
    { floor: '3rd Floor', roomNo: 'N2-302', furniture: [], status: 'Vacant', maintenance: 'none' },
    { floor: '3rd Floor', roomNo: 'N2-Penthouse', furniture: [], status: 'Vacant', maintenance: 'pending' },
  ],
}

const DEFAULT_AUDIT_LOG = [
  { id: 1, action: 'Resident Added', details: 'Dr. Sharma to Flat NT1-1702', timestamp: '2 mins ago', type: 'add' },
  { id: 2, action: 'Resident Removed', details: 'Rajesh Kumar from NT2-504', timestamp: '1 hour ago', type: 'remove' },
  { id: 3, action: 'Flat Vacated', details: 'NT1-302', timestamp: '3 hours ago', type: 'vacate' },
  { id: 4, action: 'Furniture Updated', details: 'NT2-1001 furniture inventory modified', timestamp: 'Yesterday', type: 'edit' },
  { id: 5, action: 'Settings Updated', details: 'Academic year rolled over to 2026-2027', timestamp: '2 days ago', type: 'settings' },
]

// Initialize store if empty
export function initStore() {
  if (!localStorage.getItem('aams_initialized')) {
    const nt1Units = generateUnits({ buildingCode: 'NT1', seed: 42 })
    const nt2Units = generateUnits({ buildingCode: 'NT2', seed: 42 })
    
    localStorage.setItem('aams_residential_NT1', JSON.stringify(nt1Units))
    localStorage.setItem('aams_residential_NT2', JSON.stringify(nt2Units))
    localStorage.setItem('aams_guest_rooms', JSON.stringify(DEFAULT_GUEST_ROOMS))
    localStorage.setItem('aams_audit_log', JSON.stringify(DEFAULT_AUDIT_LOG))
    localStorage.setItem('aams_settings', JSON.stringify(DEFAULT_SETTINGS))
    localStorage.setItem('aams_initialized', 'true')
  }
}

// Helper to get item
function getJson(key, def) {
  initStore()
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : def
}

// Helper to set item
function setJson(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// API for residential
export function getResidentialUnits(buildingCode = 'NT1') {
  const code = buildingCode.toUpperCase()
  return getJson(`aams_residential_${code}`, [])
}

export function updateResidentialUnit(buildingCode, roomNo, updatedFields) {
  const code = buildingCode.toUpperCase()
  const units = getResidentialUnits(code)
  
  let oldUnit = null
  const updatedUnits = units.map((u) => {
    if (u.roomNo === roomNo) {
      oldUnit = { ...u }
      return { ...u, ...updatedFields }
    }
    return u
  })
  
  if (oldUnit) {
    setJson(`aams_residential_${code}`, updatedUnits)
    
    // Log audit
    let action = 'Flat Updated'
    let details = `Flat ${code}-${roomNo} details updated`
    let type = 'edit'
    
    if (updatedFields.occupancy && updatedFields.occupancy !== oldUnit.occupancy) {
      if (updatedFields.occupancy === 'Occupied') {
        action = 'Resident Added'
        details = `${updatedFields.residentName || 'New Resident'} to Flat ${code}-${roomNo}`
        type = 'add'
      } else {
        action = 'Resident Removed'
        details = `${oldUnit.residentName} removed from ${code}-${roomNo}`
        type = 'remove'
      }
    } else if (updatedFields.furniture && updatedFields.furniture !== oldUnit.furniture) {
      action = 'Furniture Updated'
      details = `Flat ${code}-${roomNo} furniture modified`
      type = 'edit'
    }
    
    addAuditLogEntry(action, details, type)
  }
  
  return updatedUnits
}

// API for guest houses
export function getGuestHouseRooms(houseCode = 'NT1') {
  const code = houseCode.toUpperCase()
  const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  return allRooms[code] || []
}

export function updateGuestHouseRoom(houseCode, roomNo, updatedFields) {
  const code = houseCode.toUpperCase()
  const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  const rooms = allRooms[code] || []
  
  let oldRoom = null
  const updatedRooms = rooms.map((r) => {
    if (r.roomNo === roomNo) {
      oldRoom = { ...r }
      return { ...r, ...updatedFields }
    }
    return r
  })
  
  allRooms[code] = updatedRooms
  setJson('aams_guest_rooms', allRooms)
  
  if (oldRoom) {
    let action = 'Guest Room Updated'
    let details = `Guest Room ${code}-${roomNo} modified`
    let type = 'edit'
    
    if (updatedFields.status && updatedFields.status !== oldRoom.status) {
      if (updatedFields.status === 'Occupied') {
        action = 'Guest Room Booked'
        details = `Guest Room ${code}-${roomNo} marked as Booked`
        type = 'add'
      } else {
        action = 'Guest Room Vacated'
        details = `Guest Room ${code}-${roomNo} is now Vacant`
        type = 'vacate'
      }
    } else if (updatedFields.maintenance && updatedFields.maintenance !== oldRoom.maintenance) {
      if (updatedFields.maintenance === 'pending') {
        action = 'Maintenance Logged'
        details = `Guest Room ${code}-${roomNo} requires maintenance`
        type = 'remove'
      } else {
        action = 'Maintenance Resolved'
        details = `Guest Room ${code}-${roomNo} maintenance issues fixed`
        type = 'success'
      }
    }
    
    addAuditLogEntry(action, details, type)
  }
  
  return updatedRooms
}

export function addGuestHouseRoom(houseCode, newRoom) {
  const code = houseCode.toUpperCase()
  const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  const rooms = allRooms[code] || []
  
  const roomExists = rooms.some(r => r.roomNo === newRoom.roomNo)
  if (roomExists) return { error: 'Room number already exists' }
  
  const roomToAdd = {
    floor: newRoom.floor || 'Ground Floor',
    roomNo: newRoom.roomNo,
    furniture: newRoom.furniture || [],
    status: newRoom.status || 'Vacant',
    maintenance: newRoom.maintenance || 'none'
  }
  
  rooms.push(roomToAdd)
  allRooms[code] = rooms
  setJson('aams_guest_rooms', allRooms)
  
  addAuditLogEntry('Guest Room Added', `Added Room ${roomToAdd.roomNo} to ${code} Guest House`, 'add')
  return rooms
}

// API for audit logs
export function getAuditLog() {
  return getJson('aams_audit_log', DEFAULT_AUDIT_LOG)
}

export function addAuditLogEntry(action, details, type = 'info') {
  const logs = getAuditLog()
  const newLog = {
    id: Date.now(),
    action,
    details,
    timestamp: 'Just now',
    type
  }
  logs.unshift(newLog)
  // Keep only last 50 logs
  setJson('aams_audit_log', logs.slice(0, 50))
  return logs
}

export function clearAuditLog() {
  setJson('aams_audit_log', [])
  return []
}

// API for settings
export function getSettings() {
  return getJson('aams_settings', DEFAULT_SETTINGS)
}

export function updateSettings(newSettings) {
  const settings = getSettings()
  const updated = { ...settings, ...newSettings }
  setJson('aams_settings', updated)
  
  addAuditLogEntry('Settings Updated', 'General system configuration modified', 'settings')
  return updated
}
