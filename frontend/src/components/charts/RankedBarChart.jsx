/**
 * RankedBarChart — horizontal bars for a single measure across categories,
 * sorted so the largest value renders first (top). Single-hue fill since it's
 * one series; rank communicates "most allotted", not color.
 */
export default function RankedBarChart({ data, valueLabel = 'units', barColor = '#9b113e' }) {
  const max = Math.max(1, ...data.map((d) => d.value))

  if (data.length === 0) {
    return <p className="py-8 text-center text-sm italic text-secondary">No furniture data to display.</p>
  }

  return (
    <div className="space-y-3">
      {data.map((d, idx) => {
        const pct = Math.max(2, (d.value / max) * 100)
        return (
          <div key={d.type} className="flex items-center gap-3">
            <span className="w-36 shrink-0 truncate text-xs font-semibold text-on-surface" title={d.type}>
              {idx === 0 && <span className="mr-1 text-primary">#1</span>}
              {d.type}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-container-low">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-xs font-bold text-on-surface">
              {d.value} {valueLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}
