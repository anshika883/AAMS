import { useMemo } from 'react'
import Icon from './Icon'
import { useAams } from '../lib/useAams'

export default function RoomHistoryModal({ isOpen, onClose, roomNo, isGuesthouse }) {
  const { bookings } = useAams()

  const roomBookings = useMemo(() => {
    if (!roomNo) return []
    const target = roomNo.toUpperCase()
    return bookings
      .filter((b) => {
        const bRoom = b.roomNo.toUpperCase()
        return bRoom === target || bRoom.startsWith(target)
      })
      .sort((a, b) => b.bookingDate.localeCompare(a.bookingDate))
  }, [bookings, roomNo])

  if (!isOpen || !roomNo) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-inverse-surface/40 p-4 backdrop-blur-sm animate-fade-in">
      <div
        className="max-h-[85vh] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl flex flex-col transition-all duration-300"
        style={{ width: '520px', maxWidth: '95vw' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container px-6 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <Icon name="history" className="text-primary" />
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                Room Booking History
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Flat: <strong className="text-primary font-bold">{roomNo}</strong> {isGuesthouse ? '(Guesthouse)' : '(Residential)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {roomBookings.length === 0 ? (
            <div className="text-center py-12 text-outline italic space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-secondary">
                <Icon name="event_busy" className="text-xl" />
              </div>
              <p className="text-sm font-medium">No guesthouse booking history found for this room.</p>
              <p className="text-xs text-outline">
                Bookings created through the Guest Houses tab will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 border-b border-outline-variant/40 pb-2">
                <span>Stays Log ({roomBookings.length})</span>
              </h4>
              <div className="space-y-3">
                {roomBookings.map((b) => {
                  let statusBg = 'bg-gray-100 text-gray-700 border-gray-200'
                  let dotColor = 'bg-gray-400'
                  
                  if (b.bookingStatus === 'Occupied') {
                    statusBg = 'bg-red-50 text-red-700 border-red-200'
                    dotColor = 'bg-red-500'
                  } else if (b.bookingStatus === 'Reserved') {
                    statusBg = 'bg-blue-50 text-blue-700 border-blue-200'
                    dotColor = 'bg-blue-500'
                  } else if (b.bookingStatus === 'Checked Out') {
                    statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    dotColor = 'bg-emerald-500'
                  }

                  return (
                    <div
                      key={b.id}
                      className="rounded-xl border border-outline-variant/60 bg-surface-container-low p-4 space-y-2 hover:bg-surface-container transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-on-surface text-sm flex items-center gap-1">
                            <Icon name="person" className="text-sm text-primary" />
                            {b.guestName}
                          </p>
                          {b.guestStatus && (
                            <p className="text-[10px] text-secondary font-semibold uppercase tracking-wider mt-0.5">
                              {b.guestStatus}
                            </p>
                          )}
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBg}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                          {b.bookingStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-outline-variant/20 mt-1">
                        <div>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Expected Check-In</span>
                          <span className="font-medium text-on-surface">{b.expectedCheckInDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Expected Check-Out</span>
                          <span className="font-medium text-on-surface">{b.expectedCheckOutDate}</span>
                        </div>
                      </div>

                      {b.actualCheckInDateTime && (
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-1 bg-surface-container-highest/30 rounded px-2 py-1 mt-1">
                          <Icon name="login" className="text-xs text-secondary" />
                          <span>Checked in: {new Date(b.actualCheckInDateTime).toLocaleString()}</span>
                        </div>
                      )}
                      
                      {b.actualCheckOutDateTime && (
                        <div className="text-[11px] text-on-surface-variant flex items-center gap-1 bg-surface-container-highest/30 rounded px-2 py-1">
                          <Icon name="logout" className="text-xs text-secondary" />
                          <span>Checked out: {new Date(b.actualCheckOutDateTime).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-outline-variant bg-surface-container px-6 py-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant px-5 py-2 text-label-md font-bold text-secondary bg-white transition-colors hover:bg-surface-container cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
