import { useState, useMemo, useRef } from 'react'
import Icon from '../../components/Icon'
import TopBar from '../../components/TopBar'
import ProportionDonut from '../../components/charts/ProportionDonut'
import { useAams } from '../../lib/useAams'
import { parseElectricityBillExcel } from '../../lib/electricityBillImporter'

const ELECTRICITY_BUILDINGS = ['NT1', 'NT2'] // no canonical buildings list exists in this app

export default function MoneyManagement() {
  const {
    residentialNT1,
    residentialNT2,
    bookings,
    customRentRates,
    rentRecords,
    guesthouseRentRecords,
    saveRentRecord,
    saveGuesthouseRentRecord,
    updateRentElectricityPaid,
    electricityBills,
    electricitySettings,
    updateElectricityUnitsAllotted,
    updateElectricityRate,
    addElectricityPayment,
    updateGlobalElectricityRate,
    importElectricityBills,
  } = useAams()

  const [activeSubTab, setActiveSubTab] = useState('rent') // 'rent' | 'guesthouse' | 'electricity'

  // Electricity Bill table: inline-edit buffers for Units Allotted / Rate per Unit
  const [elecAllottedInputs, setElecAllottedInputs] = useState({})
  const [elecRateInputs, setElecRateInputs] = useState({})

  // Electricity Bill: payment history panel
  const [elecPaymentModalOpen, setElecPaymentModalOpen] = useState(false)
  const [selectedElecRow, setSelectedElecRow] = useState(null)
  const [elecPaymentAmountInput, setElecPaymentAmountInput] = useState('')
  const [elecPaymentDateInput, setElecPaymentDateInput] = useState(new Date().toISOString().split('T')[0])
  const [elecPaymentNoteInput, setElecPaymentNoteInput] = useState('')

  // Electricity Bill: global default rate settings panel
  const [elecSettingsModalOpen, setElecSettingsModalOpen] = useState(false)
  const [elecGlobalRateInput, setElecGlobalRateInput] = useState(electricitySettings.defaultRatePerUnit)

  // Electricity Bill: Excel import
  const elecFileInputRef = useRef(null)
  const [elecImportSummary, setElecImportSummary] = useState(null)
  const [elecImporting, setElecImporting] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [sortBy, setSortBy] = useState('asc') // 'asc' | 'desc'

  // Payment log modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [rentAmountInput, setRentAmountInput] = useState(0)
  const [paymentStatusInput, setPaymentStatusInput] = useState('Unpaid') // 'Paid' | 'Partial' | 'Unpaid'
  const [amountPaidInput, setAmountPaidInput] = useState(0)
  const [notesInput, setNotesInput] = useState('')

  // Guesthouse payment modal state
  const [ghPaymentModalOpen, setGhPaymentModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [ghAmountInput, setGhAmountInput] = useState(0)
  const [ghAmountPaidInput, setGhAmountPaidInput] = useState(0)
  const [ghNotesInput, setGhNotesInput] = useState('')

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ]

  const years = [2025, 2026, 2027, 2028]

  const ELECTRICITY_RATE_PER_UNIT = 10

  const handleElectricityPaidChange = (unit, value) => {
    updateRentElectricityPaid(unit.buildingCode, unit.roomNo, unit.residentName, selectedMonth, selectedYear, value === 'Yes')
  }

  // ─── Electricity Bill table handlers (independent from Residential Rent) ──
  const handleElecAllottedChange = (rowKey, value) => {
    setElecAllottedInputs((prev) => ({ ...prev, [rowKey]: value }))
  }

  const handleElecAllottedSave = (row, value) => {
    const rowKey = `${row.buildingCode}-${row.roomNo}`
    // Numeric only, non-negative — clamp rather than reject so a stray "-5" or
    // blank input still resolves to a sane stored value.
    const parsed = Math.max(0, parseFloat(value) || 0)
    updateElectricityUnitsAllotted(row.buildingCode, row.roomNo, parsed)
    setElecAllottedInputs((prev) => {
      const next = { ...prev }
      delete next[rowKey]
      return next
    })
  }

  const handleElecRateChange = (rowKey, value) => {
    setElecRateInputs((prev) => ({ ...prev, [rowKey]: value }))
  }

  const handleElecRateSave = (row, value) => {
    const rowKey = `${row.buildingCode}-${row.roomNo}`
    const parsed = Math.max(0, parseFloat(value) || 0)
    updateElectricityRate(row.buildingCode, row.roomNo, parsed)
    setElecRateInputs((prev) => {
      const next = { ...prev }
      delete next[rowKey]
      return next
    })
  }

  const handleOpenElecPayments = (row) => {
    setSelectedElecRow(row)
    setElecPaymentAmountInput('')
    setElecPaymentDateInput(new Date().toISOString().split('T')[0])
    setElecPaymentNoteInput('')
    setElecPaymentModalOpen(true)
  }

  const handleAddElecPayment = (e) => {
    e.preventDefault()
    if (!selectedElecRow) return
    const amount = parseFloat(elecPaymentAmountInput) || 0
    if (amount <= 0) return

    const updated = addElectricityPayment(selectedElecRow.buildingCode, selectedElecRow.roomNo, amount, elecPaymentDateInput, elecPaymentNoteInput)
    setSelectedElecRow(updated)
    setElecPaymentAmountInput('')
    setElecPaymentNoteInput('')
  }

  const handleSaveGlobalRate = (e) => {
    e.preventDefault()
    updateGlobalElectricityRate(parseFloat(elecGlobalRateInput) || 0)
    setElecSettingsModalOpen(false)
  }

  const handleElecFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setElecImporting(true)
    try {
      const { records, summary } = await parseElectricityBillExcel(file)
      importElectricityBills(records)
      setElecImportSummary(summary)
    } catch (err) {
      setElecImportSummary({ totalRows: 0, imported: 0, skipped: [{ row: '-', reason: err.message || 'Failed to parse file' }], fixed: [] })
    } finally {
      setElecImporting(false)
      e.target.value = ''
    }
  }

  // Combine residential units from NT1 and NT2
  const allOccupiedUnits = useMemo(() => {
    const nt1Filtered = residentialNT1.filter((u) => u.occupancy === 'Occupied')
    const nt2Filtered = residentialNT2.filter((u) => u.occupancy === 'Occupied')

    return [
      ...nt1Filtered.map((u) => ({ ...u, buildingCode: 'NT1' })),
      ...nt2Filtered.map((u) => ({ ...u, buildingCode: 'NT2' })),
    ]
  }, [residentialNT1, residentialNT2])

  // Map rent records for the selected month/year
  const rentList = useMemo(() => {
    return allOccupiedUnits.map((unit) => {
      // Find existing record
      const record = rentRecords.find(
        (r) =>
          r.buildingCode === unit.buildingCode &&
          r.roomNo === unit.roomNo &&
          r.month === selectedMonth &&
          r.year === selectedYear
      )

      // Find previous month's record to calculate carry-forward balance
      const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1
      const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear
      const prevRecord = rentRecords.find(
        (r) =>
          r.buildingCode === unit.buildingCode &&
          r.roomNo === unit.roomNo &&
          r.month === prevMonth &&
          r.year === prevYear
      )

      const carryForwardAmount = prevRecord ? prevRecord.balance : 0

      // Get custom rent rate for this resident
      const rateKey = `${unit.buildingCode}_${unit.roomNo}_${unit.residentName}`
      const savedRate = customRentRates[rateKey] || 0

      const rentAmount = record ? record.rentAmount : savedRate
      const amountPaid = record ? record.amountPaid : 0
      const totalDue = rentAmount + carryForwardAmount
      const status = record ? record.status : 'Unpaid'

      const unitsUsed = record ? record.unitsUsed || 0 : 0
      const electricityBill = unitsUsed * ELECTRICITY_RATE_PER_UNIT
      const electricityBillPaid = record ? record.electricityBillPaid || false : false
      // Balance = Monthly Rent + Electricity Bill (recalculates whenever either changes)
      const balance = rentAmount + electricityBill

      return {
        ...unit,
        rentAmount,
        carryForwardAmount,
        totalDue,
        amountPaid,
        unitsUsed,
        electricityBill,
        electricityBillPaid,
        balance,
        status,
        notes: record ? record.notes : '',
        recordId: record ? record.id : null,
      }
    })
  }, [allOccupiedUnits, rentRecords, selectedMonth, selectedYear, customRentRates])

  // Filter rent list by search query and sort by Room No
  const filteredRentList = useMemo(() => {
    const list = rentList.filter((item) => {
      const q = searchQuery.toLowerCase()
      return (
        item.roomNo.toLowerCase().includes(q) ||
        item.residentName.toLowerCase().includes(q) ||
        item.buildingCode.toLowerCase().includes(q)
      )
    })
    list.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        return b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      }
    })
    return list
  }, [rentList, searchQuery, sortBy])

  // Guesthouse stays financials logic
  const guesthouseFinancialList = useMemo(() => {
    return bookings.map((booking) => {
      const record = guesthouseRentRecords.find((r) => r.bookingId === booking.id)

      const amount = record ? record.amount : 0
      const amountPaid = record ? record.amountPaid : 0
      const balance = amount - amountPaid
      const status = record ? record.status : 'Unpaid'

      return {
        ...booking,
        amount,
        amountPaid,
        balance,
        status,
        notes: record ? record.notes : '',
        recordId: record ? record.id : null,
      }
    })
  }, [bookings, guesthouseRentRecords])

  const filteredGhFinancialList = useMemo(() => {
    const list = guesthouseFinancialList.filter((item) => {
      const q = searchQuery.toLowerCase()
      return (
        item.guestName.toLowerCase().includes(q) ||
        item.roomNo.toLowerCase().includes(q) ||
        item.bookingStatus.toLowerCase().includes(q)
      )
    })
    list.sort((a, b) => {
      if (sortBy === 'asc') {
        return a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      } else {
        return b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      }
    })
    return list
  }, [guesthouseFinancialList, searchQuery, sortBy])

  // Electricity Bill table — independent from Residential Rent, but keyed by
  // the same buildingCode/roomNo identifier so records line up per flat.
  // One table per building (NT1/NT2, hardcoded — no canonical buildings list).
  const electricityByBuilding = useMemo(() => {
    const buildForBuilding = (buildingCode) => {
      const list = allOccupiedUnits
        .filter((u) => u.buildingCode === buildingCode)
        .map((unit) => {
          const record = electricityBills.find((r) => r.buildingCode === buildingCode && r.roomNo === unit.roomNo)
          return {
            buildingCode,
            roomNo: unit.roomNo,
            residentName: unit.residentName,
            unitsAllotted: record ? record.unitsAllotted : 0,
            unitsConsumed: record ? record.unitsConsumed : 0,
            ratePerUnit: record ? record.ratePerUnit : electricitySettings.defaultRatePerUnit,
            amount: record ? record.amount : 0,
            amountPaid: record ? record.amountPaid : 0,
            status: record ? record.status : 'unpaid',
            payments: record ? record.payments : [],
          }
        })
        .filter((row) => {
          const q = searchQuery.toLowerCase()
          return row.roomNo.toLowerCase().includes(q) || row.residentName.toLowerCase().includes(q)
        })

      list.sort((a, b) =>
        sortBy === 'asc'
          ? a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: 'base' })
          : b.roomNo.localeCompare(a.roomNo, undefined, { numeric: true, sensitivity: 'base' })
      )
      return list
    }

    return Object.fromEntries(ELECTRICITY_BUILDINGS.map((b) => [b, buildForBuilding(b)]))
  }, [allOccupiedUnits, electricityBills, electricitySettings, searchQuery, sortBy])

  const allElecRows = useMemo(
    () => ELECTRICITY_BUILDINGS.flatMap((b) => electricityByBuilding[b]),
    [electricityByBuilding]
  )

  const elecStatusBreakdown = useMemo(() => {
    const counts = { paid: 0, partial: 0, unpaid: 0 }
    allElecRows.forEach((r) => {
      counts[r.status] = (counts[r.status] || 0) + 1
    })
    return [
      { type: 'Paid', value: counts.paid },
      { type: 'Partial', value: counts.partial },
      { type: 'Unpaid', value: counts.unpaid },
    ]
  }, [allElecRows])

  // Total summary calculations
  const rentSummary = useMemo(() => {
    let totalExpected = 0
    let totalCollected = 0
    let totalOwed = 0

    filteredRentList.forEach((r) => {
      totalExpected += r.totalDue
      totalCollected += r.amountPaid
      totalOwed += r.balance
    })

    return { totalExpected, totalCollected, totalOwed }
  }, [filteredRentList])

  const ghSummary = useMemo(() => {
    let totalExpected = 0
    let totalCollected = 0
    let totalOwed = 0

    filteredGhFinancialList.forEach((r) => {
      totalExpected += r.amount
      totalCollected += r.amountPaid
      totalOwed += r.balance
    })

    return { totalExpected, totalCollected, totalOwed }
  }, [filteredGhFinancialList])

  const elecSummary = useMemo(() => {
    let totalExpected = 0
    let totalCollected = 0
    let totalOwed = 0

    allElecRows.forEach((r) => {
      totalExpected += r.amount
      totalCollected += r.amountPaid
      totalOwed += Math.max(0, r.amount - r.amountPaid)
    })

    return { totalExpected, totalCollected, totalOwed }
  }, [allElecRows])

  const handleOpenPayment = (unit) => {
    setSelectedUnit(unit)
    setRentAmountInput(unit.rentAmount || 0)
    setPaymentStatusInput(unit.status || 'Unpaid')
    setAmountPaidInput(unit.amountPaid || 0)
    setNotesInput(unit.notes || '')
    setPaymentModalOpen(true)
  }

  // Handle setting status selection in modal
  const handleStatusChange = (newStatus, rentVal) => {
    setPaymentStatusInput(newStatus)
    const rentNum = parseFloat(rentVal) || 0
    const carryForward = selectedUnit ? selectedUnit.carryForwardAmount : 0
    const total = rentNum + carryForward

    if (newStatus === 'Paid') {
      setAmountPaidInput(total)
    } else if (newStatus === 'Unpaid') {
      setAmountPaidInput(0)
    }
  }

  const handleSavePayment = (e) => {
    e.preventDefault()
    if (!selectedUnit) return

    const parsedRent = parseFloat(rentAmountInput) || 0
    const carryForward = selectedUnit.carryForwardAmount
    const totalDue = parsedRent + carryForward

    let finalAmountPaid = parseFloat(amountPaidInput) || 0
    if (paymentStatusInput === 'Unpaid') {
      finalAmountPaid = 0
    }

    // If the resident paid more than what's due, the management owes them
    // the difference back — reflect that as an "Overpaid" status rather
    // than silently forcing amountPaid down to totalDue.
    let finalStatus = paymentStatusInput
    if (finalAmountPaid > totalDue) {
      finalStatus = 'Overpaid'
    } else if (paymentStatusInput === 'Paid') {
      finalAmountPaid = totalDue
    }

    saveRentRecord({
      buildingCode: selectedUnit.buildingCode,
      roomNo: selectedUnit.roomNo,
      residentName: selectedUnit.residentName,
      month: selectedMonth,
      year: selectedYear,
      rentAmount: parsedRent,
      carryForwardAmount: carryForward,
      amountPaid: finalAmountPaid,
      status: finalStatus,
      paidDate: new Date().toISOString().split('T')[0],
      notes: notesInput,
    })

    setPaymentModalOpen(false)
  }

  const handleOpenGhPayment = (booking) => {
    setSelectedBooking(booking)
    setGhAmountInput(booking.amount || 0)
    setGhAmountPaidInput(booking.amountPaid || 0)
    setGhNotesInput(booking.notes || '')
    setGhPaymentModalOpen(true)
  }

  const handleSaveGhPayment = (e) => {
    e.preventDefault()
    if (!selectedBooking) return

    const amount = parseFloat(ghAmountInput) || 0
    const amountPaid = parseFloat(ghAmountPaidInput) || 0
    // Guest paid more than the total charge — the difference is owed back to them.
    const status = amountPaid > amount ? 'Overpaid' : amountPaid === amount && amount > 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Unpaid'

    saveGuesthouseRentRecord({
      houseCode: selectedBooking.roomNo.startsWith('N2') ? 'NT2' : 'NT1',
      roomNo: selectedBooking.roomNo,
      guestName: selectedBooking.guestName,
      bookingId: selectedBooking.id,
      amount,
      amountPaid,
      status,
      paidDate: new Date().toISOString().split('T')[0],
      notes: ghNotesInput,
      month: selectedMonth,
      year: selectedYear,
    })

    setGhPaymentModalOpen(false)
  }

  // Export to CSV Function
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    if (activeSubTab === 'rent') {
      csvContent += 'Building,Room No,Resident,Expected Rent (INR),Owed Prev Month (INR),Units Used,Electricity Bill (INR),Total Due (INR),Paid Amount (INR),Balance (INR),Electricity Bill Paid,Notes,Status\n'
      filteredRentList.forEach((r) => {
        csvContent += `"${r.buildingCode}","${r.roomNo}","${r.residentName}",${r.rentAmount},${r.carryForwardAmount},${r.unitsUsed},${r.electricityBill},${r.totalDue},${r.amountPaid},${r.balance},"${r.electricityBillPaid ? 'Yes' : 'No'}","${r.notes}","${r.status}"\n`
      })
    } else if (activeSubTab === 'guesthouse') {
      csvContent += 'Room No,Guest Name,Stay Duration,Total Amount (INR),Paid Amount (INR),Balance (INR),Status\n'
      filteredGhFinancialList.forEach((r) => {
        csvContent += `"${r.roomNo}","${r.guestName}","${r.expectedCheckInDate} to ${r.expectedCheckOutDate}",${r.amount},${r.amountPaid},${r.balance},"${r.status}"\n`
      })
    } else {
      csvContent += 'Building,Room No,Resident,Units Allotted,Units Consumed,Rate/Unit (INR),Amount (INR),Amount Paid (INR),Status\n'
      allElecRows.forEach((r) => {
        csvContent += `"${r.buildingCode}","${r.roomNo}","${r.residentName}",${r.unitsAllotted},${r.unitsConsumed},${r.ratePerUnit},${r.amount},${r.amountPaid},"${r.status}"\n`
      })
    }

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${activeSubTab}_financial_report_${selectedMonth}_${selectedYear}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest pb-12">
      <TopBar
        searchPlaceholder="Search money flow by resident or flat number..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      <main className="mx-auto max-w-7xl px-gutter pt-24 space-y-6">
        {/* Header & Subtabs */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-outline-variant/60 pb-4">
          <div>
            <h1 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
              <Icon name="payments" className="text-primary" /> Money Management
            </h1>
            <p className="text-body-md text-secondary">
              Track rent collection, cash stays, and balances for residential flats and guesthouses.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={exportToCSV}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-label-md font-bold text-on-primary hover:bg-primary-container transition-all cursor-pointer shadow-md"
            >
              <Icon name="download" /> Export Report
            </button>
          </div>
        </div>

        {/* Month/Year Picker & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-surface border border-outline-variant/50 rounded-xl p-4 shadow-xs">
          {/* Subtabs */}
          <div className="flex border-b border-outline-variant/50 p-1 bg-surface-container-low rounded-lg shrink-0 w-fit">
            <button
              type="button"
              onClick={() => setActiveSubTab('rent')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                activeSubTab === 'rent'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name="home_work" className="text-sm" /> Residential Rent
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('guesthouse')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                activeSubTab === 'guesthouse'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name="hotel" className="text-sm" /> Guesthouse Financials
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('electricity')}
              className={`flex items-center gap-2 px-5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                activeSubTab === 'electricity'
                  ? 'bg-white text-primary shadow-sm font-bold'
                  : 'text-secondary hover:text-on-surface'
              }`}
            >
              <Icon name="bolt" className="text-sm" /> Electricity Bill
            </button>
          </div>

          {/* Date Selector & Sorting */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Sort Room:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none shadow-xs"
              >
                <option value="asc">Ascending (101 → 402)</option>
                <option value="desc">Descending (402 → 101)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Billing Period:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
                className="rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
                className="rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-primary-container/20 rounded-full text-primary shrink-0">
              <Icon name="monetization_on" className="text-2xl" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                {activeSubTab === 'electricity' ? 'Total Billed' : 'Total Expected'}
              </span>
              <span className="text-title-lg font-bold text-on-surface">
                ₹{(activeSubTab === 'rent' ? rentSummary.totalExpected : activeSubTab === 'guesthouse' ? ghSummary.totalExpected : elecSummary.totalExpected).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#f0fdf4] rounded-full text-[#15803d] shrink-0">
              <Icon name="price_check" className="text-2xl" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                {activeSubTab === 'electricity' ? 'Total Collected' : 'Collected (Cash)'}
              </span>
              <span className="text-title-lg font-bold text-on-surface">
                ₹{(activeSubTab === 'rent' ? rentSummary.totalCollected : activeSubTab === 'guesthouse' ? ghSummary.totalCollected : elecSummary.totalCollected).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant/40 rounded-xl p-5 shadow-xs flex items-center gap-4">
            <div className="p-3 bg-[#fef2f2] rounded-full text-[#b91c1c] shrink-0">
              <Icon name="pending" className="text-2xl" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider block">
                {activeSubTab === 'electricity' ? 'Total Outstanding' : 'Outstanding Balance'}
              </span>
              <span className="text-title-lg font-bold text-on-surface">
                ₹{(activeSubTab === 'rent' ? rentSummary.totalOwed : activeSubTab === 'guesthouse' ? ghSummary.totalOwed : elecSummary.totalOwed).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Table List Section */}
        {activeSubTab !== 'electricity' && (
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-xs">
          <div className="overflow-x-auto">
            {activeSubTab === 'rent' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Building</th>
                    <th className="px-6 py-4">Room No</th>
                    <th className="px-6 py-4">Resident</th>
                    <th className="px-6 py-4">Monthly Rent</th>
                    <th className="px-6 py-4">Owed Prev Month</th>
                    <th className="px-6 py-4">
                      Units Used
                      <Icon name="lock" className="text-xs align-middle ml-1 text-secondary/60" title="Locked — set in Electricity Bill tab" />
                    </th>
                    <th className="px-6 py-4">
                      Electricity Bill
                      <Icon name="lock" className="text-xs align-middle ml-1 text-secondary/60" title="Locked — auto-calculated" />
                    </th>
                    <th className="px-6 py-4">Total Due</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">
                      Balance
                      <Icon name="lock" className="text-xs align-middle ml-1 text-secondary/60" title="Locked — auto-calculated" />
                    </th>
                    <th className="px-6 py-4">
                      Electricity Bill Paid?
                      <Icon name="edit" className="text-xs align-middle ml-1 text-secondary/60" title="Editable" />
                    </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredRentList.map((row) => {
                    const rowKey = `${row.buildingCode}-${row.roomNo}`
                    return (
                    <tr key={rowKey} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold">{row.buildingCode}</td>
                      <td className="px-6 py-4 text-sm font-bold">{row.roomNo}</td>
                      <td className="px-6 py-4 text-sm">{row.residentName}</td>
                      <td className="px-6 py-4 text-sm font-medium">₹{row.rentAmount}</td>
                      <td className="px-6 py-4 text-sm text-[#b91c1c] font-medium">₹{row.carryForwardAmount}</td>
                      <td className="px-6 py-4 text-sm font-bold bg-surface-container-low/50">
                        {row.unitsUsed}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold bg-surface-container-low/50">
                        ₹{row.electricityBill.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">₹{row.totalDue}</td>
                      <td className="px-6 py-4 text-sm text-[#15803d] font-bold">₹{row.amountPaid}</td>
                      <td className="px-6 py-4 text-sm font-bold bg-surface-container-low/50">
                        ₹{row.balance.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={row.electricityBillPaid ? 'Yes' : 'No'}
                          onChange={(e) => handleElectricityPaidChange(row, e.target.value)}
                          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-bold focus:outline-none ${
                            row.electricityBillPaid
                              ? 'border-[#15803d] bg-[#f0fdf4] text-[#15803d]'
                              : 'border-[#b91c1c] bg-[#fef2f2] text-[#b91c1c]'
                          }`}
                        >
                          <option value="No">No</option>
                          <option value="Yes">Yes</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            row.status === 'Overpaid'
                              ? 'bg-[#dbeafe] text-[#1d4ed8]'
                              : row.status === 'Paid'
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : row.status === 'Partial'
                              ? 'bg-[#fef9c3] text-[#a16207]'
                              : 'bg-[#fee2e2] text-[#b91c1c]'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenPayment(row)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Icon name="payments" className="text-sm" /> Collect Payment / Edit Rent
                        </button>
                      </td>
                    </tr>
                    )
                  })}
                  {filteredRentList.length === 0 && (
                    <tr>
                      <td colSpan="13" className="px-6 py-8 text-center text-secondary italic">
                        No occupied units matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : activeSubTab === 'guesthouse' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-bold">
                    <th className="px-6 py-4">Room No</th>
                    <th className="px-6 py-4">Guest Name</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Stay Status</th>
                    <th className="px-6 py-4">Total Rent Expected</th>
                    <th className="px-6 py-4">Amount Paid</th>
                    <th className="px-6 py-4">Balance</th>
                    <th className="px-6 py-4">Payment Status</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {filteredGhFinancialList.map((row) => (
                    <tr key={row.id} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold">{row.roomNo}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{row.guestName}</td>
                      <td className="px-6 py-4 text-xs text-secondary font-medium">
                        {row.expectedCheckInDate} to {row.expectedCheckOutDate}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            row.bookingStatus === 'Occupied'
                              ? 'bg-red-100 text-red-700'
                              : row.bookingStatus === 'Checked Out'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {row.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold">₹{row.amount}</td>
                      <td className="px-6 py-4 text-sm text-[#15803d] font-bold">₹{row.amountPaid}</td>
                      <td className="px-6 py-4 text-sm font-bold">
                        {row.balance < 0 ? (
                          <span className="text-[#1d4ed8]">₹{Math.abs(row.balance)} refund due</span>
                        ) : (
                          <span className="text-[#b91c1c]">₹{row.balance}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            row.status === 'Overpaid'
                              ? 'bg-[#dbeafe] text-[#1d4ed8]'
                              : row.status === 'Paid'
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : row.status === 'Partial'
                              ? 'bg-[#fef9c3] text-[#a16207]'
                              : 'bg-[#fee2e2] text-[#b91c1c]'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleOpenGhPayment(row)}
                          className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Icon name="payments" className="text-sm" /> Set Bill / Log Cash
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredGhFinancialList.length === 0 && (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-secondary italic">
                        No guest stays matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : null}
          </div>
        </div>
        )}

        {/* ─── Electricity Bill Management ──────────────────────────────── */}
        {activeSubTab === 'electricity' && (
          <div className="space-y-4">
            {/* Controls: default rate settings + Excel import */}
            <div className="flex flex-col gap-3 rounded-xl border border-outline-variant/50 bg-surface p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Icon name="bolt" className="text-primary" />
                <span className="font-bold text-secondary">Default Rate/Unit:</span>
                <span className="font-bold text-on-surface">₹{electricitySettings.defaultRatePerUnit}/unit</span>
                <button
                  type="button"
                  onClick={() => {
                    setElecGlobalRateInput(electricitySettings.defaultRatePerUnit)
                    setElecSettingsModalOpen(true)
                  }}
                  className="ml-1 flex items-center gap-1 rounded-lg border border-outline-variant bg-white px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-surface-container-low cursor-pointer"
                >
                  <Icon name="edit" className="text-xs" /> Edit
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={elecFileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleElecFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={elecImporting}
                  onClick={() => elecFileInputRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-white px-4 py-2 text-xs font-bold text-primary hover:bg-surface-container-low cursor-pointer disabled:opacity-50"
                >
                  <Icon name="upload_file" className="text-sm" /> {elecImporting ? 'Importing…' : 'Import Excel'}
                </button>
              </div>
            </div>

            {/* Import summary */}
            {elecImportSummary && (
              <div className="rounded-xl border border-outline-variant/50 bg-surface p-4 shadow-xs text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface">
                    Import finished — {elecImportSummary.imported} of {elecImportSummary.totalRows} rows imported
                    {elecImportSummary.skipped.length > 0 && `, ${elecImportSummary.skipped.length} skipped`}
                    {elecImportSummary.fixed.length > 0 && `, ${elecImportSummary.fixed.length} auto-fixed`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setElecImportSummary(null)}
                    className="rounded-full p-1 text-secondary hover:bg-surface-container-low cursor-pointer"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
                {elecImportSummary.skipped.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-bold text-[#b91c1c]">Skipped rows:</p>
                    {elecImportSummary.skipped.map((s, i) => (
                      <p key={i} className="text-secondary">Row {s.row}: {s.reason}</p>
                    ))}
                  </div>
                )}
                {elecImportSummary.fixed.length > 0 && (
                  <div className="space-y-1">
                    <p className="font-bold text-[#a16207]">Auto-fixed rows:</p>
                    {elecImportSummary.fixed.map((f, i) => (
                      <p key={i} className="text-secondary">Row {f.row}: {f.note}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Paid / Partial / Unpaid breakdown */}
            <div className="rounded-xl border border-outline-variant bg-surface p-5 shadow-xs">
              <h3 className="mb-4 text-sm font-bold text-on-surface">Payment Status Breakdown</h3>
              <ProportionDonut data={elecStatusBreakdown} />
            </div>

            {/* Per-building tables */}
            {ELECTRICITY_BUILDINGS.map((buildingCode) => (
              <div key={buildingCode} className="overflow-hidden rounded-xl border border-outline-variant bg-surface shadow-xs">
                <div className="border-b border-outline-variant bg-surface-container-low px-6 py-3">
                  <h3 className="text-sm font-bold text-on-surface">{buildingCode} — Electricity Bills</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant bg-surface-container-low text-secondary text-xs uppercase tracking-wider font-bold">
                        <th className="px-6 py-4">Room No</th>
                        <th className="px-6 py-4">Resident</th>
                        <th className="px-6 py-4">
                          Units Allotted
                          <Icon name="edit" className="text-xs align-middle ml-1 text-secondary/60" title="Editable" />
                        </th>
                        <th className="px-6 py-4">Units Consumed</th>
                        <th className="px-6 py-4">
                          Rate/Unit
                          <Icon name="edit" className="text-xs align-middle ml-1 text-secondary/60" title="Editable" />
                        </th>
                        <th className="px-6 py-4">
                          Amount
                          <Icon name="lock" className="text-xs align-middle ml-1 text-secondary/60" title="Locked — auto-calculated" />
                        </th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Amount Paid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {electricityByBuilding[buildingCode].map((row) => {
                        const rowKey = `${row.buildingCode}-${row.roomNo}`
                        const allottedInput = elecAllottedInputs[rowKey] !== undefined ? elecAllottedInputs[rowKey] : row.unitsAllotted
                        const rateInput = elecRateInputs[rowKey] !== undefined ? elecRateInputs[rowKey] : row.ratePerUnit
                        const isRateOverride = row.ratePerUnit !== electricitySettings.defaultRatePerUnit
                        return (
                          <tr key={rowKey} className="hover:bg-surface-container-low/20 transition-colors">
                            <td className="px-6 py-4 text-sm font-bold">{row.roomNo}</td>
                            <td className="px-6 py-4 text-sm">{row.residentName}</td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                min="0"
                                value={allottedInput}
                                onChange={(e) => handleElecAllottedChange(rowKey, e.target.value)}
                                onBlur={(e) => handleElecAllottedSave(row, e.target.value)}
                                className="w-24 rounded-lg border border-[#f59e0b] bg-[#fffbeb] px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm font-bold bg-surface-container-low/50">{row.unitsConsumed}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min="0"
                                  value={rateInput}
                                  onChange={(e) => handleElecRateChange(rowKey, e.target.value)}
                                  onBlur={(e) => handleElecRateSave(row, e.target.value)}
                                  className="w-20 rounded-lg border border-[#f59e0b] bg-[#fffbeb] px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/40"
                                />
                                {isRateOverride && (
                                  <span
                                    className="rounded-full bg-primary-container/20 px-1.5 py-0.5 text-[9px] font-bold text-primary"
                                    title={`Overrides the ₹${electricitySettings.defaultRatePerUnit} global default`}
                                  >
                                    override
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold bg-surface-container-low/50">
                              ₹{row.amount.toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  row.status === 'paid'
                                    ? 'bg-[#dcfce7] text-[#15803d]'
                                    : row.status === 'partial'
                                    ? 'bg-[#fef9c3] text-[#a16207]'
                                    : 'bg-[#fee2e2] text-[#b91c1c]'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                type="button"
                                onClick={() => handleOpenElecPayments(row)}
                                className="flex items-center gap-1 text-sm font-bold text-primary hover:underline cursor-pointer"
                              >
                                ₹{row.amountPaid.toLocaleString('en-IN')}
                                <Icon name="history" className="text-sm" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      {electricityByBuilding[buildingCode].length === 0 && (
                        <tr>
                          <td colSpan="8" className="px-6 py-8 text-center text-secondary italic">
                            No occupied units matching criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ─── Collect Payment / Edit Rent Modal ────────────────────────────── */}
      {paymentModalOpen && selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col w-[420px]">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-3.5">
              <h3 className="font-bold text-on-surface">Manage Resident Rent & Payment</h3>
              <button
                type="button"
                onClick={() => setPaymentModalOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleSavePayment} className="p-5 space-y-4">
              <div className="bg-surface-container-low p-3.5 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Resident:</span>
                  <span className="font-bold text-on-surface">{selectedUnit.residentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Flat Room:</span>
                  <span className="font-bold text-on-surface">{selectedUnit.buildingCode}-{selectedUnit.roomNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Owed from Prev Month:</span>
                  <span className="font-bold text-[#b91c1c]">₹{selectedUnit.carryForwardAmount}</span>
                </div>
              </div>

              {/* 1. Monthly Rent Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Set Monthly Rent Amount (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={rentAmountInput}
                  onChange={(e) => {
                    const newRent = parseFloat(e.target.value) || 0
                    setRentAmountInput(e.target.value)
                    // Recalculate amount if Paid is selected
                    if (paymentStatusInput === 'Paid') {
                      setAmountPaidInput(newRent + selectedUnit.carryForwardAmount)
                    }
                  }}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                  placeholder="Enter rent amount..."
                  required
                />
                <p className="text-[10px] text-secondary">This rate is saved and will persist for this occupant.</p>
              </div>

              {/* 2. Payment Status Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Current Month Payment Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Paid', 'Partial', 'Unpaid'].map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => handleStatusChange(statusOption, rentAmountInput)}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                        paymentStatusInput === statusOption
                          ? 'bg-primary border-primary text-on-primary shadow-xs'
                          : 'bg-white border-outline-variant text-secondary hover:bg-surface-container-low'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Amount Paid input (Conditional on Partial status) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Cash Amount Received (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={amountPaidInput}
                  disabled={paymentStatusInput !== 'Partial'}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    paymentStatusInput !== 'Partial'
                      ? 'bg-surface-container-low border-outline-variant/40 text-secondary'
                      : 'bg-surface border-outline-variant'
                  }`}
                />
              </div>

              {/* Summary of calculations */}
              <div className="border-t border-outline-variant/40 pt-3 flex justify-between items-center text-xs">
                <div>
                  <span className="text-secondary">Total Due: </span>
                  <span className="font-bold text-on-surface">
                    ₹{(parseFloat(rentAmountInput) || 0) + selectedUnit.carryForwardAmount}
                  </span>
                </div>
                <div>
                  {(() => {
                    const bal = ((parseFloat(rentAmountInput) || 0) + selectedUnit.carryForwardAmount) - (parseFloat(amountPaidInput) || 0)
                    return bal < 0 ? (
                      <>
                        <span className="text-secondary">Refund Due to Resident: </span>
                        <span className="font-bold text-[#1d4ed8]">₹{Math.abs(bal)}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-secondary">Outstanding Balance: </span>
                        <span className="font-bold text-[#b91c1c]">₹{bal}</span>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* 4. Notes input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Notes / Comments</label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="e.g. Paid in full for current month, receipt issued"
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-bold text-secondary bg-white hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary cursor-pointer shadow-md"
                >
                  Save & Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Collect Guesthouse Stay Bill Modal ────────────────────────────── */}
      {ghPaymentModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col w-[400px]">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-3">
              <h3 className="font-bold text-on-surface">Guest billing info</h3>
              <button
                type="button"
                onClick={() => setGhPaymentModalOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleSaveGhPayment} className="p-5 space-y-4">
              <div className="bg-surface-container-low p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Guest Name:</span>
                  <span className="font-bold text-on-surface">{selectedBooking.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Room No:</span>
                  <span className="font-bold text-on-surface">{selectedBooking.roomNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Stay Period:</span>
                  <span className="font-bold text-on-surface">
                    {selectedBooking.expectedCheckInDate} to {selectedBooking.expectedCheckOutDate}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Total Rent Charge (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={ghAmountInput}
                  onChange={(e) => setGhAmountInput(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Cash Amount Received (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={ghAmountPaidInput}
                  onChange={(e) => setGhAmountPaidInput(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                />
              </div>

              {(() => {
                const bal = (parseFloat(ghAmountInput) || 0) - (parseFloat(ghAmountPaidInput) || 0)
                if (bal >= 0) return null
                return (
                  <div className="text-xs bg-[#dbeafe] text-[#1d4ed8] rounded-lg px-3 py-2 font-bold">
                    Guest overpaid — ₹{Math.abs(bal)} refund due
                  </div>
                )
              })()}

              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Notes / Remarks</label>
                <textarea
                  value={ghNotesInput}
                  onChange={(e) => setGhNotesInput(e.target.value)}
                  placeholder="e.g. Guest paid via cash check out"
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                  rows="2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGhPaymentModalOpen(false)}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-bold text-secondary bg-white hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary cursor-pointer"
                >
                  Log Bill & Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Electricity Bill: Payment History Panel ──────────────────────── */}
      {elecPaymentModalOpen && selectedElecRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col w-[420px] max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-3.5">
              <h3 className="font-bold text-on-surface">
                Payment History — {selectedElecRow.buildingCode}-{selectedElecRow.roomNo}
              </h3>
              <button
                type="button"
                onClick={() => setElecPaymentModalOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <div className="bg-surface-container-low p-3.5 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Amount Due:</span>
                  <span className="font-bold text-on-surface">₹{selectedElecRow.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Amount Paid:</span>
                  <span className="font-bold text-[#15803d]">₹{selectedElecRow.amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary font-semibold">Status:</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      selectedElecRow.status === 'paid'
                        ? 'bg-[#dcfce7] text-[#15803d]'
                        : selectedElecRow.status === 'partial'
                        ? 'bg-[#fef9c3] text-[#a16207]'
                        : 'bg-[#fee2e2] text-[#b91c1c]'
                    }`}
                  >
                    {selectedElecRow.status}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-secondary">Past Payments</p>
                {selectedElecRow.payments.length === 0 ? (
                  <p className="text-xs italic text-secondary">No payments recorded yet.</p>
                ) : (
                  <div className="max-h-40 overflow-y-auto divide-y divide-outline-variant/30 rounded-lg border border-outline-variant/40">
                    {selectedElecRow.payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 text-xs">
                        <div>
                          <p className="font-bold text-on-surface">₹{p.amount.toLocaleString('en-IN')}</p>
                          <p className="text-secondary">{p.date}{p.note ? ` — ${p.note}` : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleAddElecPayment} className="space-y-3 border-t border-outline-variant/40 pt-3">
                <p className="text-xs font-bold text-secondary">Add Payment</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount (INR)"
                    value={elecPaymentAmountInput}
                    onChange={(e) => setElecPaymentAmountInput(e.target.value)}
                    className="w-1/2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={elecPaymentDateInput}
                    onChange={(e) => setElecPaymentDateInput(e.target.value)}
                    className="w-1/2 rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Note (optional)"
                  value={elecPaymentNoteInput}
                  onChange={(e) => setElecPaymentNoteInput(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setElecPaymentModalOpen(false)}
                    className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-bold text-secondary bg-white hover:bg-surface-container cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary cursor-pointer shadow-md"
                  >
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── Electricity Bill: Global Default Rate Settings ───────────────── */}
      {elecSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col w-[360px]">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-5 py-3.5">
              <h3 className="font-bold text-on-surface">Default Rate/Unit</h3>
              <button
                type="button"
                onClick={() => setElecSettingsModalOpen(false)}
                className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high cursor-pointer"
              >
                <Icon name="close" />
              </button>
            </div>
            <form onSubmit={handleSaveGlobalRate} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-secondary">Global Rate per Unit (INR)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={elecGlobalRateInput}
                  onChange={(e) => setElecGlobalRateInput(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm focus:outline-none"
                  required
                />
                <p className="text-[10px] text-secondary">
                  Only applies to new bills going forward — existing per-flat rates keep whatever they were set/overridden to.
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setElecSettingsModalOpen(false)}
                  className="rounded-lg border border-outline-variant px-4 py-2 text-xs font-bold text-secondary bg-white hover:bg-surface-container cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-on-primary cursor-pointer shadow-md"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
