import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
    return { hasError: true, message }
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-[var(--color-bg)] p-8 text-center">
          <p className="text-4xl">⚠️</p>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-semibold text-[var(--color-text)]">오류가 발생했습니다</p>
            <p className="text-sm text-[var(--color-text-muted)]">{this.state.message}</p>
          </div>
          <button
            onClick={this.handleReload}
            className="min-h-[44px] rounded-xl bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[var(--color-bg)]"
          >
            새로고침
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
