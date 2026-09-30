import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { playTone } from '../domain/audio.ts'
import { equationText, factId, type AnswerMode } from '../domain/facts.ts'
import { isLevelUnlocked, LEVELS, levelById, levelPool, type LevelDef } from '../domain/levels.ts'
import { readPracticeSetup, type PracticeSetup } from '../domain/practiceSetup.ts'
import { createChoices } from '../domain/questions.ts'
import { rhyme, spokenQuestion, spokenRhyme } from '../domain/rhyme.ts'
import { stopSpeech } from '../domain/speech.ts'
import { startLevelSession, startPracticeSession } from '../domain/startSession.ts'
import {
  answerCurrent,
  applyAnswer,
  continueSession,
  createCard,
  createSession,
  fillQueue,
  retryDelay,
  starsForResult,
  type Session,
} from '../domain/srs.ts'
import { usePageTitle } from '../hooks/usePageTitle.ts'
import { useProgress } from '../hooks/useProgress.ts'
import { ChoiceGrid } from '../components/ChoiceGrid.tsx'
import { FoxImage } from '../components/FoxImage.tsx'
import { NumberPad } from '../components/NumberPad.tsx'
import { SpeakerButton } from '../components/SpeakerButton.tsx'
import { buttonClass } from '../components/buttonClass.ts'
import { Button, Dialog, Stars } from '../components/ui.tsx'

const COMFORT = ['再看一看', '没关系，记住它', '下次就熟悉了']

interface QuizState {
  session: Session
  choices: number[]
  draft: string
  picked: number | null
  wiggle: boolean
}

function choicesFor(session: Session, mode: AnswerMode): number[] {
  const head = session.queue[0]
  if (!head || mode !== 'choice' || session.phase !== 'asking') return []
  return createChoices(head.a, head.b, Math.random)
}

export function QuizPage({ kind }: { kind: 'practice' | 'challenge' }) {
  const params = useParams()
  const [round, setRound] = useState(0)
  const roundKey = kind === 'challenge' ? (params.id ?? 'missing') : 'practice'
  return <QuizRound key={`${kind}-${roundKey}-${round}`} kind={kind} onRestart={() => setRound((value) => value + 1)} />
}

