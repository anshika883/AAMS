import Icon from './Icon'

export default function TopBar({
  searchPlaceholder = 'Search residents, flats, or reports...',
  searchValue,
  onSearchChange,
  rightContent,
  showCollegeLogo = true,
  showNotificationDot = false,
}) {
  return (
    <header className="fixed top-0 right-0 z-40 ml-[260px] flex h-16 w-[calc(100%-260px)] items-center justify-between border-b border-outline-variant bg-surface px-gutter">
      <div className="flex max-w-xl flex-grow items-center gap-4">
        <div className="relative w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-10 pr-4 text-body-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
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
        <div className="mx-2 h-8 w-[1px] bg-outline-variant" />
        {rightContent ||
          (showCollegeLogo && (
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-on-surface-variant">College Logo</span>
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary">
                <Icon name="school" filled className="text-sm text-on-primary" />
              </div>
            </div>
          ))}
      </div>
    </header>
  )
}
