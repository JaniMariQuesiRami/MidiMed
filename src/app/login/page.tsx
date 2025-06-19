import AuthForm from "@/components/authForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <AuthForm mode="login" />
    </div>
  )
}
