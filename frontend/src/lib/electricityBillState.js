/**
 * electricityBillState.js — Electricity Bill Management state.
 * Persisted in localStorage under its own keys, independent from
 * rentState.js and state.js (no shared storage keys, no cross-reads).
 *
 * One record per flat (keyed by buildingCode + roomNo, the same identifier
 * fields rentState.js uses). Each record reflects the *current* billing
 * cycle for that flat — re-billing a flat for a new month is a normal
 * upsertElectricityBillRecord() call that overwrites unitsConsumed/
 * billingMonth/billingYear on the same record, it does not create a new
 * one. Payments accumulate on the record and are only cleared by whatever
 * calls upsert with an explicit `payments` array (the importer does this
 * for a fresh sheet); routine field edits never touch payments.
 */

// Record shape (persisted): { id, buildingCode, roomNo, billingMonth, billingYear,
//   unitsAllotted, unitsConsumed, ratePerUnit, amount, status, payments, lastUpdated }
// payments: [{ amount, date, note }]
//
// amountPaid is intentionally NOT persisted — it's always the live sum of
// `payments`, recomputed by every getter so it can never drift from the
// ledger. `amount` and `status` ARE persisted (recomputed on every write,
// mirroring rentState.js's derived-field convention) so the raw storage
// snapshot is still meaningful on its own.

const RECORDS_KEY = 'aams_electricity_bill_records'
const SETTINGS_KEY = 'aams_electricity_bill_settings'
const DEFAULT_RATE_PER_UNIT = 10

function getJson(key, def) {
  const val = localStorage.getItem(key)
  return val ? JSON.parse(val) : def
}

function setJson(key, val) {
  localStorage.setItem(key, JSON.stringify(val))
}

function clampNonNegativeNumber(value, fallback = 0) {
  const parsed = parseFloat(value)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(0, parsed)
}

