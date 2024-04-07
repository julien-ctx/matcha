"use client"

import { useRequireAuth } from "./auth/RequireAuth"

export default function Home() {
  const { isValidating } = useRequireAuth()

  return (
    <>
      {isValidating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!isValidating && (
        <>
          <h1>Index</h1>
        </>
      )}
    </>
  )
}
