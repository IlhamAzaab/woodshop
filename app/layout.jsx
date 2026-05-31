import '../styles/globals.css'
import SiteChrome from '../components/SiteChrome'

export const metadata = {
  title: 'QASR | Luxury Arabic Furniture',
  description: 'Luxury Arabic-inspired modern furniture by QASR',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="overflow-x-hidden">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  )
}
