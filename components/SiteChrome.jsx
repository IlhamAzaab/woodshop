'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'

export default function SiteChrome({ children }) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isManagerRoute = pathname.startsWith('/manager')

  if (isAdminRoute || isManagerRoute) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
