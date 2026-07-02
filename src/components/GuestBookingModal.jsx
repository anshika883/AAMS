import { useState, useEffect } from 'react'
import Icon from './Icon'

export default function GuestBookingModal({ isOpen, onClose, rooms, onSave }) {
  const [guestName, setGuestName] = useState('')
  const [roomNo, setRoomNo] = useState('')
  const [expectedCheckInDate, setExpectedCheckInDate] = useState('')
  const [expectedCheckOutDate, setExpectedCheckOutDate] = useState('')
  const [error, setError] = useState('')

  // Filter available rooms
  const availableRooms = rooms.filter((r) => r.status === 'Available')

  useEffect(() => {
    if (isOpen) {
      setGuestName('')
      const av = rooms.filter((r) => r.status === 'Available')
      setRoomNo(av[0]?.roomNo || '')
      setError('')
      
      // Default dates to today and tomorrow
      const today = new Date().toISOString().split('T')[0]
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      setExpectedCheckInDate(today)
      setExpectedCheckOutDate(tomorrow)
    }
  }, [isOpen, rooms])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!guestName.trim()) {
      setError('Guest Name is required.')
      return
    }

    if (!roomNo) {
      setError('An available room must be selected.')
      return
    }

    if (!expectedCheckInDate || !expectedCheckOutDate) {
      setError('Both Expected Check-in and Check-out dates are required.')
      return
    }

    const checkIn = new Date(expectedCheckInDate)
    const checkOut = new Date(expectedCheckOutDate)

    if (checkOut <= checkIn) {
      setError('Expected Check-out date must be after the Check-in date.')
      return
    }

    onSave({
      guestName: guestName.trim(),
      roomNo,
      expectedCheckInDate,
      expectedCheckOutDate,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col" style={{ width: '450px', maxWidth: '95vw' }}>
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4">
          <div className="flex items-center gap-2">
            <Icon name="bookmark_add" className="text-primary" />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Create Guest Booking
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
          {error && (
            <div className="rounded bg-error-container/20 border border-error/20 p-3 text-sm text-error font-semibold flex items-center gap-2">
              <Icon name="error_outline" />
              {error}
            </div>
          )}

          {/* Guest Name Input */}
          <div className="space-y-1">
            <label htmlFor="guestName" className="text-label-sm uppercase tracking-wider text-secondary">
              Guest Name
            </label>
            <input
              type="text"
              id="guestName"
              required
              placeholder="Enter full name of the guest"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
            />
          </div>

          {/* Room Selection */}
          <div className="space-y-1">
            <label htmlFor="roomNoSelect" className="text-label-sm uppercase tracking-wider text-secondary">
              Select Available Room
            </label>
            <select
              id="roomNoSelect"
              required
              value={roomNo}
              onChange={(e) => setRoomNo(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-2 text-body-md focus:border-primary focus:outline-none"
            >
              {availableRooms.length === 0 ? (
                <option value="">No available rooms right now</option>
              ) : (
                availableRooms.map((r) => (
                  <option key={r.roomNo} value={r.roomNo}>
                    Room {r.roomNo} ({r.floor})
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Expected Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="checkInDate" className="text-label-sm uppercase tracking-wider text-secondary">
                Expected Check-in
              </label>
              <input
                type="date"
                id="checkInDate"
                required
                value={expectedCheckInDate}
                onChange={(e) => setExpectedCheckInDate(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="checkOutDate" className="text-label-sm uppercase tracking-wider text-secondary">
                Expected Check-out
              </label>
              <input
                type="date"
                id="checkOutDate"
                required
                value={expectedCheckOutDate}
                onChange={(e) => setExpectedCheckOutDate(e.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md focus:border-primary focus:outline-none"
              />
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
              disabled={availableRooms.length === 0}
              className="rounded-lg bg-primary px-5 py-2.5 text-label-md font-bold text-on-primary shadow-md hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
