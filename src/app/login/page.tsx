import AuthForm from '@/components/AuthForm'
import AuthScreenLayout from '@/components/AuthScreenLayout'

export default function LoginPage() {
  return (
    <AuthScreenLayout>
      <AuthForm mode="login" />
    </AuthScreenLayout>
  )
}
