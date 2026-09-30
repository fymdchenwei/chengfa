import { NavLink, Outlet, useLocation } from 'react-router'
import { IconBook, IconFlag, IconHome, IconPencil, IconStar } from './icons.tsx'

const TABS = [
  { to: '/', label: '首页', match: (path: string) => path === '/', icon: IconHome },
  { to: '/learn/1', label: '口诀', match: (path: string) => path.startsWith('/learn'), icon: IconBook },
  { to: '/practice', label: '练习', match: (path: string) => path.startsWith('/practice'), icon: IconPencil },
  { to: '/challenge', label: '闯关', match: (path: string) => path.startsWith('/challenge'), icon: IconFlag },
  { to: '/me', label: '进步', match: (path: string) => path === '/me' || path.startsWith('/voice'), icon: IconStar },
]

export function AppShell() {
  const { pathname } = useLocation()
  const home = pathname === '/'

  return (
    <div className={`scene mx-auto min-h-dvh max-w-lg ${home ? 'scene-home' : 'scene-cream'}`}>
      <div className="scene-sky" aria-hidden="true">
        {home ? (
          <>
            <span className="cloud left-[6%] top-16 w-28" />
            <span className="cloud right-[4%] top-28 w-24" />
            <span className="cloud left-[22%] top-[46%] w-20 opacity-80" />
            <span className="confetti left-[14%] top-24 h-3 w-3 rotate-12 bg-[#ff8a3d]" />
            <span className="confetti right-[16%] top-20 h-2.5 w-2.5 bg-[#7aa7ff]" />
            <span className="confetti right-[22%] top-40 h-2 w-2 bg-[#ffc857]" />
            <span className="confetti left-[10%] top-[38%] h-2.5 w-2.5 bg-[#ff9dcb]" />
            <span className="confetti right-[12%] top-[42%] h-3 w-3 bg-[#b6f3d4]" />
            <svg viewBox="0 0 24 24" className="sparkle absolute top-14 right-[30%] h-5 w-5 fill-[#ffe56a]">
              <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
            </svg>
            <svg viewBox="0 0 24 24" className="sparkle absolute top-36 left-[18%] h-4 w-4 fill-white">
              <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
            </svg>
            <svg viewBox="0 0 24 24" className="sparkle absolute top-[52%] right-[18%] h-3.5 w-3.5 fill-[#ffd0ea]">
              <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
            </svg>
          </>
        ) : (
          <>
            <span className="cloud left-[8%] top-8 w-20 opacity-70" />
            <span className="confetti right-[12%] top-16 h-2 w-2 bg-[#ffc857]" />
            <span className="confetti left-[16%] top-24 h-2 w-2 bg-[#ff9dcb]" />
          </>
        )}
      </div>
      <main className="relative z-10 px-4 pt-4" style={{ paddingBottom: 'calc(7.2rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="主要页面">
        {TABS.map((tab) => {
          const on = tab.match(pathname)
          return (
            <NavLink key={tab.label} to={tab.to} className={on ? 'tab tab-on' : 'tab'} aria-current={on ? 'page' : undefined}>
              <span className="tab-bubble">
                <tab.icon />
              </span>
              <span>{tab.label}</span>
              <span className="tab-line" />
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
