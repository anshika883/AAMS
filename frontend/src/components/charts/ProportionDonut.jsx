/**
 * ProportionDonut — portal-wide furniture category proportions. Multi-segment
 * SVG donut built the same way as components/charts/Donut.jsx (stacked
 * stroke-dasharray arcs), extended to N segments. Categorical hues follow the
 * fixed validated order; legend + direct % labels are always shown since two
 * of these slots (magenta, yellow) fall under the light-surface contrast
 * relief rule.
 */
const CIRCUMFERENCE = 100
const RADIUS = 15.9155
const PATH = `M18 2.0845 a ${RADIUS} ${RADIUS} 0 0 1 0 31.831 a ${RADIUS} ${RADIUS} 0 0 1 0 -31.831`

const SLOT_COLORS = ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#898781']

export default function ProportionDonut({ data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return <p className="py-8 text-center text-sm italic text-secondary">No furniture data to display.</p>
  }

  let cumulative = 0
  const segments = data.map((d, idx) => {
    const pct = (d.value / total) * 100
    const dashArray = `${pct} ${CIRCUMFERENCE - pct}`
    const dashOffset = -cumulative
    cumulative += pct
    return { ...d, pct, dashArray, dashOffset, color: SLOT_COLORS[idx % SLOT_COLORS.length] }
  })

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative h-40 w-40 shrink-0">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-surface-container"
            d={PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          {segments.map((s) => (
            <path
              key={s.type}
              d={PATH}
              fill="none"
              stroke={s.color}
              strokeWidth="4"
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-on-surface">{total}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Total Units</span>
        </div>
      </div>

      {/* Legend with direct % labels */}
      <div className="grid grid-cols-1 gap-2">
        {segments.map((s) => (
          <div key={s.type} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-semibold text-on-surface">{s.type}</span>
            <span className="font-bold text-secondary">
              {s.value} ({s.pct.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
