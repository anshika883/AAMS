import { Link } from 'react-router-dom'
import Page from '../components/Page'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import Donut from '../components/charts/Donut'
import { IMAGES } from '../constants/images'

export default function Dashboard() {
  return (
    <>
      <TopBar searchPlaceholder="Search residents, flats, or reports..." />
      <Page>
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">Dashboard</h2>
            <p className="text-body-md text-on-surface-variant">
              Real-time overview of college accommodation and occupancy metrics.
            </p>
          </div>

          <div className="mb-xl grid grid-cols-1 gap-gutter lg:grid-cols-3">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-md uppercase tracking-wider text-secondary">Residential Summary</h3>
                <Icon name="apartment" className="text-primary" />
              </div>
              <div className="space-y-4">
                <div>
                  <div className="mb-1 flex justify-between text-label-sm">
                    <span className="text-on-surface">Total Flats</span>
                    <span className="font-bold">204</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                    <div className="h-full w-1/2 bg-primary" />
                    <div className="h-full w-1/2 bg-primary-fixed-dim" />
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-secondary">
                    <span>NT1: 102</span>
                    <span>NT2: 102</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-primary-container/10 p-3">
                    <p className="text-xs text-secondary">Occupied</p>
                    <p className="text-headline-sm text-primary">185</p>
                  </div>
                  <div className="rounded-lg bg-error-container/20 p-3">
                    <p className="text-xs text-secondary">Vacant</p>
                    <p className="text-headline-sm text-error">19</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-md uppercase tracking-wider text-secondary">Reports Overview</h3>
                <Icon name="description" className="text-tertiary" />
              </div>
              <div className="flex h-[calc(100%-2.5rem)] flex-col">
                <div className="flex flex-grow flex-col justify-center">
                  <div className="mb-4 text-center">
                    <p className="text-label-sm text-secondary">Generated This Month</p>
                    <p className="text-[40px] font-bold text-on-surface">42</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded bg-surface-container-low p-2">
                      <span className="flex items-center gap-2 text-body-md">
                        <Icon name="schedule" className="text-sm text-tertiary" />
                        Scheduled
                      </span>
                      <span className="font-bold text-on-surface">12</span>
                    </div>
                    <div className="flex items-center justify-between rounded bg-surface-container-low p-2">
                      <span className="flex items-center gap-2 text-body-md">
                        <Icon name="check_circle" className="text-sm text-primary" />
                        Completed
                      </span>
                      <span className="font-bold text-on-surface">30</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-label-md uppercase tracking-wider text-secondary">Guest House Status</h3>
                <Icon name="hotel" className="text-secondary" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Donut percent={75} />
                  <div>
                    <p className="text-label-sm text-on-surface">Occupancy Rate</p>
                    <p className="text-body-md text-secondary">High demand today</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-outline-variant/30 py-2">
                    <span className="text-body-md text-secondary">Current Bookings</span>
                    <span className="font-bold text-on-surface">18 Units</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-outline-variant/30 py-2">
                    <span className="text-body-md text-secondary">Available Now</span>
                    <span className="font-bold text-primary">6 Units</span>
                  </div>
                </div>
                <Link
                  to="/guest-houses/nt1"
                  className="block w-full rounded py-1 text-center text-label-sm font-bold text-primary transition-colors hover:bg-primary-container/10"
                >
                  Manage Bookings
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
            <div className="flex flex-col gap-gutter lg:col-span-2">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Building Comparison</h3>
                <button type="button" className="text-label-md font-bold text-primary hover:underline">
                  View Detailed Map
                </button>
              </div>

              <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
                <div className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-colors duration-300 hover:border-primary">
                  <div className="relative h-32 overflow-hidden bg-surface-container">
                    <img className="h-full w-full object-cover" alt="NT1 Building" src={IMAGES.nt1Building} />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                      NT1 Building
                    </div>
                  </div>
                  <div className="p-gutter">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-label-sm uppercase tracking-tighter text-secondary">Current Occupancy</p>
                        <p className="font-headline-md text-headline-md text-on-surface">92%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-body-md font-semibold text-on-surface">102 Total Units</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-primary" /> Occupied
                        </span>
                        <span className="font-bold">94</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-outline" /> Vacant
                        </span>
                        <span className="font-bold">8</span>
                      </div>
                    </div>
                    <Link
                      to="/residential/nt1"
                      className="mt-gutter block w-full rounded-lg border border-outline-variant py-2 text-center font-bold text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      Explore Units
                    </Link>
                  </div>
                </div>

                <div className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-colors duration-300 hover:border-primary">
                  <div className="relative h-32 overflow-hidden bg-surface-container">
                    <img className="h-full w-full object-cover" alt="NT2 Building" src={IMAGES.nt2Building} />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-label-sm font-bold text-primary shadow-sm backdrop-blur-sm">
                      NT2 Building
                    </div>
                  </div>
                  <div className="p-gutter">
                    <div className="mb-4 flex items-end justify-between">
                      <div>
                        <p className="text-label-sm uppercase tracking-tighter text-secondary">Current Occupancy</p>
                        <p className="font-headline-md text-headline-md text-on-surface">89%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-body-md font-semibold text-on-surface">102 Total Units</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-primary" /> Occupied
                        </span>
                        <span className="font-bold">91</span>
                      </div>
                      <div className="flex justify-between text-body-md">
                        <span className="flex items-center gap-2 text-on-surface-variant">
                          <span className="h-2 w-2 rounded-full bg-outline" /> Vacant
                        </span>
                        <span className="font-bold">11</span>
                      </div>
                    </div>
                    <Link
                      to="/residential/nt2"
                      className="mt-gutter block w-full rounded-lg border border-outline-variant py-2 text-center font-bold text-primary transition-all hover:bg-primary hover:text-white"
                    >
                      Explore Units
                    </Link>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-primary-container bg-primary p-lg text-on-primary">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Icon name="sync_saved_locally" className="text-white" />
                  </div>
                  <div>
                    <p className="font-headline-sm text-headline-sm">Database Synced</p>
                    <p className="text-body-md opacity-80">All occupancy records are up to date as of 5 mins ago.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-white px-gutter py-2 font-bold text-primary transition-colors hover:bg-primary-fixed"
                >
                  Run Report
                </button>
              </div>
            </div>

            <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
              <div className="flex items-center justify-between border-b border-outline-variant p-gutter">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Recent Activity</h3>
                <Icon name="history" className="text-lg text-secondary" />
              </div>
              <div className="flex flex-col gap-6 overflow-y-auto p-gutter">
                <div className="relative flex gap-4">
                  <div className="absolute bottom-0 left-5 top-10 w-[1px] bg-outline-variant" />
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary-container/10">
                    <Icon name="person_add" className="text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-body-md text-on-surface">
                      <span className="font-bold">Resident Added:</span> Dr. Sharma to Flat NT1-1702
                    </p>
                    <p className="text-label-sm text-secondary">2 mins ago</p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="absolute bottom-0 left-5 top-10 w-[1px] bg-outline-variant" />
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-error/20 bg-error-container/20">
                    <Icon name="person_remove" className="text-error" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-body-md text-on-surface">
                      <span className="font-bold">Resident Removed:</span> Rajesh Kumar from NT2-504
                    </p>
                    <p className="text-label-sm text-secondary">1 hour ago</p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="absolute bottom-0 left-5 top-10 w-[1px] bg-outline-variant" />
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-outline-variant bg-surface-container-high">
                    <Icon name="door_open" className="text-on-surface-variant" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-body-md text-on-surface">
                      <span className="font-bold">Flat Vacated:</span> NT1-302
                    </p>
                    <p className="text-label-sm text-secondary">3 hours ago</p>
                  </div>
                </div>

                <div className="relative flex gap-4">
                  <div className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tertiary/20 bg-tertiary-fixed">
                    <Icon name="chair" className="text-tertiary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-body-md text-on-surface">
                      <span className="font-bold">Furniture Updated:</span> NT2-1001
                    </p>
                    <p className="text-label-sm text-secondary">Yesterday</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full py-2 text-center text-label-md font-bold text-secondary transition-colors hover:text-primary"
                >
                  View Full Audit Log
                </button>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </>
  )
}
