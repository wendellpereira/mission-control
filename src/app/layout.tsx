import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Dashboard for task management, content pipeline, and team coordination',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950">
        <Sidebar />
        <main className="ml-16 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