function sumPayments(payments) {
  return (payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
}

function computeStatus(amountPaid, amount) {
  if (amountPaid <= 0) return 'unpaid'
  if (amountPaid >= amount) return 'paid'
  return 'partial'
}

/** Attach the always-fresh amountPaid (and re-verified status) to a stored record. */
function withDerived(record) {
  const amountPaid = sumPayments(record.payments)
  return { ...record, amountPaid, status: computeStatus(amountPaid, record.amount) }
}

// ─── Global Settings (default rate/unit) ────────────────────────────────────

export function getElectricitySettings() {
  return getJson(SETTINGS_KEY, { defaultRatePerUnit: DEFAULT_RATE_PER_UNIT })
}

export function getDefaultRate() {
  return getElectricitySettings().defaultRatePerUnit ?? DEFAULT_RATE_PER_UNIT
}

/**
 * Changes the global default rate used for *new* records going forward.
 * Existing records keep whatever rate they were created/overridden with —
 * this never retroactively rewrites a stored ratePerUnit.
 */
export function setDefaultRate(rate) {
  const settings = { ...getElectricitySettings(), defaultRatePerUnit: clampNonNegativeNumber(rate, DEFAULT_RATE_PER_UNIT) }
  setJson(SETTINGS_KEY, settings)
  return settings
}

// ─── Records ────────────────────────────────────────────────────────────────

export function getElectricityBills() {
  return getJson(RECORDS_KEY, []).map(withDerived)
}

export function getElectricityBillsByBuilding(buildingCode) {
  return getElectricityBills().filter((r) => r.buildingCode === buildingCode)
}

export function getElectricityBillRecord(buildingCode, roomNo) {
  const record = getJson(RECORDS_KEY, []).find((r) => r.buildingCode === buildingCode && r.roomNo === roomNo)
  return record ? withDerived(record) : null
}

function findIdx(records, buildingCode, roomNo) {
  return records.findIndex((r) => r.buildingCode === buildingCode && r.roomNo === roomNo)
}

/**
 * Create or fully update a flat's electricity bill record. Re-billing a
 * flat for a new period is just calling this again with the new
 * unitsConsumed/billingMonth/billingYear — it overwrites those fields on
 * the same per-flat record rather than creating a history entry.
 *
 * ratePerUnit: if omitted on a new record, falls back to the current
 * global default; if omitted on an existing record, the existing
 * (possibly overridden) rate is preserved rather than reset.
 *
 * payments: only touched if explicitly passed (used by the Excel importer
 * to seed an initial lump-sum payment on a brand new record) — normal
 * field edits never wipe accumulated payment history.
 */
export function upsertElectricityBillRecord(payload) {
  const {
    buildingCode,
    roomNo,
    billingMonth,
    billingYear,
    unitsAllotted,
    unitsConsumed,
    ratePerUnit,
    payments,
  } = payload

  const records = getJson(RECORDS_KEY, [])
  const existingIdx = findIdx(records, buildingCode, roomNo)
  const existing = existingIdx >= 0 ? records[existingIdx] : null

  const resolvedRate =
    ratePerUnit !== undefined
      ? clampNonNegativeNumber(ratePerUnit, getDefaultRate())
      : existing
      ? existing.ratePerUnit
      : getDefaultRate()

  const resolvedUnitsConsumed =
    unitsConsumed !== undefined ? clampNonNegativeNumber(unitsConsumed, 0) : existing ? existing.unitsConsumed : 0
  const resolvedUnitsAllotted =
    unitsAllotted !== undefined ? clampNonNegativeNumber(unitsAllotted, 0) : existing ? existing.unitsAllotted : 0

  const amount = resolvedUnitsConsumed * resolvedRate
  const resolvedPayments = payments !== undefined ? payments : existing ? existing.payments : []
  const amountPaid = sumPayments(resolvedPayments)

  const record = {
    id: existing ? existing.id : `ELEC-${buildingCode}-${roomNo}`,
    buildingCode,
    roomNo,
    billingMonth: billingMonth !== undefined ? billingMonth : existing ? existing.billingMonth : null,
    billingYear: billingYear !== undefined ? billingYear : existing ? existing.billingYear : null,
    unitsAllotted: resolvedUnitsAllotted,
    unitsConsumed: resolvedUnitsConsumed,
    ratePerUnit: resolvedRate,
    amount,
    status: computeStatus(amountPaid, amount),
    payments: resolvedPayments,
    lastUpdated: new Date().toISOString(),
  }

  if (existingIdx >= 0) {
    records[existingIdx] = record
  } else {
    records.unshift(record)
  }

  setJson(RECORDS_KEY, records)
  return withDerived(record)
}

/** Patch just unitsAllotted (the editable allocation/quota field) for a flat. */
export function updateUnitsAllotted(buildingCode, roomNo, value) {
  const records = getJson(RECORDS_KEY, [])
  const idx = findIdx(records, buildingCode, roomNo)
  if (idx === -1) {
    return upsertElectricityBillRecord({ buildingCode, roomNo, unitsAllotted: value })
  }
  records[idx] = { ...records[idx], unitsAllotted: clampNonNegativeNumber(value, 0), lastUpdated: new Date().toISOString() }
  setJson(RECORDS_KEY, records)
  return withDerived(records[idx])
}

/** Patch ratePerUnit for a single flat — this is what creates a per-record override. */
export function updateRatePerUnit(buildingCode, roomNo, rate) {
  const records = getJson(RECORDS_KEY, [])
  const idx = findIdx(records, buildingCode, roomNo)
  if (idx === -1) {
    return upsertElectricityBillRecord({ buildingCode, roomNo, ratePerUnit: rate })
  }
  const resolvedRate = clampNonNegativeNumber(rate, getDefaultRate())
  const amount = records[idx].unitsConsumed * resolvedRate
  const amountPaid = sumPayments(records[idx].payments)
  records[idx] = {
    ...records[idx],
    ratePerUnit: resolvedRate,
    amount,
    status: computeStatus(amountPaid, amount),
    lastUpdated: new Date().toISOString(),
  }
  setJson(RECORDS_KEY, records)
  return withDerived(records[idx])
}

/** Append a payment entry to a flat's record; status is re-derived automatically. */
export function addPayment(buildingCode, roomNo, amount, date, note) {
  const records = getJson(RECORDS_KEY, [])
  const idx = findIdx(records, buildingCode, roomNo)
  if (idx === -1) {
    return upsertElectricityBillRecord({
      buildingCode,
      roomNo,
      payments: [{ amount: clampNonNegativeNumber(amount, 0), date: date || new Date().toISOString().split('T')[0], note: note || '' }],
    })
  }

  const payment = { amount: clampNonNegativeNumber(amount, 0), date: date || new Date().toISOString().split('T')[0], note: note || '' }
  const payments = [...(records[idx].payments || []), payment]
  const amountPaid = sumPayments(payments)

  records[idx] = {
    ...records[idx],
    payments,
    status: computeStatus(amountPaid, records[idx].amount),
    lastUpdated: new Date().toISOString(),
  }
  setJson(RECORDS_KEY, records)
  return withDerived(records[idx])
}

export function deleteElectricityBillRecord(buildingCode, roomNo) {
  const records = getJson(RECORDS_KEY, [])
  const updated = records.filter((r) => !(r.buildingCode === buildingCode && r.roomNo === roomNo))
  setJson(RECORDS_KEY, updated)
  return updated.map(withDerived)
}

/**
 * Persist a batch of already-normalized records (see
 * electricityBillImporter.js for parsing/validation of raw Excel rows).
 * Each entry upserts by buildingCode+roomNo, same rules as
 * upsertElectricityBillRecord — missing rate falls back to the current
 * global default, missing payments leaves the record unpaid.
 */
export function bulkImportElectricityBills(records) {
  return records.map((r) => upsertElectricityBillRecord(r))
}
