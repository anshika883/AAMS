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
} from './state'

const AamsContext = createContext(null)

export function AamsProvider({ children }) {
  const [residentialNT1, setResidentialNT1] = useState([])
  const [residentialNT2, setResidentialNT2] = useState([])
  const [guestHouseNT1, setGuestHouseNT1] = useState([])
  const [guestHouseNT2, setGuestHouseNT2] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [settings, setSettingsState] = useState({})
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
    updateResidentialUnit(building, roomNo, fields)
    refresh()
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

  const value = {
    residentialNT1,
    residentialNT2,
    guestHouseNT1,
    guestHouseNT2,
    auditLog,
    settings,
    lastSync,
    refresh,
    updateResidential,
    updateGuestHouse,
    addGuestRoom,
    updateSystemSettings,
    clearLogs,
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
