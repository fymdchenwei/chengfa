import { NavLink, Outlet, useLocation } from 'react-router'
import { IconBook, IconHome, IconPencil, IconStar, IconTrophy } from './icons.tsx'

const TABS = [
  { to: '/', label: '首页', match: (path: string) => path === '/', icon: IconHome },
  { to: '/learn/1', label: '口诀', match: (path: string) => path.startsWith('/learn'), icon: IconBook },
  { to: '/practice', label: '练习', match: (path: string) => path.startsWith('/practice'), icon: IconPencil },
  { to: '/challenge', label: '闯关', match: (path: string) => path.startsWith('/challenge'), icon: IconTrophy },
  { to: '/me', label: '进步', match: (path: string) => path === '/me' || path.startsWith('/voice'), icon: IconStar },
]

function sceneName(pathname: string): string {
  if (pathname === '/') return 'scene-home'
  if (pathname === '/voice') return 'scene-voice'
  if (pathname.startsWith('/learn')) return 'scene-learn'
  if (pathname.startsWith('/practice/run') || /^\/challenge\/.+/.test(pathname)) return 'scene-quiz'
  return 'scene-cream'
}

export function AppShell() {
  const { pathname } = useLocation()
  const scene = sceneName(pathname)

  return (
    <div className={`scene app-frame mx-auto min-h-dvh ${scene}`}>
      <div className="scene-sky" aria-hidden="true">
        <span className="cloud left-[6%] top-14 w-28" />
        <span className="cloud right-[4%] top-24 w-24" />
        <span className="cloud left-[28%] top-[42%] w-20 opacity-80" />
        <span className="confetti left-[14%] top-20 h-3 w-3 rotate-12 bg-[#ff8a3d]" />
        <span className="confetti right-[16%] top-16 h-2.5 w-2.5 bg-[#7aa7ff]" />
        <span className="confetti right-[22%] top-36 h-2 w-2 bg-[#ffc857]" />
        <span className="confetti left-[10%] top-[34%] h-2.5 w-2.5 bg-[#ff9dcb]" />
        <svg viewBox="0 0 24 24" className="sparkle absolute top-12 right-[28%] h-5 w-5 fill-[#ffe56a]">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="sparkle absolute top-32 left-[16%] h-4 w-4 fill-white">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
        <svg viewBox="0 0 24 24" className="sparkle absolute top-[48%] right-[14%] h-3.5 w-3.5 fill-[#ffd0ea]">
          <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
        </svg>
      </div>
      <main className="relative z-10 px-4 pt-3" style={{ paddingBottom: 'calc(7.2rem + env(safe-area-inset-bottom))' }}>
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="主要页面" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
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
