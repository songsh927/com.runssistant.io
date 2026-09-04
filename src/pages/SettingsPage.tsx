import { Link } from 'react-router-dom'
import { useLogout } from '@/hooks/useAuth'
import { useAuthStore } from '@/stores/authStore'
import { useProfile } from '@/hooks/useProfile'

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문',
  novice: '초급',
  intermediate: '중급',
  advanced: '상급',
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const { data: profile } = useProfile()

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-'

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      <section className="rounded-2xl bg-[var(--color-surface)] p-5">
        <h2 className="mb-4 text-xs font-semibold text-[var(--color-text-muted)]">프로필</h2>
        <div className="flex flex-col gap-3">
          <ProfileRow label="이름" value={user?.name ?? '-'} />
          <ProfileRow label="이메일" value={user?.email ?? '-'} />
          <ProfileRow label="위치" value={user?.location ?? '위치 미설정'} />
          <ProfileRow label="가입일" value={memberSince} />
        </div>
      </section>

      <section className="rounded-2xl bg-[var(--color-surface)] p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)]">러너 프로필</h2>
          <Link
            to="/settings/profile"
            className="min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--color-accent)]"
          >
            수정
          </Link>
        </div>
        {profile ? (
          <div className="flex flex-col gap-2">
            <ProfileRow
              label="경험"
              value={`${LEVEL_LABELS[profile.experience.level] ?? profile.experience.level} · 주 ${profile.experience.runs_per_week}회`}
            />
            <ProfileRow label="선호 타입" value={profile.training.preferred_types.join(', ')} />
            <ProfileRow
              label="크로스 트레이닝"
              value={profile.cross_training.length ? `${profile.cross_training.length}종` : '없음'}
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--color-text-muted)]">프로필 정보 없음</p>
        )}
      </section>

      <button
        onClick={logout}
        className="min-h-[44px] w-full rounded-2xl border border-[var(--color-error)] py-3 text-sm font-semibold text-[var(--color-error)] transition-colors hover:bg-[var(--color-error)] hover:text-white"
      >
        로그아웃
      </button>
    </div>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--color-surface-2)] pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--color-text)]">{value}</span>
    </div>
  )
}
