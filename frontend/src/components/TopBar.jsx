import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Icon from './Icon'

export default function TopBar({
  searchPlaceholder = 'Search residents, flats, or reports...',
  searchValue,
  onSearchChange,
  rightContent,
  showCollegeLogo = true,
  showNotificationDot = false,
}) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [localSearch, setLocalSearch] = useState('')

  // Sync localSearch with searchValue from prop, or URL param as fallback
  useEffect(() => {
    if (searchValue !== undefined) {
      setLocalSearch(searchValue)
    } else {
      const urlQuery = searchParams.get('search') || ''
      setLocalSearch(urlQuery)
    }
  }, [searchValue, searchParams])

  const handleChange = (e) => {
    const val = e.target.value
    setLocalSearch(val)
    if (onSearchChange) {
      onSearchChange(e)
    } else {
      // Automatic navigation fallback
      if (val.trim()) {
        navigate(`/?search=${encodeURIComponent(val)}`)
      } else {
        navigate('/')
      }
    }
  }

  const handleClear = () => {
    setLocalSearch('')
    if (onSearchChange) {
      onSearchChange({ target: { value: '' } })
    } else {
      navigate('/')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!onSearchChange) {
        navigate(`/?search=${encodeURIComponent(localSearch)}`)
      }
    }
  }

  return (
    <header className="fixed top-0 right-0 z-40 ml-[260px] flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-outline-variant bg-surface px-gutter gap-4 shadow-sm">
      {/* Search bar — sleek, modern pill shape, h-11, max-w-xl */}
      <div className="flex-1 min-w-0 max-w-xl">
        <div className="relative flex items-center">
          <Icon name="search" className="absolute left-4 text-outline pointer-events-none text-lg" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className="w-full h-11 rounded-full border border-outline-variant bg-surface-container-low pl-11 pr-10 text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-on-surface"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 rounded-full p-1 text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              <Icon name="close" className="text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          className="relative rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-high"
        >
          <Icon name="notifications" />
          {showNotificationDot && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />}
        </button>
        <button
          type="button"
          className="rounded-full p-2 text-on-surface-variant transition-all hover:bg-surface-container-high"
        >
          <Icon name="help_outline" />
        </button>
        <div className="mx-1 h-8 w-[1px] bg-outline-variant" />
        {rightContent ||
          (showCollegeLogo && (
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Amrita Vishwa Vidyapeetham</span>
              <img src="/amrita-logo.png" className="h-8 w-8 rounded-lg object-cover border border-outline-variant" alt="Amrita Logo" />
            </div>
          ))}
      </div>
    </header>
  )
}
