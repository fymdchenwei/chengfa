import { NavLink, Outlet } from 'react-router'
import { IconBook, IconFlag, IconHome, IconPencil, IconStar } from './icons.tsx'

const TABS = [
  { to: '/', label: '首页', end: true, icon: IconHome },
  { to: '/learn', label: '学习', end: false, icon: IconBook },
  { to: '/practice', label: '练习', end: false, icon: IconPencil },
  { to: '/challenge', label: '闯关', end: false, icon: IconFlag },
  { to: '/me', label: '我的', end: false, icon: IconStar },
]

export function AppShell() {
  return (
    <div className="scene mx-auto min-h-dvh max-w-lg">
      <div className="scene-sky" aria-hidden="true">
        <span className="cloud left-[8%] top-6 w-24" />
        <span className="cloud right-[6%] top-24 w-20" />
        <span className="cloud bottom-28 left-[18%] w-16 opacity-80" />
        <span className="confetti left-[12%] top-16 bg-[#ff8a3d]" />
        <span className="confetti right-[18%] top-12 bg-[#7aa7ff]" />
        <span className="confetti right-[10%] top-40 h-2 w-2 bg-[#ffc857]" />
        <span className="confetti bottom-40 left-[8%] bg-[#ff9dcb]" />
        <svg viewBox="0 0 24 24" className="sparkle absolute top-10 right-[28%] h-4 w-4 fill-[#ffc857]">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="sparkle absolute top-32 left-[22%] h-3 w-3 fill-[#7aa7ff]">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
      </div>
      <main className="relative z-10 px-4 pt-5" style={{ paddingBottom: 'calc(6.5rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <nav
        className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 bg-white/80 px-2 pt-2 backdrop-blur"
        style={{ paddingBottom: 'calc(0.45rem + env(safe-area-inset-bottom))' }}
        aria-label="主要页面"
      >
        <ul className="grid grid-cols-5">
          {TABS.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex min-h-14 flex-col items-center justify-center gap-0.5 text-sm font-extrabold ${
                    isActive ? 'tab-active' : 'text-muted'
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
