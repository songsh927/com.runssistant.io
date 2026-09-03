interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Running Coach' }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <span className="text-lg font-semibold text-[var(--color-text)]">{title}</span>
    </header>
  )
}
