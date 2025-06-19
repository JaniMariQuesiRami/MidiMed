import AuthForm from "@/components/authForm"

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <AuthForm mode="signup" />
    </div>
  )
}
