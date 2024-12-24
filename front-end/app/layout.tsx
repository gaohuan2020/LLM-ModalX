import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'ModalX - Data Creation',
  description: 'Create and edit content in ModalX',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-y-auto bg-gray-50">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
