import type { Metadata } from "next"
import './globals.css'
import AuthProvider from "./contexts/AuthContext"
import Header from "./header/Header"
import { UIProvider } from "./contexts/UIContext"
import { SocialProvider } from "./contexts/SocialContext"
import { ChatProvider } from "./contexts/ChatContext"
import { TabProvider } from "./contexts/TabContext"

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
        <TabProvider>
          <SocialProvider>
            <ChatProvider>
              <html lang="en">
                <body>
                  <Header />
                  <main>
                    {children}
                  </main>
                </body>
              </html>
            </ChatProvider>
          </SocialProvider>
        </TabProvider>
      </AuthProvider>
    </UIProvider>
  )
}
