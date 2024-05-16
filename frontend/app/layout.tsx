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
                <head>
                  <link rel="icon" href="/favicon.svg" />
                </head>
                <body>
                  <Header />
                  <main>
                    {children}
                  </main>
                  <footer className="w-full h-14 bg-slate-950 px-4 relative flex items-center">
                    <div className="text-white text-sm flex w-full">
                      <p>made by</p>
                      <a href="https://github.com/mgkgng" className="footer-anchor">min-kang</a>
                      <p>and</p>
                      <a href="https://github.com/julien-ctx" className="footer-anchor">jcauchet</a>
                    </div>

                    <p className="absolute top-1/2 right-4 text-white -translate-y-1/2">matcha</p>
                  </footer>
                </body>
              </html>
            </ChatProvider>
          </SocialProvider>
        </TabProvider>
      </AuthProvider>
    </UIProvider>
  )
}
