type ButtonProps = {
  children: React.ReactNode
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
}

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  onClick,
}: ButtonProps) {
  const base = 'rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-50'
  const variants = {
    primary: 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-dim)]',
    ghost: 'bg-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]',
    danger: 'bg-[var(--color-error)] text-white hover:opacity-90',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${fullWidth ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}
