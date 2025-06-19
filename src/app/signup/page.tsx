import AuthForm from '@/components/AuthForm'
import AuthScreenLayout from '@/components/AuthScreenLayout'

export default function SignupPage() {
  return (
    <AuthScreenLayout>
      <AuthForm mode="signup" />
    </AuthScreenLayout>
  )
}
