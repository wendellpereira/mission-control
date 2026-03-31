import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Dashboard for task management, content pipeline, and team coordination',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Sidebar />
          <main className="ml-16 min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
