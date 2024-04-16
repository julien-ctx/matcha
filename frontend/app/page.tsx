"use client"

import { useRequireAuth } from "./auth/RequireAuth"
import { AuthStatus } from "./auth/authTypes"

export default function Home() {
  const { authStatus } = useRequireAuth()

  return (
    <div>
      {authStatus === AuthStatus.Validating ? (
        <>
          <h1>Loading...</h1>
        </>
      ) : authStatus === AuthStatus.NotValidated ? (
        <>
          <h1>public home page</h1>
        </>
      ) : authStatus === AuthStatus.Validated ? (
        <>
          <h1>my space</h1>
        </>
      ) : null}
    </div>
  )
}
