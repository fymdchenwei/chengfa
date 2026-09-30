import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { playTone } from '../domain/audio.ts'
import { equationText, factId, tableColor, type AnswerMode } from '../domain/facts.ts'
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
import { Mascot } from '../components/Mascot.tsx'
import { NumberPad } from '../components/NumberPad.tsx'
import { SpeakerButton } from '../components/SpeakerButton.tsx'
import { buttonClass } from '../components/buttonClass.ts'
import { Button, Dialog, Stars } from '../components/ui.tsx'

const PRAISE = ['答对啦！', '真厉害！', '你太棒了！', '完全正确！']
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
  const speechText = asking ? spokenQuestion(shown.a, shown.b) : spokenRhyme(shown.a, shown.b)
  const backTo = kind === 'practice' ? '/practice' : '/challenge'

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 pt-4" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}>
      <header className="flex items-center justify-between gap-3">
        <button type="button" className="min-h-12 cursor-pointer rounded-full px-2 text-lg font-extrabold" onClick={() => setLeaveOpen(true)}>
          ‹ 返回
        </button>
        <p className="text-lg font-extrabold">{timed ? `剩余 ${Math.ceil(remainingMs / 1000)} 秒` : `第 ${questionNumber} 题`}</p>
        <p className="text-lg font-extrabold text-muted">答对 {state.session.correctCount}</p>
      </header>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 rounded-[1.8rem] px-4 py-8 text-center" style={{ backgroundColor: tableColor(shown.a) }}>
          <p className="text-[3.2rem] font-black leading-none tracking-tight">{shown.a} × {shown.b}</p>
          <p className="mt-3 text-2xl font-extrabold">{asking ? '等于多少？' : equationText(shown.a, shown.b)}</p>
        </div>
        <SpeakerButton text={speechText} enabled={data.speechOn} />
      </div>

      <div className="mt-4 flex-1">
        {asking && answerMode === 'input' ? (
          <div className={`mb-4 grid min-h-20 place-items-center rounded-[1.6rem] bg-white text-5xl font-black ${state.wiggle ? 'wiggle' : ''}`}>
            {state.draft || '?'}
          </div>
        ) : null}
        {asking && state.wiggle ? <p className="mb-3 text-center text-lg font-extrabold">先写一个数字</p> : null}

        {asking && answerMode === 'choice' ? (
          <ChoiceGrid choices={state.choices} disabled={false} picked={null} answer={product} onPick={submit} />
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

        {!asking ? (
          <div
            role="status"
            className={`rounded-[1.6rem] p-4 ${state.session.reviewingCorrect ? 'bg-[#b6f3d4]' : 'bg-[#ffd8c8]'}`}
          >
            <p className="text-3xl font-black">
              {state.session.reviewingCorrect
                ? PRAISE[(state.session.correctCount - 1) % PRAISE.length]
                : COMFORT[(state.session.answered - 1) % COMFORT.length]}
            </p>
            <p className="mt-2 text-4xl font-black">{equationText(shown.a, shown.b)}</p>
            <p className="mt-2 text-2xl font-extrabold">{rhyme(shown.a, shown.b)}</p>
            {!state.session.reviewingCorrect && state.picked != null ? (
              <p className="mt-2 text-lg font-bold">
                {answerMode === 'choice' ? '你选的是' : '你写的是'} {state.picked}
              </p>
            ) : null}
            {!state.session.reviewingCorrect && retry === 'now' ? <p className="mt-2 text-lg font-bold">我们马上再试一次</p> : null}
            {!state.session.reviewingCorrect && retry === 'soon' ? <p className="mt-2 text-lg font-bold">这道题一会儿还会出现</p> : null}
            {!timed ? (
              <Button className="mt-4 w-full" onClick={onContinue}>
                {state.session.queue.length === 0 ? '看结果' : '继续'}
              </Button>
            ) : (
              <p className="mt-3 text-base font-bold">马上下一题</p>
            )}
          </div>
        ) : null}
      </div>

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
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center gap-4 px-5">
      <Mascot mood="think" />
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
    <div className="pop-in mx-auto flex min-h-dvh max-w-lg flex-col gap-4 px-4 py-6" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
      <Mascot mood={mood} />
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
