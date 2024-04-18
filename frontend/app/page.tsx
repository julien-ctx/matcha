"use client"

import { useAuth } from "./auth/AuthProvider"
import { AuthStatus } from "./auth/authTypes"
import PublicHome from "./components/PublicHome"
import MySpace from "./components/MySpace"

export default function Home() {
  const { authStatus } = useAuth()

  return (
    <div className="w-full h-full">
      {authStatus === AuthStatus.Validating ? (
        <>
          <h1>Loading...</h1>
        </>
      ) : authStatus === AuthStatus.NotValidated ? (
        <PublicHome />
      ) : authStatus === AuthStatus.Validated ? (
        <MySpace />
      ) : null}
    </div>
  )
}
