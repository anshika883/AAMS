/**
 * rentState.js — Money Management state (Rent + Guesthouse)
 * All data is persisted in localStorage under aams_rent_* keys.
 */

// ─── Defaults ───────────────────────────────────────────────────────────────

// ─── Helpers ────────────────────────────────────────────────────────────────

function getJson(key, def) {
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : def
}

function setJson(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

// ─── Custom Rent Rates per Resident ─────────────────────────────────────────

export function getCustomRentRates() {
  return getJson('aams_custom_rent_rates', {})
}

export function saveCustomRentRate(buildingCode, roomNo, residentName, rentRate) {
  const rates = getCustomRentRates()
  const key = `${buildingCode}_${roomNo}_${residentName}`
  rates[key] = parseFloat(rentRate) || 0
  setJson('aams_custom_rent_rates', rates)
  return rates
}

// ─── Resident Rent Records ──────────────────────────────────────────────────
// Each record: { id, buildingCode, roomNo, residentName, rentAmount, month, year,
//               amountPaid, paidDate, paymentMode, notes, status }
// status: 'Paid' | 'Partial' | 'Unpaid' | 'Carry-Forward'

export function getRentRecords() {
  return getJson('aams_rent_records', [])
}

export function getRentRecordsByRoom(buildingCode, roomNo) {
  const records = getRentRecords()
  return records.filter(
    (r) => r.buildingCode === buildingCode && r.roomNo === roomNo
  )
}

export function getRentRecordsByMonth(month, year) {
  const records = getRentRecords()
  return records.filter((r) => r.month === month && r.year === year)
}

/**
 * Upsert a rent record for a resident for a specific month/year.
 * If a record already exists, update it; otherwise create.
 */
export function upsertRentRecord(payload) {
  const records = getRentRecords()
  const {
    buildingCode,
    roomNo,
    residentName,
    month,
    year,
    rentAmount,
    amountPaid,
    paidDate,
    notes,
    carryForwardAmount = 0,
    status = 'Unpaid',
  } = payload

  // Persist the custom rent rate for this resident
  saveCustomRentRate(buildingCode, roomNo, residentName, rentAmount)

  const existingIdx = records.findIndex(
    (r) =>
      r.buildingCode === buildingCode &&
      r.roomNo === roomNo &&
      r.month === month &&
      r.year === year
  )

  const totalDue = rentAmount + carryForwardAmount
  const balance = totalDue - amountPaid // positive = resident owes, negative = management owes

  const record = {
    id: existingIdx >= 0 ? records[existingIdx].id : `RENT-${Date.now()}`,
    buildingCode,
    roomNo,
    residentName,
    month,
    year,
    rentAmount,
    carryForwardAmount,
    totalDue,
    amountPaid,
    balance,
    paidDate: paidDate || null,
    notes: notes || '',
    status,
    updatedAt: new Date().toISOString(),
  }

  if (existingIdx >= 0) {
    records[existingIdx] = record
  } else {
    records.unshift(record)
  }

  setJson('aams_rent_records', records)
  return record
}

export function deleteRentRecord(recordId) {
  const records = getRentRecords()
  const updated = records.filter((r) => r.id !== recordId)
  setJson('aams_rent_records', updated)
  return updated
}

// ─── Guesthouse Rent / Payment Records ─────────────────────────────────────
// Each record: { id, houseCode, roomNo, guestName, bookingId, amount, amountPaid,
//               paidDate, notes, status, month, year }

export function getGuesthouseRentRecords() {
  return getJson('aams_guesthouse_rent_records', [])
}

export function getGuesthouseRentByBooking(bookingId) {
  const records = getGuesthouseRentRecords()
  return records.filter((r) => r.bookingId === bookingId)
}

export function upsertGuesthouseRentRecord(payload) {
  const records = getGuesthouseRentRecords()
  const {
    houseCode,
    roomNo,
    guestName,
    bookingId,
    amount,
    amountPaid,
    paidDate,
    notes,
    month,
    year,
  } = payload

  const existingIdx = records.findIndex(
    (r) => r.bookingId === bookingId && r.month === month && r.year === year
  )

  let status = 'Unpaid'
  if (amountPaid >= amount) status = 'Paid'
  else if (amountPaid > 0) status = 'Partial'

  const balance = amount - amountPaid

  const record = {
    id: existingIdx >= 0 ? records[existingIdx].id : `GH-RENT-${Date.now()}`,
    houseCode,
    roomNo,
    guestName,
    bookingId,
    amount,
    amountPaid,
    balance,
    paidDate: paidDate || null,
    notes: notes || '',
    status,
    month,
    year,
    updatedAt: new Date().toISOString(),
  }

  if (existingIdx >= 0) {
    records[existingIdx] = record
  } else {
    records.unshift(record)
  }

  setJson('aams_guesthouse_rent_records', records)
  return record
}

export function deleteGuesthouseRentRecord(recordId) {
  const records = getGuesthouseRentRecords()
  const updated = records.filter((r) => r.id !== recordId)
  setJson('aams_guesthouse_rent_records', updated)
  return updated
}

// ─── Guesthouse unit overrides ──────────────────────────────────────────────
// A room is a "guesthouse" in residential context if it's flagged as such in the unit data.
// The importer.js will set unit.isGuesthouse = true for flagged rooms.
// This function retrieves all residential units flagged as guesthouses.
export function getGuesthouseResidentialUnits(buildingCode) {
  const key = `aams_residential_${buildingCode.toUpperCase()}`
  const all = getJson(key, [])
  return all.filter((u) => u.isGuesthouse === true)
}
