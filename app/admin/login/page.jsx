import AuthPanel from '../../../components/AuthPanel'

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-b from-qasr-night to-black px-4 py-12">
      <AuthPanel
        role="admin"
        title="Admin Login"
        subtitle="Sign in to manage products and shop operations."
      />
    </main>
  )
}