function QuizRound({ kind, onRestart }: { kind: 'practice' | 'challenge'; onRestart: () => void }) {
  const params = useParams()
  const { data, recordAnswer, recordLevel } = useProgress()
  const level = kind === 'challenge' ? levelById(params.id ?? '') : undefined
  const setup = kind === 'practice' ? readPracticeSetup() : null
  const levelIndex = level ? LEVELS.findIndex((item) => item.id === level.id) : -1
  const starList = LEVELS.map((item) => data.levels[item.id]?.stars ?? 0)
  const locked = kind === 'challenge' && level != null && !isLevelUnlocked(levelIndex, starList)
  const ready = kind === 'practice' ? setup != null : level != null && !locked
  const answerMode: AnswerMode = kind === 'practice' ? (setup?.answer ?? 'choice') : (level?.answer ?? 'choice')
  const timed = level?.kind === 'timed'
  usePageTitle(kind === 'practice' ? '练习' : (level?.title ?? '闯关'))

  const [state, setState] = useState<QuizState>(() => initialState(kind, setup, level, locked, data.cards))
  const [leaveOpen, setLeaveOpen] = useState(false)
  const [timeUp, setTimeUp] = useState(false)
  const [remainingMs, setRemainingMs] = useState(timed && level ? level.seconds * 1000 : 0)
  const [baseline] = useState(() => (level ? data.levels[level.id] : undefined))
  const sessionRef = useRef(state.session)
  const finishedRef = useRef(false)
  const timeUpRef = useRef(false)
  const pool = level ? levelPool(level) : []

  useEffect(() => {
    sessionRef.current = state.session
  }, [state.session])

  useEffect(() => () => stopSpeech(), [])

  useEffect(() => {
    if (!ready || !timed || !level) return
    const endsAt = Date.now() + level.seconds * 1000
    const id = window.setInterval(() => {
      const left = Math.max(0, endsAt - Date.now())
      setRemainingMs(left)
      if (left > 0 || finishedRef.current) return
      window.clearInterval(id)
      timeUpRef.current = true
      setTimeUp(true)
      const snapshot: Session = { ...sessionRef.current, phase: 'done' }
      sessionRef.current = snapshot
      finishedRef.current = true
      recordLevel(level.id, starsForResult(level.kind, snapshot.correctCount, snapshot.answered), snapshot.correctCount)
      setState((current) => ({ ...current, session: snapshot }))
    }, 200)
    return () => window.clearInterval(id)
  }, [ready, timed, level, recordLevel])

  useEffect(() => {
    if (!timed || timeUp || state.session.phase !== 'feedback') return
    const session = state.session
    const id = window.setTimeout(() => {
      if (timeUpRef.current) return
      const next = continueSession(session)
      sessionRef.current = next
      if (next.phase === 'done' && level && !finishedRef.current) {
        finishedRef.current = true
        recordLevel(level.id, starsForResult(level.kind, next.correctCount, next.answered), next.correctCount)
      }
      setState((current) => ({
        ...current,
        session: next,
        choices: choicesFor(next, answerMode),
        draft: '',
        picked: null,
        wiggle: false,
      }))
    }, 1400)
    return () => window.clearTimeout(id)
  }, [timed, timeUp, state.session, answerMode, level, recordLevel])

  function finish(snapshot: Session) {
    if (finishedRef.current || kind !== 'challenge' || !level) return
    finishedRef.current = true
    recordLevel(level.id, starsForResult(level.kind, snapshot.correctCount, snapshot.answered), snapshot.correctCount)
  }

  function onContinue() {
    if (timeUpRef.current) return
    const next = continueSession(state.session)
    if (next.phase === 'done') finish(next)
    sessionRef.current = next
    setState((current) => ({
      ...current,
      session: next,
      choices: choicesFor(next, answerMode),
      draft: '',
      picked: null,
      wiggle: false,
    }))
  }

  function submit(value: number) {
    if (state.session.phase !== 'asking' || timeUpRef.current) return
    const currentFact = state.session.queue[0]
    if (!currentFact) return
    const correct = value === currentFact.a * currentFact.b
    if (data.soundOn) playTone(correct ? 'right' : 'again')
    recordAnswer(currentFact.a, currentFact.b, correct)
    const now = Date.now()
    const id = factId(currentFact.a, currentFact.b)
    const updated = applyAnswer(data.cards[id] ?? createCard(currentFact.a, currentFact.b), correct, now)
    let next = answerCurrent(state.session, correct)
    if (timed) {
      next = {
        ...next,
        queue: fillQueue(next.queue, pool, { ...data.cards, [id]: updated }, now, 4, Math.random),
      }
    }
    sessionRef.current = next
    setState((current) => ({ ...current, session: next, picked: value, wiggle: false }))
  }

  function submitDraft() {
    if (!state.draft) {
      setState((current) => ({ ...current, wiggle: true }))
      window.setTimeout(() => {
        setState((current) => ({ ...current, wiggle: false }))
      }, 280)
      return
    }
    submit(Number(state.draft))
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (leaveOpen || event.repeat || state.session.phase !== 'asking') return
      if (answerMode === 'input') {
        if (/^\d$/.test(event.key)) {
          setState((current) => {
            const next = `${current.draft}${event.key}`.replace(/^0+(\d)/, '$1')
            if (next.length > 2) return current
            return { ...current, draft: next, wiggle: false }
          })
        } else if (event.key === 'Backspace') {
          setState((current) => ({ ...current, draft: current.draft.slice(0, -1) }))
        } else if (event.key === 'Enter') {
          submitDraft()
        }
      } else if (/^[1-4]$/.test(event.key)) {
        const choice = state.choices[Number(event.key) - 1]
        if (choice != null) submit(choice)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (kind === 'practice' && !setup) {
    return <Blocked title="先选一选要练的口诀" body="选好一行，再开始。" to="/practice" action="去选择" />
  }
  if (kind === 'challenge' && !level) {
    return <Blocked title="没有这一关" body="回关卡列表看看吧。" to="/challenge" action="返回闯关" />
  }
  if (locked) {
    return <Blocked title="这一关还没打开" body="先拿到上一关的星星。" to="/challenge" action="返回闯关" />
  }

  if (state.session.phase === 'done') {
    return (
      <Summary
        kind={kind}
        level={level}
        levelIndex={levelIndex}
        session={state.session}
        timed={Boolean(timed)}
        timeUp={timeUp}
        keptStars={baseline?.stars ?? 0}
        previousBest={baseline?.bestCorrect ?? 0}
        speechOn={data.speechOn}
        onRestart={onRestart}
      />
    )
  }

  const shown = state.session.phase === 'asking' ? state.session.queue[0] : state.session.reviewing
  if (!shown) {
    return <Blocked title="这轮没有题目" body="再开始一次吧。" to={kind === 'practice' ? '/practice' : '/challenge'} action="返回" />
  }

  const product = shown.a * shown.b
  const asking = state.session.phase === 'asking'
  const retry = retryDelay(state.session)
  const questionNumber = asking ? state.session.answered + 1 : Math.max(1, state.session.answered)
  const roundSize = timed ? 0 : kind === 'challenge' && level ? level.count : setup && setup.tables.length === 1 ? 9 : 10
  const speechText = asking ? spokenQuestion(shown.a, shown.b) : spokenRhyme(shown.a, shown.b)
  const backTo = kind === 'practice' ? '/practice' : '/challenge'

  const correctLine = `答对啦！${rhyme(shown.a, shown.b)}，得 1 颗星`
  const comfortLine = COMFORT[(state.session.answered - 1) % COMFORT.length]
  const progressMax = timed && level ? level.seconds * 1000 : roundSize
  const progressValue = timed && level ? level.seconds * 1000 - remainingMs : questionNumber
  const progressPct = progressMax <= 0 ? 0 : Math.max(8, Math.min(100, (progressValue / progressMax) * 100))

  return (
    <div className="flex flex-col gap-2" style={!asking ? { paddingBottom: '10rem' } : undefined}>
      <header className="flex items-center gap-2">
        <button type="button" className="close-round" aria-label="关闭" onClick={() => setLeaveOpen(true)}>
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path d="M7 7l10 10M17 7 7 17" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
        <div
          className="quiz-track"
          role="progressbar"
          aria-label="答题进度"
          aria-valuenow={Math.round(progressValue)}
          aria-valuemin={0}
          aria-valuemax={Math.max(1, progressMax)}
        >
          <span style={{ width: `${progressPct}%` }} />
        </div>
        <p className="shrink-0 text-[0.92rem] font-bold text-[#3a2d5c]">
          {timed ? `${Math.ceil(remainingMs / 1000)} 秒` : `第 ${questionNumber} 题${roundSize > 0 ? ` / ${roundSize}` : ''}`}
        </p>
        <p className="star-chip shrink-0 px-2 text-base" aria-label={`答对 ${state.session.correctCount}`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#ffc857]" aria-hidden="true">
            <path d="m12 2.5 2.5 6.2 6.6.6-5 4.3 1.5 6.4L12 16.7 6.4 20l1.5-6.4-5-4.3 6.6-.6Z" />
          </svg>
          {state.session.correctCount}
        </p>
      </header>

      <div className="flex items-end gap-1">
        <FoxImage mood={asking || !state.session.reviewingCorrect ? 'think' : 'cheer'} className="w-[50vw] max-w-[12.5rem]" />
        <div className="mb-2 flex min-w-0 flex-1 flex-col items-stretch gap-2">
          {asking ? <p className="speech-bubble speech-side px-3 py-2 text-center text-base font-black leading-snug">这道题你一定行！</p> : <span className="h-2" />}
          <div className="self-end">
            <SpeakerButton text={speechText} enabled={data.speechOn} size="md" tone="blue" />
          </div>
        </div>
      </div>

      <p className="quiz-eq">
        {shown.a} × {shown.b} = {asking ? '?' : product}
      </p>

      <div>
        {asking && answerMode === 'input' ? (
          <div className={`mb-4 grid min-h-20 place-items-center rounded-[1.6rem] bg-white text-5xl font-black ${state.wiggle ? 'wiggle' : ''}`}>
            {state.draft || '?'}
          </div>
        ) : null}
        {asking && state.wiggle ? <p className="mb-3 text-center text-lg font-extrabold">先写一个数字</p> : null}

        {answerMode === 'choice' ? (
          <ChoiceGrid choices={state.choices} disabled={!asking} picked={asking ? null : state.picked} answer={product} onPick={submit} />
        ) : null}
        {asking && answerMode === 'input' ? (
          <NumberPad
            onDigit={(digit) => {
              setState((current) => {
                const next = `${current.draft}${digit}`.replace(/^0+(\d)/, '$1')
                if (next.length > 2) return current
                return { ...current, draft: next, wiggle: false }
              })
            }}
            onDelete={() => setState((current) => ({ ...current, draft: current.draft.slice(0, -1) }))}
            onSubmit={submitDraft}
          />
        ) : null}
      </div>

      {!asking ? (
        <div className="result-dock" role="status">
          {state.session.reviewingCorrect ? (
            <div className="ok-bar">
              <FoxImage mood="cheer" className="w-12" />
              <span className="ok-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path d="M5 12.5 9.2 17 19 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="min-w-0 flex-1 text-[0.95rem] font-black leading-snug">{correctLine}</p>
            </div>
          ) : (
            <div className="soft-bar">
              <p className="text-lg font-black">{comfortLine}</p>
              <p className="mt-1 text-base font-extrabold">{rhyme(shown.a, shown.b)}，再记一记</p>
              {state.picked != null ? (
                <p className="mt-1 text-base font-bold">
                  {answerMode === 'choice' ? '你选的是' : '你写的是'} {state.picked}
                </p>
              ) : null}
              {retry === 'now' ? <p className="mt-1 text-base font-bold">我们马上再试一次</p> : null}
              {retry === 'soon' ? <p className="mt-1 text-base font-bold">这道题一会儿还会出现</p> : null}
            </div>
          )}
          {!timed ? (
            <Button className="w-full" onClick={onContinue}>
              {state.session.queue.length === 0 ? '看结果' : '继续'}
            </Button>
          ) : (
            <p className="text-center text-base font-bold text-[#3a2d5c]">马上下一题</p>
          )}
        </div>
      ) : null}

      <Dialog
        open={leaveOpen}
        title={kind === 'challenge' ? '要离开这一关吗？' : '要离开练习吗？'}
        onClose={() => setLeaveOpen(false)}
      >
        <p className="text-lg font-bold text-muted">
          {kind === 'challenge' ? '现在离开，这一关的星星先不算。做过的题已经记下了。' : '做过的题已经记下了。'}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="white" onClick={() => setLeaveOpen(false)}>
            继续答题
          </Button>
          <Link to={backTo} className={buttonClass()}>
            离开
          </Link>
        </div>
      </Dialog>
    </div>
  )
}

function initialState(
  kind: 'practice' | 'challenge',
  setup: PracticeSetup | null,
  level: LevelDef | undefined,
  locked: boolean,
  cards: ReturnType<typeof useProgress>['data']['cards'],
): QuizState {
  if (kind === 'practice' && setup) {
    const session = startPracticeSession(setup, cards, Date.now(), Math.random)
    return { session, choices: choicesFor(session, setup.answer), draft: '', picked: null, wiggle: false }
  }
  if (kind === 'challenge' && level && !locked) {
    const session = startLevelSession(level, cards, Date.now(), Math.random)
    return { session, choices: choicesFor(session, level.answer), draft: '', picked: null, wiggle: false }
  }
  return { session: createSession([]), choices: [], draft: '', picked: null, wiggle: false }
}

function Blocked({ title, body, to, action }: { title: string; body: string; to: string; action: string }) {
  return (
    <div className="app-frame mx-auto flex min-h-dvh flex-col justify-center gap-4 px-5">
      <FoxImage mood="think" className="w-36" />
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="text-lg font-bold text-muted">{body}</p>
      <Link to={to} className={buttonClass()}>
        {action}
      </Link>
    </div>
  )
}

function Summary({
  kind,
  level,
  levelIndex,
  session,
  timed,
  timeUp,
  keptStars,
  previousBest,
  speechOn,
  onRestart,
}: {
  kind: 'practice' | 'challenge'
  level: LevelDef | undefined
  levelIndex: number
  session: Session
  timed: boolean
  timeUp: boolean
  keptStars: 0 | 1 | 2 | 3
  previousBest: number
  speechOn: boolean
  onRestart: () => void
}) {
  const earned = level ? starsForResult(level.kind, session.correctCount, session.answered) : 0
  const next = levelIndex >= 0 ? LEVELS[levelIndex + 1] : undefined
  const backTo = kind === 'practice' ? '/practice' : '/challenge'
  const mood = session.answered > 0 && session.correctCount === session.answered ? 'cheer' : session.correctCount > 0 ? 'happy' : 'think'
  const headline =
    session.answered === 0
      ? '时间到啦，这轮还没提交答案'
      : `你答对了 ${session.correctCount} 题，一共做了 ${session.answered} 题`

  return (
    <div className="pop-in app-frame mx-auto flex min-h-dvh flex-col gap-4 px-4 py-6" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
      <FoxImage mood={mood} className="w-40" />
      <h1 className="text-4xl font-black">{timed && timeUp ? '时间到' : '这轮完成啦'}</h1>
      <p className="text-xl font-extrabold">{headline}</p>
      {session.answered > 0 && session.correctCount === session.answered ? <p className="text-lg font-bold text-muted">全部答对，太厉害了！</p> : null}
      {kind === 'challenge' ? (
        <section className="rounded-[1.6rem] bg-white p-4">
          <Stars count={earned} size="lg" />
          <p className="mt-2 text-2xl font-black">{starSentence(earned)}</p>
          {keptStars > earned ? <p className="mt-1 text-lg font-bold text-muted">已经保存的最好成绩是 {keptStars} 颗星</p> : null}
          {previousBest > 0 && session.correctCount > previousBest ? <p className="mt-1 text-lg font-bold">新纪录！</p> : null}
        </section>
      ) : null}
      {session.missed.length > 0 ? (
        <section>
          <h2 className="text-2xl font-extrabold">再看这几道</h2>
          <ul className="mt-3 grid gap-2">
            {session.missed.map((fact) => (
              <li key={factId(fact.a, fact.b)} className="flex items-center justify-between gap-3 rounded-[1.4rem] bg-white px-4 py-3">
                <div>
                  <p className="text-2xl font-black">{equationText(fact.a, fact.b)}</p>
                  <p className="text-lg font-bold text-muted">{rhyme(fact.a, fact.b)}</p>
                </div>
                <SpeakerButton text={spokenRhyme(fact.a, fact.b)} enabled={speechOn} />
              </li>
            ))}
          </ul>
        </section>
      ) : session.answered > 0 ? (
        <p className="text-lg font-bold text-muted">没有错过的题。</p>
      ) : null}
      <div className="mt-auto grid gap-3">
        <Button className="w-full" onClick={onRestart}>
          再来一次
        </Button>
        {kind === 'challenge' && next && (earned >= 1 || keptStars >= 1) ? (
          <Link to={`/challenge/${next.id}`} className={buttonClass('white', 'lg', 'w-full')}>
            下一关：{next.title}
          </Link>
        ) : null}
        <Link to={backTo} className={buttonClass('white', 'lg', 'w-full')}>
          {kind === 'practice' ? '返回练习' : '返回闯关'}
        </Link>
      </div>
    </div>
  )
}

function starSentence(stars: 0 | 1 | 2 | 3): string {
  if (stars <= 0) return '这次还没有星星，再试一次就会更熟'
  if (stars === 1) return '得到 1 颗星'
  if (stars === 2) return '得到 2 颗星'
  return '得到 3 颗星，满分！'
}
