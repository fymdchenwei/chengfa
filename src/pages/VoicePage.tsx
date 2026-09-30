import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { Fox } from '../components/Fox.tsx'
import { SpeechSettings } from '../components/SpeechSettings.tsx'

export function VoicePage() {
  usePageTitle('语音设置')

  return (
    <div className="flex flex-col gap-4">
      <Link to="/me" className="inline-flex min-h-12 items-center text-lg font-extrabold">
        ‹ 返回
      </Link>
      <header className="flex items-center gap-3">
        <Fox mood="headphones" className="h-28 w-28" />
        <div>
          <h1 className="text-4xl font-black">语音设置</h1>
          <p className="mt-1 text-base font-bold text-muted">挑一个好听的中文声音</p>
        </div>
      </header>
      <SpeechSettings />
    </div>
  )
}
