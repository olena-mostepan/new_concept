import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { ClarificationsProvider } from '@/lib/clarifications/store'
import { QuestionsProvider } from '@/lib/questions/store'
import { RaiseClarificationModal } from '@/components/clarifications/RaiseClarificationModal'
import { GlobalHomeLink } from '@/components/shared/GlobalHomeLink'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'CQuel · Workstreams concept',
  description: 'Workstream-first concept prototype',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-sans antialiased`}>
        <ClarificationsProvider>
          <QuestionsProvider>
            <GlobalHomeLink />
            {children}
            <RaiseClarificationModal />
            <Toaster position="bottom-right" />
            <Analytics />
          </QuestionsProvider>
        </ClarificationsProvider>
      </body>
    </html>
  )
}
