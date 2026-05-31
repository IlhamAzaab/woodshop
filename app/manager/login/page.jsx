import AuthPanel from '../../../components/AuthPanel'

export default function ManagerLogin() {
  return (
    <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-gradient-to-b from-qasr-night to-black px-4 py-12">
      <AuthPanel
        role="manager"
        title="Manager Login"
        subtitle="Owner access to dashboards, analytics, and admin control."
      />
    </main>
  )
}
