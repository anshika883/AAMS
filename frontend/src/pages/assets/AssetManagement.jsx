import { useMemo, useState } from 'react'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'
import Icon from '../../components/Icon'
import PieChart from '../../components/charts/PieChart'
import BuildingDistributionChart from '../../components/charts/BuildingDistributionChart'
import ProportionDonut from '../../components/charts/ProportionDonut'
import { useAams } from '../../lib/useAams'
import { buildAssetAnalytics } from '../../lib/assetAnalytics'

export default function AssetManagement() {
  const { residentialNT1, residentialNT2, guestHouseNT1, guestHouseNT2 } = useAams()

  const [searchQuery, setSearchQuery] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('All')
  const [furnitureFilter, setFurnitureFilter] = useState('All')
  const [viewMode, setViewMode] = useState('count') // 'count' | 'flats'

  const analytics = useMemo(
    () => buildAssetAnalytics({ residentialNT1, residentialNT2, guestHouseNT1, guestHouseNT2 }),
    [residentialNT1, residentialNT2, guestHouseNT1, guestHouseNT2]
  )

  const furnitureTypeOptions = useMemo(
    () => analytics.furnitureTypeTable.map((r) => r.type),
    [analytics.furnitureTypeTable]
  )

  // Furniture Type Segregation Table — filtered by search + furniture filter
  const filteredTypeTable = useMemo(() => {
    return analytics.furnitureTypeTable.filter((row) => {
      const matchesSearch = row.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFurniture = furnitureFilter === 'All' || row.type === furnitureFilter
      return matchesSearch && matchesFurniture
    })
  }, [analytics.furnitureTypeTable, searchQuery, furnitureFilter])

  // Building-wise Breakdown Table — filtered by building + furniture type
  const filteredBreakdownTable = useMemo(() => {
    return analytics.buildingBreakdownTable.filter((row) => {
      const matchesBuilding = buildingFilter === 'All' || row.buildingCode === buildingFilter
      const matchesFurniture = furnitureFilter === 'All' || row.type === furnitureFilter
      const matchesSearch = row.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesBuilding && matchesFurniture && matchesSearch
    })
  }, [analytics.buildingBreakdownTable, buildingFilter, furnitureFilter, searchQuery])

  const rankedData = viewMode === 'count' ? analytics.rankedByCount : analytics.rankedByFlats

  return (
    <>
      <TopBar
        searchPlaceholder="Search furniture types..."
        searchValue={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
      />

      <Page>
        <div className="mb-xl flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-label-sm text-on-surface-variant">
              <span>Portal</span>
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="font-bold text-primary">Asset Management</span>
            </nav>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Asset Management</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Furniture &amp; fixtures allotted across buildings and flats — sourced live from Residential records.
            </p>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="mb-xl flex items-center gap-4 rounded-xl border border-outline-variant bg-primary-container/10 p-lg shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <Icon name="chair" className="text-2xl" />
          </div>
          <div>
            <h3 className="font-label-md uppercase tracking-wider text-on-surface-variant text-[11px]">
              Most Allotted Furniture Type
            </h3>
            {analytics.mostAllotted ? (
              <p className="text-lg font-bold text-on-surface">
                {analytics.mostAllotted.type}{' '}
                <span className="font-medium text-secondary">
                  ({analytics.mostAllotted.totalCount} units across {analytics.buildingsCoveredByMostAllotted}{' '}
                  building{analytics.buildingsCoveredByMostAllotted === 1 ? '' : 's'})
                </span>
              </p>
            ) : (
              <p className="text-lg font-bold text-on-surface">No furniture data recorded yet</p>
            )}
          </div>
        </div>

        {/* Filters/Controls */}
        <div className="mb-xl flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Building:</span>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="cursor-pointer rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none shadow-xs"
              >
                <option value="All">All Buildings</option>
                <option value="NT1">NT1</option>
                <option value="NT2">NT2</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-secondary">Furniture Type:</span>
              <select
                value={furnitureFilter}
                onChange={(e) => setFurnitureFilter(e.target.value)}
                className="cursor-pointer rounded-lg border border-outline-variant bg-white px-3 py-1.5 text-xs font-semibold focus:outline-none shadow-xs"
              >
                <option value="All">All Types</option>
                {furnitureTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-secondary">View:</span>
            <div className="flex rounded-lg bg-surface-container p-1">
              <button
                type="button"
                onClick={() => setViewMode('count')}
                className={`rounded px-3.5 py-1 text-label-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'count' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                Total Count
              </button>
              <button
                type="button"
                onClick={() => setViewMode('flats')}
                className={`rounded px-3.5 py-1 text-label-sm font-bold transition-all cursor-pointer ${
                  viewMode === 'flats' ? 'bg-white text-primary shadow-sm' : 'text-secondary hover:text-on-surface'
                }`}
              >
                No. of Flats
              </button>
            </div>
          </div>
        </div>

        {/* Visualizations */}
        <div className="mb-xl rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
          <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface">Most Allotted Furniture</h4>
          <p className="mb-6 text-label-sm text-on-surface-variant">
            Ranked by {viewMode === 'count' ? 'total units allotted' : 'number of flats/rooms'} (top 6 + Other)
          </p>
          <PieChart data={rankedData} valueLabel={viewMode === 'count' ? 'units' : 'flats'} size={300} />
        </div>

        <div className="mb-xl grid grid-cols-1 gap-gutter lg:grid-cols-2">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm">
            <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface">Distribution by Building</h4>
            <p className="mb-4 text-label-sm text-on-surface-variant">
              Top furniture types compared across NT1 and NT2
            </p>
            <BuildingDistributionChart data={analytics.buildingDistribution} />
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-gutter shadow-sm lg:col-span-2">
            <h4 className="mb-1 font-headline-sm text-headline-sm text-on-surface">Portal-wide Category Proportion</h4>
            <p className="mb-4 text-label-sm text-on-surface-variant">
              Share of total furniture units by category (top 5 + Other)
            </p>
            <ProportionDonut data={analytics.proportionData} />
          </div>
        </div>

        {/* Furniture Type Segregation Table */}
        <div className="mb-xl overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant bg-surface-container-low/30 p-gutter">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Furniture Type Segregation</h4>
          </div>
          <div className="overflow-auto max-h-[420px]">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-surface-container-low/75 backdrop-blur-xs">
                <tr className="border-b border-outline-variant/65">
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">Furniture Type</th>
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">
                    Total Count Allotted
                  </th>
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">
                    No. of Flats/Rooms
                  </th>
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">Most Present In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredTypeTable.map((row) => (
                  <tr key={row.type} className="transition-colors hover:bg-surface-container-low/30">
                    <td className="px-gutter py-4 text-body-md font-medium text-on-surface">{row.type}</td>
                    <td className="px-gutter py-4 text-body-md text-center font-bold text-primary">
                      {row.totalCount}
                    </td>
                    <td className="px-gutter py-4 text-body-md text-center text-on-surface">{row.flatsCount}</td>
                    <td className="px-gutter py-4">
                      <span className="rounded bg-[#f0fdf4] px-2 py-0.5 text-[10px] font-bold text-[#15803d] border border-[#bbf7d0]">
                        {row.mostPresentBuilding}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTypeTable.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-gutter py-12 text-center text-outline italic">
                      No furniture types match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Building-wise Breakdown Table */}
        <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
          <div className="border-b border-outline-variant bg-surface-container-low/30 p-gutter">
            <h4 className="font-headline-sm text-headline-sm text-on-surface">Building-wise Breakdown</h4>
          </div>
          <div className="overflow-auto max-h-[420px]">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-surface-container-low/75 backdrop-blur-xs">
                <tr className="border-b border-outline-variant/65">
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">Building/Block</th>
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary">Furniture Type</th>
                  <th className="px-gutter py-4 text-xs font-bold uppercase text-secondary text-center">
                    Quantity Allotted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredBreakdownTable.map((row, idx) => (
                  <tr key={`${row.block}-${row.type}-${idx}`} className="transition-colors hover:bg-surface-container-low/30">
                    <td className="px-gutter py-4 text-body-md font-medium text-on-surface">{row.block}</td>
                    <td className="px-gutter py-4 text-body-md text-on-surface">{row.type}</td>
                    <td className="px-gutter py-4 text-body-md text-center font-bold text-primary">
                      {row.quantity}
                    </td>
                  </tr>
                ))}
                {filteredBreakdownTable.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-gutter py-12 text-center text-outline italic">
                      No records match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Page>
    </>
  )
}
