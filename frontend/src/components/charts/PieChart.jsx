/**
 * PieChart — full pie (not a donut) for ranking furniture types by a single
 * measure. Sized large so it reads as the page's headline visualization.
 * Categorical hues follow the fixed validated order; a legend with direct
 * value/% labels is always shown (required relief for the magenta/yellow/aqua
 * slots, which fall under the light-surface contrast floor).
 */
const SLOT_COLORS = ['#2a78d6', '#008300', '#e87ba4', '#eda100', '#1baf7a', '#eb6834', '#898781']

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

function describeSlice(cx, cy, r, startAngle, endAngle) {
  // A slice spanning the full 360° needs a true circle path — an arc command
  // can't close a 0°-sweep gap back to its own start point.
  if (endAngle - startAngle >= 359.999) {
    return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
  }
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
}

export default function PieChart({ data, size = 260, valueLabel = 'units', maxSlices = 6 }) {
  const top = data.slice(0, maxSlices)
  const restTotal = data.slice(maxSlices).reduce((sum, d) => sum + d.value, 0)
  const slices = restTotal > 0 ? [...top, { type: 'Other', value: restTotal }] : top

  const total = slices.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return <p className="py-8 text-center text-sm italic text-secondary">No furniture data to display.</p>
  }

  const r = size / 2
  let cumulativeAngle = 0
  const segments = slices.map((d, idx) => {
    const angle = (d.value / total) * 360
    const path = describeSlice(r, r, r, cumulativeAngle, cumulativeAngle + angle)
    const pct = (d.value / total) * 100
    cumulativeAngle += angle
    return { ...d, path, pct, color: SLOT_COLORS[idx % SLOT_COLORS.length] }
  })

  return (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 drop-shadow-sm">
        {segments.map((s) => (
          <path key={s.type} d={s.path} fill={s.color} stroke="#fffcfc" strokeWidth="2" />
        ))}
      </svg>

      {/* Legend with direct value/% labels */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-1">
        {segments.map((s, idx) => (
          <div key={s.type} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-semibold text-on-surface">
              {idx === 0 && <span className="mr-1 text-primary">#1</span>}
              {s.type}
            </span>
            <span className="font-bold text-secondary">
              {s.value} {valueLabel} ({s.pct.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
