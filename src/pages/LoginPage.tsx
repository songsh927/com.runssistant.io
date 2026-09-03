import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useLogin } from '@/hooks/useAuth'
import { loginSchema, type LoginFormValues } from '@/utils/validation'

export default function LoginPage() {
  const { mutate, isPending, error } = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    mutate({ email: data.email, password: data.password })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">런시스턴트</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">AI 러닝 코치</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="비밀번호"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <p className="text-xs text-[var(--color-error)]">
              로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.
            </p>
          )}

          <Button type="submit" disabled={isPending} fullWidth>
            {isPending ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-text-muted)]">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-[var(--color-accent)]">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
