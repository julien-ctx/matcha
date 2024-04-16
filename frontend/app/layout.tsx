import type { Metadata } from "next"
import './globals.css'
import '@picocss/pico'
import AuthProvider from "./auth/AuthProvider"
import Header from "./header/Header"

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
  )
}
