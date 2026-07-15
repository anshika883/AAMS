import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  initStore,
  getResidentialUnits,
  updateResidentialUnit,
  getGuestHouseRooms,
  updateGuestHouseRoom,
  addGuestHouseRoom,
  getAuditLog,
  clearAuditLog,
  getSettings,
  updateSettings,
  getFurnitureLibrary,
  addFurnitureToLibrary,
  deleteFurnitureFromLibrary,
  renameFurnitureInLibrary,
  getFurnitureUsageCount,
  getGuestHouseBookings,
  createGuestHouseBooking,
  checkInGuestHouseBooking,
  checkOutGuestHouseBooking,
  markRoomCleaned,
  importResidentialAndFurniture,
  getResidentialRoomGuestHistory,
  syncGuesthouseResidentialToGuestRooms,
} from './state'
import {
  getCustomRentRates,
  saveCustomRentRate,
  getRentRecords,
  upsertRentRecord,
  deleteRentRecord,
  getGuesthouseRentRecords,
  upsertGuesthouseRentRecord,
  deleteGuesthouseRentRecord,
  upsertRentElectricityFields,
} from './rentState'
import {
  getElectricityBills,
  getElectricitySettings,
  upsertElectricityBillRecord,
  updateUnitsAllotted,
  updateRatePerUnit,
  addPayment,
  setDefaultRate,
  bulkImportElectricityBills,
} from './electricityBillState'

const AamsContext = createContext(null)

