export default function Icon({ name, filled = false, className = '' }) {
  return (
    <span className={`material-symbols-outlined ${filled ? 'material-symbols-filled' : ''} ${className}`}>
      {name}
    </span>
  )
}
