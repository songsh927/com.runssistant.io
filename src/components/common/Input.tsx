import { forwardRef } from 'react'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-xs font-medium text-[var(--color-text-muted)]">{label}</label>
        )}
        <input
          ref={ref}
          {...rest}
          className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors ${className}`}
        />
        {error && <p className="text-xs text-[var(--color-error)]">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'

export default Input