export function AamsProvider({ children }) {
  const [residentialNT1, setResidentialNT1] = useState([])
  const [residentialNT2, setResidentialNT2] = useState([])
  const [guestHouseNT1, setGuestHouseNT1] = useState([])
  const [guestHouseNT2, setGuestHouseNT2] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [settings, setSettingsState] = useState({})
  const [furnitureLibrary, setFurnitureLibrary] = useState([])
  const [bookings, setBookings] = useState([])
  const [lastSync, setLastSync] = useState(new Date())

  // Force component re-read
  const refresh = () => {
    initStore()
    setResidentialNT1(getResidentialUnits('NT1'))
    setResidentialNT2(getResidentialUnits('NT2'))
    setGuestHouseNT1(getGuestHouseRooms('NT1'))
    setGuestHouseNT2(getGuestHouseRooms('NT2'))
    setAuditLog(getAuditLog())
    setSettingsState(getSettings())
    setFurnitureLibrary(getFurnitureLibrary())
    setBookings(getGuestHouseBookings())
    setLastSync(new Date())
  }

  // Initial load
  useEffect(() => {
    refresh()
  }, [])

  // Auto-sync simulator based on settings
  useEffect(() => {
    if (!settings.autoSync) return
    const intervalMins = parseInt(settings.syncInterval || '5', 10)
    const intervalMs = intervalMins * 60 * 1000

    const timer = setInterval(() => {
      refresh()
    }, intervalMs)

    return () => clearInterval(timer)
  }, [settings.autoSync, settings.syncInterval])

  const updateResidential = (building, roomNo, fields) => {
    const { rentRate, paymentStatus, amountPaid, notes, ...unitFields } = fields
    updateResidentialUnit(building, roomNo, unitFields)

    if (unitFields.occupancy === 'Occupied') {
      const residentName = unitFields.residentName || 'Guest'
      if (rentRate !== undefined) {
        saveCustomRentRate(building, roomNo, residentName, rentRate)
      }
      if (paymentStatus !== undefined) {
        const month = new Date().getMonth() + 1
        const year = new Date().getFullYear()

        const prevMonth = month === 1 ? 12 : month - 1
        const prevYear = month === 1 ? year - 1 : year
        const prevRecord = getRentRecords().find(
          (r) =>
            r.buildingCode === building &&
            r.roomNo === roomNo &&
            r.month === prevMonth &&
            r.year === prevYear
        )
        const carryForwardAmount = prevRecord ? prevRecord.balance : 0

        upsertRentRecord({
          buildingCode: building,
          roomNo,
          residentName,
          month,
          year,
          rentAmount: parseFloat(rentRate) || 0,
          carryForwardAmount,
          amountPaid: parseFloat(amountPaid) || 0,
          status: paymentStatus,
          paidDate: new Date().toISOString().split('T')[0],
          notes: notes || '',
        })
      }
    }

    refresh()
    refreshRent()
  }

  const updateGuestHouse = (house, roomNo, fields) => {
    updateGuestHouseRoom(house, roomNo, fields)
    refresh()
  }

  const addGuestRoom = (house, room) => {
    const res = addGuestHouseRoom(house, room)
    refresh()
    return res
  }

  const updateSystemSettings = (fields) => {
    updateSettings(fields)
    refresh()
  }

  const clearLogs = () => {
    clearAuditLog()
    refresh()
  }

  const addFurniture = (name) => {
    addFurnitureToLibrary(name)
    refresh()
  }

  const deleteFurniture = (name) => {
    deleteFurnitureFromLibrary(name)
    refresh()
  }

  const renameFurniture = (oldName, newName) => {
    renameFurnitureInLibrary(oldName, newName)
    refresh()
  }

  const getFurnitureUsage = (name) => {
    return getFurnitureUsageCount(name)
  }

  const createBooking = (house, payload) => {
    createGuestHouseBooking(house, payload)
    refresh()
  }

  const checkInBooking = (house, bookingId) => {
    checkInGuestHouseBooking(house, bookingId)
    refresh()
  }

  const checkOutBooking = (house, bookingId) => {
    checkOutGuestHouseBooking(house, bookingId)
    refresh()
  }

  const markRoomClean = (house, roomNo) => {
    markRoomCleaned(house, roomNo)
    refresh()
  }

  const importExcel = (nt1, nt2, furniture) => {
    importResidentialAndFurniture(nt1, nt2, furniture)
    // Sync guesthouse units flagged in residential into guesthouses tab
    syncGuesthouseResidentialToGuestRooms('NT1')
    syncGuesthouseResidentialToGuestRooms('NT2')
    refresh()
    refreshRent()
  }

  // ─── Rent Management ─────────────────────────────────────────────────────
  const [customRentRates, setCustomRentRatesState] = useState(getCustomRentRates())
  const [rentRecords, setRentRecords] = useState(getRentRecords())
  const [guesthouseRentRecords, setGuesthouseRentRecords] = useState(getGuesthouseRentRecords())

  const refreshRent = () => {
    setCustomRentRatesState(getCustomRentRates())
    setRentRecords(getRentRecords())
    setGuesthouseRentRecords(getGuesthouseRentRecords())
  }

  const updateCustomRentRate = (buildingCode, roomNo, residentName, rentRate) => {
    const updated = saveCustomRentRate(buildingCode, roomNo, residentName, rentRate)
    setCustomRentRatesState(updated)
  }

  const saveRentRecord = (payload) => {
    const record = upsertRentRecord(payload)
    // Refresh both rent records and custom rent rates (since it saves them)
    setRentRecords(getRentRecords())
    setCustomRentRatesState(getCustomRentRates())
    return record
  }

  const removeRentRecord = (recordId) => {
    deleteRentRecord(recordId)
    setRentRecords(getRentRecords())
  }

  const saveGuesthouseRentRecord = (payload) => {
    const record = upsertGuesthouseRentRecord(payload)
    setGuesthouseRentRecords(getGuesthouseRentRecords())
    return record
  }

  const removeGuesthouseRentRecord = (recordId) => {
    deleteGuesthouseRentRecord(recordId)
    setGuesthouseRentRecords(getGuesthouseRentRecords())
  }

  const getRoomGuestHistory = (buildingCode, roomNo) => {
    return getResidentialRoomGuestHistory(buildingCode, roomNo)
  }

  const updateRentUnitsUsed = (buildingCode, roomNo, residentName, month, year, unitsUsed) => {
    const record = upsertRentElectricityFields(buildingCode, roomNo, residentName, month, year, { unitsUsed })
    setRentRecords(getRentRecords())
    return record
  }

  const updateRentElectricityPaid = (buildingCode, roomNo, residentName, month, year, electricityBillPaid) => {
    const record = upsertRentElectricityFields(buildingCode, roomNo, residentName, month, year, { electricityBillPaid })
    setRentRecords(getRentRecords())
    return record
  }

  // ─── Electricity Bill Management (independent table) ────────────────────
  const [electricityBills, setElectricityBills] = useState(getElectricityBills())
  const [electricitySettings, setElectricitySettingsState] = useState(getElectricitySettings())

  const refreshElectricityBills = () => {
    setElectricityBills(getElectricityBills())
    setElectricitySettingsState(getElectricitySettings())
  }

  const saveElectricityBillRecord = (payload) => {
    const record = upsertElectricityBillRecord(payload)
    setElectricityBills(getElectricityBills())
    return record
  }

  const updateElectricityUnitsAllotted = (buildingCode, roomNo, value) => {
    const record = updateUnitsAllotted(buildingCode, roomNo, value)
    setElectricityBills(getElectricityBills())
    return record
  }

  const updateElectricityRate = (buildingCode, roomNo, rate) => {
    const record = updateRatePerUnit(buildingCode, roomNo, rate)
    setElectricityBills(getElectricityBills())
    return record
  }

  const addElectricityPayment = (buildingCode, roomNo, amount, date, note) => {
    const record = addPayment(buildingCode, roomNo, amount, date, note)
    setElectricityBills(getElectricityBills())
    return record
  }

  // Only affects new records going forward — existing per-record rates are untouched.
  const updateGlobalElectricityRate = (rate) => {
    const settings = setDefaultRate(rate)
    setElectricitySettingsState(settings)
    return settings
  }

  const importElectricityBills = (records) => {
    const saved = bulkImportElectricityBills(records)
    setElectricityBills(getElectricityBills())
    return saved
  }

  const value = {
    residentialNT1,
    residentialNT2,
    guestHouseNT1,
    guestHouseNT2,
    auditLog,
    settings,
    furnitureLibrary,
    bookings,
    lastSync,
    refresh,
    updateResidential,
    updateGuestHouse,
    addGuestRoom,
    updateSystemSettings,
    clearLogs,
    addFurniture,
    deleteFurniture,
    renameFurniture,
    getFurnitureUsage,
    createBooking,
    checkInBooking,
    checkOutBooking,
    markRoomClean,
    importExcel,
    // Rent management
    customRentRates,
    rentRecords,
    guesthouseRentRecords,
    updateCustomRentRate,
    saveRentRecord,
    removeRentRecord,
    saveGuesthouseRentRecord,
    removeGuesthouseRentRecord,
    refreshRent,
    // Electricity billing (per resident, per month)
    updateRentUnitsUsed,
    updateRentElectricityPaid,
    // Electricity Bill Management (independent table)
    electricityBills,
    electricitySettings,
    saveElectricityBillRecord,
    updateElectricityUnitsAllotted,
    updateElectricityRate,
    addElectricityPayment,
    updateGlobalElectricityRate,
    importElectricityBills,
    refreshElectricityBills,
    // History
    getRoomGuestHistory,
  }

  return <AamsContext.Provider value={value}>{children}</AamsContext.Provider>
}

export function useAams() {
  const context = useContext(AamsContext)
  if (!context) {
    throw new Error('useAams must be used within an AamsProvider')
  }
  return context
}
