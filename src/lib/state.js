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
    { floor: 'Ground Floor', roomNo: 'G-01', furniture: ['King Bed', 'Study Table', 'Armchair', 'Wardrobe'], status: 'Occupied', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: 'Ground Floor', roomNo: 'G-02', furniture: ['King Bed', 'Mini Fridge'], status: 'Occupied', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '1st Floor', roomNo: '101', furniture: [], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '1st Floor', roomNo: '102', furniture: ['Queen Bed (x2)', 'Coffee Table'], status: 'Reserved', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '2nd Floor', roomNo: '201', furniture: ['Single Bed', 'Dressing Mirror'], status: 'Available', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '2nd Floor', roomNo: '202', furniture: [], status: 'Under Cleaning', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '3rd Floor', roomNo: '301', furniture: ['King Bed', 'AC', 'Mini Fridge'], status: 'Available', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '3rd Floor', roomNo: '302', furniture: ['Twin Beds'], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '3rd Floor', roomNo: '303', furniture: [], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '4th Floor', roomNo: '401', furniture: ['King Bed', 'Sofa Set'], status: 'Available', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '4th Floor', roomNo: '402', furniture: [], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
  ],
  NT2: [
    { floor: '1st Floor', roomNo: 'N2-101', furniture: ['Sofa Set', 'Executive Desk'], status: 'Occupied', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '1st Floor', roomNo: 'N2-102', furniture: ['Twin Beds', 'Mini Fridge'], status: 'Occupied', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '2nd Floor', roomNo: 'N2-201', furniture: ['King Bed', 'Armchair'], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '2nd Floor', roomNo: 'N2-202', furniture: [], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '2nd Floor', roomNo: 'N2-205', furniture: ['Twin Beds'], status: 'Available', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '3rd Floor', roomNo: 'N2-301', furniture: ['King Bed', 'AC'], status: 'Available', maintenance: 'none', checkInStatus: 'Completed', checkOutStatus: 'Pending' },
    { floor: '3rd Floor', roomNo: 'N2-302', furniture: [], status: 'Available', maintenance: 'none', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
    { floor: '3rd Floor', roomNo: 'N2-Penthouse', furniture: [], status: 'Maintenance', maintenance: 'pending', checkInStatus: 'Pending', checkOutStatus: 'Pending' },
  ],
}

const DEFAULT_GUEST_BOOKINGS = [
  {
    id: 'B-001',
    guestName: 'Dr. Amit Sharma',
    roomNo: 'G-01',
    bookingDate: '2026-06-28',
    expectedCheckInDate: '2026-07-01',
    expectedCheckOutDate: '2026-07-04',
    actualCheckInDateTime: '2026-07-01T14:00:00',
    actualCheckOutDateTime: null,
    bookingStatus: 'Occupied',
    guestStatus: 'Checked In',
    houseCode: 'NT1'
  },
  {
    id: 'B-002',
    guestName: 'Prof. John Harrison',
    roomNo: 'G-02',
    bookingDate: '2026-06-25',
    expectedCheckInDate: '2026-06-29',
    expectedCheckOutDate: '2026-07-01', // Overstaying guest (expected checkout yesterday)
    actualCheckInDateTime: '2026-06-29T11:30:00',
    actualCheckOutDateTime: null,
    bookingStatus: 'Occupied',
    guestStatus: 'Checked In',
    houseCode: 'NT1'
  },
  {
    id: 'B-003',
    guestName: 'Dr. Sunita Patel',
    roomNo: '102',
    bookingDate: '2026-06-30',
    expectedCheckInDate: '2026-07-02', // Checking in today
    expectedCheckOutDate: '2026-07-05',
    actualCheckInDateTime: null,
    actualCheckOutDateTime: null,
    bookingStatus: 'Reserved',
    guestStatus: 'Not Checked In',
    houseCode: 'NT1'
  },
  {
    id: 'B-004',
    guestName: 'Dr. Raj Singh',
    roomNo: '202',
    bookingDate: '2026-06-25',
    expectedCheckInDate: '2026-06-28',
    expectedCheckOutDate: '2026-07-01',
    actualCheckInDateTime: '2026-06-28T15:00:00',
    actualCheckOutDateTime: '2026-07-01T10:00:00',
    bookingStatus: 'Checked Out',
    guestStatus: 'Checked Out',
    houseCode: 'NT1'
  },
  {
    id: 'B-005',
    guestName: 'Alice Green',
    roomNo: 'N2-101',
    bookingDate: '2026-07-01',
    expectedCheckInDate: '2026-07-01',
    expectedCheckOutDate: '2026-07-03',
    actualCheckInDateTime: '2026-07-01T15:00:00',
    actualCheckOutDateTime: null,
    bookingStatus: 'Occupied',
    guestStatus: 'Checked In',
    houseCode: 'NT2'
  },
  {
    id: 'B-006',
    guestName: 'Bob White',
    roomNo: 'N2-102',
    bookingDate: '2026-07-01',
    expectedCheckInDate: '2026-07-01',
    expectedCheckOutDate: '2026-07-02', // Checking out today
    actualCheckInDateTime: '2026-07-01T16:00:00',
    actualCheckOutDateTime: null,
    bookingStatus: 'Occupied',
    guestStatus: 'Checked In',
    houseCode: 'NT2'
  }
]

