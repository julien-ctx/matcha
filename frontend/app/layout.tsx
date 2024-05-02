import type { Metadata } from "next"
import './globals.css'
import AuthProvider from "./auth/AuthProvider"
import Header from "./header/Header"
import { UIProvider } from "./UIContext"

export const metadata: Metadata = {
  title: "Matcha",
  description: "Because, love too can be industrialized.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UIProvider>
      <AuthProvider>
      <html lang="en">
        <body>
          <Header />
          <main>
            {children}
          </main>
        </body>
      </html>
      </AuthProvider>
    </UIProvider>
  )
}
