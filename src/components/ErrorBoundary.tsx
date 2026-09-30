import { Component, type ReactNode } from 'react'
import { buttonClass } from './buttonClass.ts'

interface Props {
  children: ReactNode
}

interface State {
  failed: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-3xl font-black">页面碰到了一点问题</p>
          <p className="text-lg font-bold text-muted">练习记录还在这台设备上。</p>
          <button type="button" className={buttonClass()} onClick={() => window.location.reload()}>
            重新打开
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
