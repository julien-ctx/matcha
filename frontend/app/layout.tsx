import type { Metadata } from "next"
import './globals.css'
import AuthProvider from "./auth/AuthProvider"
import Header from "./header/Header"
import { UIProvider } from "./contexts/UIContext"
import { SocialProvider } from "./contexts/SocialContext"

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
        <SocialProvider>
          <html lang="en">
            <body>
              <Header />
              <main>
                {children}
              </main>
            </body>
          </html>
        </SocialProvider>
      </AuthProvider>
    </UIProvider>
  )
}
