import { NavLink, Outlet } from 'react-router'
import { IconBook, IconFlag, IconHome, IconPencil, IconStar } from './icons.tsx'

const TABS = [
  { to: '/', label: '首页', end: true, icon: IconHome },
  { to: '/learn', label: '学习', end: false, icon: IconBook },
  { to: '/practice', label: '练习', end: false, icon: IconPencil },
  { to: '/challenge', label: '闯关', end: false, icon: IconFlag },
  { to: '/me', label: '进步', end: false, icon: IconStar },
]

export function AppShell() {
  return (
    <div className="mx-auto min-h-dvh max-w-lg">
      <main className="px-4 pt-5" style={{ paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-[#f0e2d0] bg-cream/95 px-1 pt-1 backdrop-blur"
        style={{ paddingBottom: 'calc(0.35rem + env(safe-area-inset-bottom))' }}
        aria-label="主要页面"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-extrabold ${
                    isActive ? 'bg-white text-ink shadow-[0_3px_0_#f0e2d0]' : 'text-muted'
                  }`
                }
              >
                <tab.icon />
                {tab.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
