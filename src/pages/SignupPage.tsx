import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import { useSignup } from '@/hooks/useAuth'
import { signupSchema, type SignupFormValues } from '@/utils/validation'

export default function SignupPage() {
  const { mutate, isPending, error } = useSignup()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = (data: SignupFormValues) => {
    mutate({ name: data.name, email: data.email, password: data.password, location: data.location })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--color-bg)] p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-text)]">회원가입</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">런시스턴트 시작하기</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="이름"
            type="text"
            placeholder="홍길동"
            error={errors.name?.message}
            {...register('name')}
          />
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
            placeholder="8자 이상"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="지역 (선택)"
            type="text"
            placeholder="서울"
            error={errors.location?.message}
            {...register('location')}
          />
          {error && (
            <p className="text-xs text-[var(--color-error)]">
              회원가입에 실패했습니다. 이미 사용 중인 이메일일 수 있습니다.
            </p>
          )}
          <Button type="submit" disabled={isPending} fullWidth>
            {isPending ? '가입 중...' : '회원가입'}
          </Button>
        </form>
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-[var(--color-accent)]">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
