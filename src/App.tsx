import { useEffect } from 'react'
import { HashRouter, Route, Routes, useLocation } from 'react-router'
import { AppShell } from './components/AppShell.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import { prepareSpeech } from './domain/speech.ts'
import { ChallengePage } from './pages/ChallengePage.tsx'
import { HomePage } from './pages/HomePage.tsx'
import { LearnPage } from './pages/LearnPage.tsx'
import { LearnRowPage } from './pages/LearnRowPage.tsx'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { PracticePage } from './pages/PracticePage.tsx'
import { ProgressPage } from './pages/ProgressPage.tsx'
import { QuizPage } from './pages/QuizPage.tsx'
import { TablePage } from './pages/TablePage.tsx'
import { ProgressProvider } from './progress.tsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function WarmSpeech() {
  useEffect(() => {
    const warm = () => prepareSpeech()
    window.addEventListener('pointerdown', warm, { once: true })
    return () => window.removeEventListener('pointerdown', warm)
  }, [])
  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <HashRouter>
          <ScrollToTop />
          <WarmSpeech />
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomePage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="learn/table" element={<TablePage />} />
              <Route path="learn/:n" element={<LearnRowPage />} />
              <Route path="practice" element={<PracticePage />} />
              <Route path="challenge" element={<ChallengePage />} />
              <Route path="me" element={<ProgressPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="practice/run" element={<QuizPage kind="practice" />} />
            <Route path="challenge/:id" element={<QuizPage kind="challenge" />} />
          </Routes>
        </HashRouter>
      </ProgressProvider>
    </ErrorBoundary>
  )
}
