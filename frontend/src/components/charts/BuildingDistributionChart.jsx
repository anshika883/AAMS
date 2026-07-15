/**
 * BuildingDistributionChart — grouped bars per furniture type, one bar per
 * building (NT1 / NT2), so the building holding the most of a given type is
 * immediately visible. Categorical colors (validated pair, ΔE 9.1+/19.6+)
 * carry building identity — a legend is always shown since there are 2 series.
 */
const SERIES = [
  { key: 'NT1', label: 'NT1', color: '#2a78d6' },
  { key: 'NT2', label: 'NT2', color: '#008300' },
]

export default function BuildingDistributionChart({ data }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.NT1, d.NT2]))

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm italic text-secondary">No furniture data to display.</p>
  }

  return (
    <div>
      {/* Legend */}
      <div className="mb-4 flex items-center gap-4">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5 text-xs font-semibold text-on-surface">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {data.map((d) => (
          <div key={d.type}>
            <div className="mb-1 truncate text-xs font-semibold text-on-surface" title={d.type}>
              {d.type}
            </div>
            <div className="flex items-center gap-2">
              {SERIES.map((s) => {
                const value = d[s.key]
                const pct = Math.max(value > 0 ? 2 : 0, (value / max) * 100)
                return (
                  <div key={s.key} className="flex flex-1 items-center gap-2">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-container-low">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: s.color }}
                      />
                    </div>
                    <span className="w-6 shrink-0 text-right text-[11px] font-bold text-on-surface">{value}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
