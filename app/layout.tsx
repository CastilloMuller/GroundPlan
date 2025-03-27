import Nav from '@/components/nav'
import '@/styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Grondplan Creator',
  description: 'Create and visualize floor plans',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav />
        <div className='pt-20'>
          {children}
        </div>
      </body>
    </html>
  )
}
