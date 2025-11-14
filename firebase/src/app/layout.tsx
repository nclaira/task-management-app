import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'firebase crud App',
  description: 'A Firebase-powered CRUD application developed with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
       
        <header className="bg-white shadow-sm">
          <nav className="container mx-auto px-4 py-3">
              <h1 className="text-xl font-bold text-blue-600">
                TaskFlow
              </h1>
           </nav>
        </header>
       

       
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

      </body>
    </html>
  )
}