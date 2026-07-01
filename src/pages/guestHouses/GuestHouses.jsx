import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import { IMAGES } from '../../constants/images'

function InventoryRow({ floor, room, chips, actionIcon }) {
  return (
    <tr className="transition-colors hover:bg-surface-container-low/30">
      <td className="px-lg py-4 text-body-md text-on-surface-variant">{floor}</td>
      <td className="px-lg py-4 text-body-md font-bold text-primary">{room}</td>
      <td className="px-lg py-4">
        {chips === 'NIL' ? (
          <span className="text-body-md italic text-outline">NIL</span>
        ) : (
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-outline-variant bg-secondary-container/50 px-2 py-0.5 text-[11px] font-bold text-on-secondary-container"
              >
                {c}
              </span>
            ))}
          </div>
        )}
      </td>
      <td className="px-lg py-4 text-right">
        <button type="button" className="rounded-full p-2 text-primary transition-colors hover:bg-primary/10">
          <Icon name={actionIcon} className="text-[20px]" />
        </button>
      </td>
    </tr>
  )
}

export default function GuestHouses() {
  const { houseCode } = useParams()
  const code = String(houseCode ?? 'nt1').toUpperCase()

  const rows = useMemo(() => {
    if (code === 'NT2') {
      return [
        { floor: '1st Floor', room: 'N2-101', chips: ['Sofa Set', 'Executive Desk'], actionIcon: 'edit' },
        { floor: '2nd Floor', room: 'N2-205', chips: ['Twin Beds'], actionIcon: 'edit' },
        { floor: '3rd Floor', room: 'N2-Penthouse', chips: 'NIL', actionIcon: 'warning' },
      ]
    }
    return [
      { floor: 'Ground Floor', room: 'G-01', chips: ['King Bed', 'Study Table', 'Armchair', 'Wardrobe'], actionIcon: 'edit' },
      { floor: 'Ground Floor', room: 'G-02', chips: ['King Bed', 'Mini Fridge'], actionIcon: 'edit' },
      { floor: '1st Floor', room: '101', chips: 'NIL', actionIcon: 'add_circle' },
      { floor: '1st Floor', room: '102', chips: ['Queen Bed (x2)', 'Coffee Table'], actionIcon: 'edit' },
      { floor: '2nd Floor', room: '201', chips: ['Single Bed', 'Dressing Mirror'], actionIcon: 'edit' },
      { floor: '2nd Floor', room: '202', chips: 'NIL', actionIcon: 'add_circle' },
    ]
  }, [code])

  return (
    <>
      <TopBar searchPlaceholder="Search rooms or facilities..." rightContent={<img className="h-8 w-8 rounded-full object-cover ring-2 ring-primary-fixed" alt="Admin" src={IMAGES.guestHouseAdmin} />} />
      <main className="ml-[260px] mt-16 min-h-screen p-xl">
        <div className="mx-auto max-w-7xl space-y-lg">
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-lg md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Icon name="hotel" className="text-[18px]" />
                <span className="text-label-sm uppercase tracking-wider">Guest Accommodation</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">{code} Guest House</h2>
              <p className="mt-1 text-body-md text-secondary">Manage room inventory, furniture tracking, and floor assignments.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container px-4 py-2 text-label-md text-on-surface transition-all hover:bg-surface-container-high"
              >
                <Icon name="download" className="text-[20px]" />
                Export List
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-label-md text-on-primary shadow-sm transition-all hover:opacity-90"
              >
                <Icon name="add_home" className="text-[20px]" />
                Add New Room
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-lg md:grid-cols-4">
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary">Total Rooms</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">48</span>
                <span className="text-label-sm text-primary">+2 New</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary">Occupancy Rate</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">82%</span>
                <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full w-[82%] bg-primary" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary">Maintenance Log</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-error">3</span>
                <span className="rounded bg-error-container px-2 py-1 text-label-sm text-error">Action Required</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <span className="text-label-sm text-secondary">Total Floors</span>
              <div className="flex items-end justify-between">
                <span className="text-headline-md font-headline-md text-on-surface">4</span>
                <span className="text-label-sm text-secondary">G to 3rd</span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low/20 px-lg py-4">
              <div className="flex items-center gap-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Inventory Matrix</h3>
                <div className="flex rounded-lg bg-surface-container-high p-1">
                  <button type="button" className="rounded-md bg-white px-3 py-1 text-label-sm font-bold text-primary shadow-sm">
                    All Floors
                  </button>
                  <button type="button" className="px-3 py-1 text-label-sm text-secondary transition-colors hover:text-on-surface">
                    1st Floor
                  </button>
                  <button type="button" className="px-3 py-1 text-label-sm text-secondary transition-colors hover:text-on-surface">
                    2nd Floor
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-label-sm text-secondary">Sort by:</span>
                <select className="cursor-pointer bg-transparent text-label-sm font-bold text-on-surface focus:ring-0">
                  <option>Room No. Asc</option>
                  <option>Room No. Desc</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/10">
                    <th className="border-b border-outline-variant px-lg py-4 text-left text-label-sm text-secondary">Floor No.</th>
                    <th className="border-b border-outline-variant px-lg py-4 text-left text-label-sm text-secondary">Room No.</th>
                    <th className="border-b border-outline-variant px-lg py-4 text-left text-label-sm text-secondary">Furniture Inventory</th>
                    <th className="border-b border-outline-variant px-lg py-4 text-right text-label-sm text-secondary">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {rows.map((r) => (
                    <InventoryRow key={r.room} floor={r.floor} room={r.room} chips={r.chips} actionIcon={r.actionIcon} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/20 px-lg py-4">
              <p className="text-label-sm text-secondary">Showing 6 of 48 rooms</p>
              <div className="flex gap-2">
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-white text-secondary transition-colors hover:text-primary">
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary text-xs font-bold text-on-primary">
                  1
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-white text-xs font-bold text-secondary transition-colors hover:text-primary">
                  2
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-white text-xs font-bold text-secondary transition-colors hover:text-primary">
                  3
                </button>
                <button type="button" className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant bg-white text-secondary transition-colors hover:text-primary">
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 opacity-60">
            <p className="text-label-sm text-secondary">Last updated: Oct 24, 2023, 11:45 AM</p>
            <div className="flex gap-4">
              <Link className="text-label-sm text-secondary underline hover:text-primary" to="#">
                Privacy Policy
              </Link>
              <Link className="text-label-sm text-secondary underline hover:text-primary" to="#">
                Internal Guidelines
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
