export default function Donut({ percent = 75, label }) {
  const dash = `${Math.max(0, Math.min(100, percent))}, 100`

  return (
    <div className="relative h-16 w-16">
      <svg className="h-full w-full" viewBox="0 0 36 36">
        <path
          className="text-surface-container"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="text-primary"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={dash}
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
        {label ?? `${percent}%`}
      </div>
    </div>
  )
}
