import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import DashboardShell from '../../components/DashboardShell'
import { getLoginPath } from '../../lib/auth'
import { getSessionProfile } from '../../lib/auth-server'

export default async function AdminLayout({ children }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  if (pathname.endsWith('/login')) {
    return <>{children}</>
  }

  const { profile } = await getSessionProfile()

  if (!profile) {
    return <DashboardShell role="admin">{children}</DashboardShell>
  }

  if (profile.role !== 'admin') {
    redirect(getLoginPath('admin'))
  }

  return <DashboardShell role="admin">{children}</DashboardShell>
}