const DEFAULT_FURNITURE_LIBRARY = [
  'King Bed',
  'Queen Bed',
  'Twin Beds',
  'Single Bed',
  'Bed',
  'Mattress',
  'Chair',
  'Study Table',
  'Wardrobe',
  'Fan',
  'Cooler',
  'AC',
  'Mini Fridge',
  'Sofa Set',
  'Armchair',
  'Coffee Table',
  'Dressing Mirror',
]

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
    localStorage.setItem('aams_furniture_library', JSON.stringify(DEFAULT_FURNITURE_LIBRARY))
    localStorage.setItem('aams_guest_bookings', JSON.stringify(DEFAULT_GUEST_BOOKINGS))
    localStorage.setItem('aams_initialized', 'true')
  } else {
    if (!localStorage.getItem('aams_furniture_library')) {
      localStorage.setItem('aams_furniture_library', JSON.stringify(DEFAULT_FURNITURE_LIBRARY))
    }
    if (!localStorage.getItem('aams_guest_bookings')) {
      localStorage.setItem('aams_guest_bookings', JSON.stringify(DEFAULT_GUEST_BOOKINGS))
    }
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
      const newFields = { ...updatedFields }
      if (newFields.maintenance === 'pending') {
        newFields.status = 'Maintenance'
      } else if (newFields.maintenance === 'none' && r.status === 'Maintenance') {
        newFields.status = 'Available'
      }
      return { ...r, ...newFields }
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
    maintenance: newRoom.maintenance || 'none',
    checkInStatus: newRoom.checkInStatus || 'Pending',
    checkOutStatus: newRoom.checkOutStatus || 'Pending',
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

// API for furniture library
export function getFurnitureLibrary() {
  return getJson('aams_furniture_library', DEFAULT_FURNITURE_LIBRARY)
}

export function addFurnitureToLibrary(item) {
  const library = getFurnitureLibrary()
  const trimmed = item.trim()
  if (!trimmed) return library
  if (library.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
    return library
  }
  library.push(trimmed)
  setJson('aams_furniture_library', library)
  addAuditLogEntry('Furniture Added', `Added "${trimmed}" to the furniture library`, 'add')
  return library
}

export function deleteFurnitureFromLibrary(item) {
  const library = getFurnitureLibrary()
  const updatedLibrary = library.filter((f) => f !== item)
  setJson('aams_furniture_library', updatedLibrary)

  // 1. Clean guest rooms
  const allGuestRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  let guestUpdated = false
  Object.keys(allGuestRooms).forEach((key) => {
    allGuestRooms[key] = allGuestRooms[key].map((room) => {
      if (room.furniture && room.furniture.includes(item)) {
        guestUpdated = true
        return {
          ...room,
          furniture: room.furniture.filter((f) => f !== item),
        }
      }
      return room
    })
  })
  if (guestUpdated) {
    setJson('aams_guest_rooms', allGuestRooms)
  }

  // 2. Clean residential units
  const nt1Units = getResidentialUnits('NT1')
  let nt1Updated = false
  const updatedNt1 = nt1Units.map((u) => {
    if (u.furniture && u.furniture !== 'NIL') {
      const items = u.furniture.split(',').map((f) => f.trim())
      if (items.includes(item)) {
        nt1Updated = true
        const remaining = items.filter((f) => f !== item)
        return {
          ...u,
          furniture: remaining.length > 0 ? remaining.join(', ') : 'NIL',
        }
      }
    }
    return u
  })
  if (nt1Updated) {
    setJson('aams_residential_NT1', updatedNt1)
  }

  const nt2Units = getResidentialUnits('NT2')
  let nt2Updated = false
  const updatedNt2 = nt2Units.map((u) => {
    if (u.furniture && u.furniture !== 'NIL') {
      const items = u.furniture.split(',').map((f) => f.trim())
      if (items.includes(item)) {
        nt2Updated = true
        const remaining = items.filter((f) => f !== item)
        return {
          ...u,
          furniture: remaining.length > 0 ? remaining.join(', ') : 'NIL',
        }
      }
    }
    return u
  })
  if (nt2Updated) {
    setJson('aams_residential_NT2', updatedNt2)
  }

  addAuditLogEntry('Furniture Deleted', `Deleted "${item}" from the furniture library`, 'remove')
  return updatedLibrary
}

export function renameFurnitureInLibrary(oldName, newName) {
  const trimmedOldName = oldName.trim()
  const trimmedNewName = newName.trim()
  if (!trimmedNewName || trimmedOldName === trimmedNewName) return getFurnitureLibrary()

  const library = getFurnitureLibrary()
  
  if (library.some((f) => f.toLowerCase() === trimmedNewName.toLowerCase() && f !== trimmedOldName)) {
    return library
  }

  const updatedLibrary = library.map((f) => (f === trimmedOldName ? trimmedNewName : f))
  setJson('aams_furniture_library', updatedLibrary)

  // 1. Rename in guest rooms
  const allGuestRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  let guestUpdated = false
  Object.keys(allGuestRooms).forEach((key) => {
    allGuestRooms[key] = allGuestRooms[key].map((room) => {
      if (room.furniture && room.furniture.includes(trimmedOldName)) {
        guestUpdated = true
        return {
          ...room,
          furniture: room.furniture.map((f) => (f === trimmedOldName ? trimmedNewName : f)),
        }
      }
      return room
    })
  })
  if (guestUpdated) {
    setJson('aams_guest_rooms', allGuestRooms)
  }

  // 2. Rename in residential units
  const nt1Units = getResidentialUnits('NT1')
  let nt1Updated = false
  const updatedNt1 = nt1Units.map((u) => {
    if (u.furniture && u.furniture !== 'NIL') {
      const items = u.furniture.split(',').map((f) => f.trim())
      if (items.includes(trimmedOldName)) {
        nt1Updated = true
        const renamed = items.map((f) => (f === trimmedOldName ? trimmedNewName : f))
        return {
          ...u,
          furniture: renamed.join(', '),
        }
      }
    }
    return u
  })
  if (nt1Updated) {
    setJson('aams_residential_NT1', updatedNt1)
  }

  const nt2Units = getResidentialUnits('NT2')
  let nt2Updated = false
  const updatedNt2 = nt2Units.map((u) => {
    if (u.furniture && u.furniture !== 'NIL') {
      const items = u.furniture.split(',').map((f) => f.trim())
      if (items.includes(trimmedOldName)) {
        nt2Updated = true
        const renamed = items.map((f) => (f === trimmedOldName ? trimmedNewName : f))
        return {
          ...u,
          furniture: renamed.join(', '),
        }
      }
    }
    return u
  })
  if (nt2Updated) {
    setJson('aams_residential_NT2', updatedNt2)
  }

  addAuditLogEntry('Furniture Renamed', `Renamed "${trimmedOldName}" to "${trimmedNewName}"`, 'edit')
  return updatedLibrary
}

export function getFurnitureUsageCount(item) {
  let count = 0

  const allGuestRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  Object.keys(allGuestRooms).forEach((key) => {
    allGuestRooms[key].forEach((room) => {
      if (room.furniture && room.furniture.includes(item)) {
        count++
      }
    })
  })

  const nt1Units = getResidentialUnits('NT1')
  nt1Units.forEach((u) => {
    if (u.furniture && u.furniture !== 'NIL') {
      const items = u.furniture.split(',').map((f) => f.trim())
      if (items.includes(item)) {
        count++
      }
    }
  })

  const nt2Units = getResidentialUnits('NT2')
  nt2Units.forEach((u) => {
    if (u.furniture && u.furniture !== 'NIL') {
      const items = u.furniture.split(',').map((f) => f.trim())
      if (items.includes(item)) {
        count++
      }
    }
  })

  return count
}

// APIs for guest house bookings
export function getGuestHouseBookings() {
  return getJson('aams_guest_bookings', DEFAULT_GUEST_BOOKINGS)
}

export function createGuestHouseBooking(houseCode, payload) {
  const allBookings = getGuestHouseBookings()
  const code = houseCode.toUpperCase()
  
  const newBooking = {
    id: `B-${Date.now()}`,
    guestName: payload.guestName,
    roomNo: payload.roomNo,
    bookingDate: new Date().toISOString().split('T')[0],
    expectedCheckInDate: payload.expectedCheckInDate,
    expectedCheckOutDate: payload.expectedCheckOutDate,
    actualCheckInDateTime: null,
    actualCheckOutDateTime: null,
    bookingStatus: 'Reserved',
    guestStatus: 'Not Checked In',
    houseCode: code,
  }
  
  allBookings.push(newBooking)
  setJson('aams_guest_bookings', allBookings)
  
  const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  const rooms = allRooms[code] || []
  const updatedRooms = rooms.map((r) => {
    if (r.roomNo === payload.roomNo) {
      return { ...r, status: 'Reserved' }
    }
    return r
  })
  allRooms[code] = updatedRooms
  setJson('aams_guest_rooms', allRooms)
  
  addAuditLogEntry(
    'Booking Created',
    `Created booking ${newBooking.id} for ${payload.guestName} (Room ${code}-${payload.roomNo})`,
    'add'
  )
  
  return allBookings
}

export function checkInGuestHouseBooking(houseCode, bookingId) {
  const allBookings = getGuestHouseBookings()
  const code = houseCode.toUpperCase()
  
  let targetRoomNo = null
  let guestName = null
  
  const updatedBookings = allBookings.map((b) => {
    if (b.id === bookingId) {
      targetRoomNo = b.roomNo
      guestName = b.guestName
      const offsetMs = new Date().getTimezoneOffset() * 60 * 1000
      const localISOTime = new Date(Date.now() - offsetMs).toISOString().slice(0, -1)
      return {
        ...b,
        actualCheckInDateTime: localISOTime,
        bookingStatus: 'Occupied',
        guestStatus: 'Checked In',
      }
    }
    return b
  })
  
  setJson('aams_guest_bookings', updatedBookings)
  
  if (targetRoomNo) {
    const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
    const rooms = allRooms[code] || []
    const updatedRooms = rooms.map((r) => {
      if (r.roomNo === targetRoomNo) {
        return { ...r, status: 'Occupied' }
      }
      return r
    })
    allRooms[code] = updatedRooms
    setJson('aams_guest_rooms', allRooms)
    
    addAuditLogEntry(
      'Guest Checked In',
      `Checked in ${guestName} to Room ${code}-${targetRoomNo}`,
      'add'
    )
  }
  
  return updatedBookings
}

export function checkOutGuestHouseBooking(houseCode, bookingId) {
  const allBookings = getGuestHouseBookings()
  const code = houseCode.toUpperCase()
  
  let targetRoomNo = null
  let guestName = null
  
  const updatedBookings = allBookings.map((b) => {
    if (b.id === bookingId) {
      targetRoomNo = b.roomNo
      guestName = b.guestName
      const offsetMs = new Date().getTimezoneOffset() * 60 * 1000
      const localISOTime = new Date(Date.now() - offsetMs).toISOString().slice(0, -1)
      return {
        ...b,
        actualCheckOutDateTime: localISOTime,
        bookingStatus: 'Checked Out',
        guestStatus: 'Checked Out',
      }
    }
    return b
  })
  
  setJson('aams_guest_bookings', updatedBookings)
  
  if (targetRoomNo) {
    const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
    const rooms = allRooms[code] || []
    const updatedRooms = rooms.map((r) => {
      if (r.roomNo === targetRoomNo) {
        return { ...r, status: 'Under Cleaning' }
      }
      return r
    })
    allRooms[code] = updatedRooms
    setJson('aams_guest_rooms', allRooms)
    
    addAuditLogEntry(
      'Guest Checked Out',
      `Checked out ${guestName} from Room ${code}-${targetRoomNo}`,
      'remove'
    )
  }
  
  return updatedBookings
}

export function markRoomCleaned(houseCode, roomNo) {
  const code = houseCode.toUpperCase()
  const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  const rooms = allRooms[code] || []
  
  const updatedRooms = rooms.map((r) => {
    if (r.roomNo === roomNo) {
      return { ...r, status: 'Available' }
    }
    return r
  })
  
  allRooms[code] = updatedRooms
  setJson('aams_guest_rooms', allRooms)
  
  addAuditLogEntry(
    'Room Cleaned',
    `Room ${code}-${roomNo} marked as clean and is now Available`,
    'success'
  )
  
  return updatedRooms
}

export function updateGuestHouseRoomMaintenance(houseCode, roomNo, isUnderMaintenance) {
  const code = houseCode.toUpperCase()
  const allRooms = getJson('aams_guest_rooms', DEFAULT_GUEST_ROOMS)
  const rooms = allRooms[code] || []
  
  const updatedRooms = rooms.map((r) => {
    if (r.roomNo === roomNo) {
      return {
        ...r,
        maintenance: isUnderMaintenance ? 'pending' : 'none',
        status: isUnderMaintenance ? 'Maintenance' : 'Available',
      }
    }
    return r
  })
  
  allRooms[code] = updatedRooms
  setJson('aams_guest_rooms', allRooms)
  
  addAuditLogEntry(
    isUnderMaintenance ? 'Maintenance Logged' : 'Maintenance Resolved',
    `Guest Room ${code}-${roomNo} maintenance state updated`,
    isUnderMaintenance ? 'remove' : 'success'
  )
  
  return updatedRooms
}
