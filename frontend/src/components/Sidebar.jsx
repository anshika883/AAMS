import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { IMAGES } from '../constants/images'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', to: '/' },
  {
    key: 'residential',
    label: 'Residential',
    icon: 'home_work',
    to: '/residential/nt1',
    children: [
      { label: 'NT1 Building', to: '/residential/nt1' },
      { label: 'NT2 Building', to: '/residential/nt2' },
    ],
  },
  { key: 'reports', label: 'Reports', icon: 'assessment', to: '/reports' },
  { key: 'money', label: 'Money Management', icon: 'payments', to: '/money' },
  {
    key: 'guesthouses',
    label: 'Guest Houses',
    icon: 'hotel',
    to: '/guest-houses/nt1',
    children: [
      { label: 'NT1 Guest House', to: '/guest-houses/nt1' },
      { label: 'NT2 Guest House', to: '/guest-houses/nt2' },
    ],
  },
  { key: 'settings', label: 'Settings', icon: 'settings', to: '/settings' },
]

function isActiveRoute(pathname, to) {
  if (to === '/') return pathname === '/'
  return pathname.startsWith(to.split('/').slice(0, 2).join('/'))
}

export default function Sidebar() {
  const { pathname } = useLocation()
  const [residentialOpen, setResidentialOpen] = useState(pathname.startsWith('/residential'))
  const [guestOpen, setGuestOpen] = useState(pathname.startsWith('/guest-houses'))

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-[260px] flex-col border-r border-outline-variant bg-surface-container-lowest py-lg">
      <div className="mb-xl px-gutter flex items-center gap-3">
        <img src="/amrita-logo.png" className="h-10 w-10 rounded-lg object-cover border border-outline-variant" alt="Amrita Logo" />
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary leading-tight">AMS Portal</h1>
          <p className="text-[10px] text-secondary">Accommodation Management</p>
        </div>
      </div>

      <nav className="flex-grow space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            const isParentActive = isActiveRoute(pathname, item.to)
            const isOpen = item.key === 'residential' ? residentialOpen : guestOpen
            const setOpen = item.key === 'residential' ? setResidentialOpen : setGuestOpen

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => setOpen(!isOpen)}
                  className={`flex w-full cursor-pointer items-center justify-between px-4 py-3 transition-colors duration-200 ${
                    isParentActive
                      ? 'border-r-4 border-primary bg-primary-container/10 font-bold text-primary'
                      : 'text-secondary hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon name={item.icon} filled={isParentActive} />
                    <span className="font-body-md text-body-md">{item.label}</span>
                  </div>
                  <Icon
                    name="expand_more"
                    className={`dropdown-icon text-sm transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="bg-surface-container-low/30">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `flex cursor-pointer items-center gap-3 py-2 pl-12 pr-4 transition-colors duration-200 ${
                            isActive
                              ? 'font-medium text-primary'
                              : 'text-secondary hover:bg-surface-container-low hover:text-primary'
                          }`
                        }
                      >
                        <span className="font-body-md text-body-md">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          const isActive = item.to === '/' ? pathname === '/' : pathname === item.to

          return (
            <NavLink
              key={item.key}
              to={item.to}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors duration-200 ${
                isActive
                  ? 'border-r-4 border-primary bg-primary-container/10 font-bold text-primary'
                  : 'text-secondary hover:bg-surface-container-low hover:text-primary'
              }`}
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="font-body-md text-body-md">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant px-gutter pt-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary-container">
            <img className="h-full w-full object-cover" alt="Admin User" src={IMAGES.adminAvatar} />
          </div>
          <div>
            <p className="font-label-md text-label-md text-on-surface">Admin User</p>
            <p className="text-[10px] uppercase tracking-wider text-secondary">Super Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
