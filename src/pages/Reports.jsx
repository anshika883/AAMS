import { useMemo, useState } from 'react'
import Page from '../components/Page'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import { IMAGES } from '../constants/images'
import { REPORT_TYPES } from '../lib/data'

function ReportTable({ type }) {
  if (type === 'building') {
    return (
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-surface-container-low/50">
          <tr>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">BUILDING NAME</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">TOTAL FLOORS</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">MANAGER</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">MAINTENANCE STATUS</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">LAST INSPECTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          <tr className="transition-colors hover:bg-surface-container-low/20">
            <td className="px-gutter py-4 text-body-md text-on-surface">Building A - North</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">4 Floors</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">John Smith</td>
            <td className="px-gutter py-4 font-medium text-green-600">Good</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Oct 12, 2023</td>
          </tr>
          <tr className="transition-colors hover:bg-surface-container-low/20">
            <td className="px-gutter py-4 text-body-md text-on-surface">Building B - South</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">6 Floors</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Sarah Johnson</td>
            <td className="px-gutter py-4 font-medium text-amber-600">Minor Repairs</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Nov 05, 2023</td>
          </tr>
        </tbody>
      </table>
    )
  }

  if (type === 'pending') {
    return (
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-surface-container-low/50">
          <tr>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">REQUEST ID</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">USER</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">REQUEST TYPE</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">DATE FILED</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">PRIORITY</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          <tr className="transition-colors hover:bg-surface-container-low/20">
            <td className="px-gutter py-4 text-body-md text-on-surface">#REQ-8291</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Michael Doe</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Transfer Request</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">2 days ago</td>
            <td className="px-gutter py-4">
              <span className="rounded bg-error px-2 py-0.5 text-[10px] font-bold text-on-primary">URGENT</span>
            </td>
          </tr>
          <tr className="transition-colors hover:bg-surface-container-low/20">
            <td className="px-gutter py-4 text-body-md text-on-surface">#REQ-8295</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Anna Lee</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">Furniture Repair</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">1 week ago</td>
            <td className="px-gutter py-4">
              <span className="rounded bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">
                NORMAL
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    )
  }

  if (type === 'furniture') {
    return (
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-10 bg-surface-container-low/50">
          <tr>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">ITEM CATEGORY</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">TOTAL QTY</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">IN USE</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">IN STOCK</th>
            <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">CONDITION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant">
          <tr className="transition-colors hover:bg-surface-container-low/20">
            <td className="px-gutter py-4 text-body-md text-on-surface">Beds &amp; Frames</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">450</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">412</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">38</td>
            <td className="px-gutter py-4 text-body-md text-green-600">Excellent</td>
          </tr>
          <tr className="transition-colors hover:bg-surface-container-low/20">
            <td className="px-gutter py-4 text-body-md text-on-surface">Study Desks</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">320</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">295</td>
            <td className="px-gutter py-4 text-body-md text-on-surface">25</td>
            <td className="px-gutter py-4 text-body-md text-amber-600">Fair</td>
          </tr>
        </tbody>
      </table>
    )
  }

  // occupancy
  return (
    <table className="w-full border-collapse text-left">
      <thead className="sticky top-0 z-10 bg-surface-container-low/50">
        <tr>
          <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">BUILDING</th>
          <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">CAPACITY</th>
          <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">OCCUPIED</th>
          <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">VACANT</th>
          <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">USAGE %</th>
          <th className="border-b border-outline-variant px-gutter py-3 text-label-sm text-on-surface-variant">STATUS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant">
        <tr className="transition-colors hover:bg-surface-container-low/20">
          <td className="px-gutter py-4 text-body-md text-on-surface">Building A - North</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">120</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">114</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">6</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">95%</td>
          <td className="px-gutter py-4">
            <span className="rounded bg-error/10 px-2 py-0.5 text-[10px] font-bold text-error">FULL</span>
          </td>
        </tr>
        <tr className="transition-colors hover:bg-surface-container-low/20">
          <td className="px-gutter py-4 text-body-md text-on-surface">Building B - South</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">150</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">120</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">30</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">80%</td>
          <td className="px-gutter py-4">
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">STABLE</span>
          </td>
        </tr>
        <tr className="transition-colors hover:bg-surface-container-low/20">
          <td className="px-gutter py-4 text-body-md text-on-surface">Staff Block C</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">45</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">39</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">6</td>
          <td className="px-gutter py-4 text-body-md text-on-surface">86%</td>
          <td className="px-gutter py-4">
            <span className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">STABLE</span>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

export default function Reports() {
  const [selected, setSelected] = useState('occupancy')
  const selectedName = useMemo(() => REPORT_TYPES.find((r) => r.id === selected)?.name ?? 'Occupancy Report', [selected])

  return (
    <>
      <TopBar
        searchPlaceholder="Search reports or residents..."
        rightContent={
          <div className="flex cursor-pointer items-center gap-3 group">
            <div className="text-right">
              <p className="font-label-md text-label-md text-on-surface">Admin User</p>
              <p className="text-[11px] text-on-surface-variant">System Administrator</p>
            </div>
            <img
              className="h-10 w-10 rounded-full border-2 border-primary-container object-cover"
              alt="Admin"
              src={IMAGES.reportsAdmin}
            />
          </div>
        }
        showCollegeLogo={false}
        showNotificationDot
      />

      <Page>
        <div className="mb-xl flex items-end justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <span>Portal</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="font-bold text-primary">System Reports</span>
            </nav>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">System Reports</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Generate and analyze real-time data for the college accommodation system.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative inline-block w-64">
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2.5 pr-10 text-body-md shadow-sm focus:border-primary focus:ring-primary"
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <Icon
                name="expand_more"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg bg-primary px-gutter py-2.5 font-label-md text-on-primary shadow-sm transition-all hover:opacity-90"
            >
              <Icon name="add_chart" />
              Create Custom Report
            </button>
          </div>
        </div>

        <div className="mb-xl grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container/10 text-primary">
              <Icon name="pie_chart" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant">Total Occupancy</h3>
            <p className="text-2xl font-bold text-on-surface">86.4%</p>
            <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-green-600">
              <Icon name="trending_up" className="text-[14px]" /> +2.4% from last month
            </div>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-secondary-container/20 text-secondary">
              <Icon name="meeting_room" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant">Vacant Units</h3>
            <p className="text-2xl font-bold text-on-surface">42 Units</p>
            <div className="mt-2 text-[11px] font-semibold text-on-surface-variant">12 Maintenance pending</div>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-error-container/20 text-error">
              <Icon name="pending_actions" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant">Pending Requests</h3>
            <p className="text-2xl font-bold text-on-surface">15 Requests</p>
            <div className="mt-2 text-[11px] font-semibold text-error">5 Critical priority</div>
          </div>
          <div className="group relative cursor-pointer overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm transition-all hover:shadow-md">
            <div className="mb-md flex h-10 w-10 items-center justify-center rounded-lg bg-tertiary-container/10 text-tertiary">
              <Icon name="inventory_2" />
            </div>
            <h3 className="mb-1 font-label-md uppercase tracking-wider text-on-surface-variant">Asset Value</h3>
            <p className="text-2xl font-bold text-on-surface">$1.2M</p>
            <div className="mt-2 text-[11px] font-semibold text-on-surface-variant">Furniture &amp; Equipment</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12">
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="flex flex-col gap-md border-b border-outline-variant bg-surface-container-low/30 p-gutter md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface">{selectedName}</h4>
                  <p className="mt-1 text-label-sm uppercase tracking-widest text-on-surface-variant">Real-time usage data</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-lg bg-surface-container p-1">
                    <button type="button" className="rounded bg-surface-container-lowest px-3 py-1.5 text-label-sm font-bold shadow-sm">
                      Current
                    </button>
                    <button type="button" className="px-3 py-1.5 text-label-sm text-on-surface-variant transition-colors hover:text-on-surface">
                      Historical
                    </button>
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-label-sm font-bold text-primary transition-all hover:bg-surface-container-low"
                  >
                    <Icon name="download" className="text-[18px]" />
                    Export
                  </button>
                </div>
              </div>

              <div className="overflow-auto">
                <ReportTable type={selected} />
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-lowest p-gutter">
                <span className="text-label-sm text-on-surface-variant">Showing results for 2023 Academic Year</span>
                <div className="flex items-center gap-2">
                  <button type="button" className="rounded border border-outline-variant px-3 py-1 transition-all hover:bg-surface-container">
                    <Icon name="chevron_left" className="text-[18px]" />
                  </button>
                  <button type="button" className="rounded border border-outline-variant bg-primary-container px-3 py-1 font-bold text-on-primary-container">
                    1
                  </button>
                  <button type="button" className="rounded border border-outline-variant px-3 py-1 transition-all hover:bg-surface-container">
                    2
                  </button>
                  <button type="button" className="rounded border border-outline-variant px-3 py-1 transition-all hover:bg-surface-container">
                    <Icon name="chevron_right" className="text-[18px]" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="group fixed bottom-gutter right-gutter z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Icon name="download" className="text-3xl" />
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded bg-inverse-surface px-3 py-1 text-body-md text-inverse-on-surface opacity-0 transition-opacity group-hover:opacity-100">
            Download Current Report
          </span>
        </button>
      </Page>
    </>
  )
}
