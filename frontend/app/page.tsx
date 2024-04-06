"use client"

import { useRequireAuth } from "./auth/RequireAuth"

export default function Home() {
  useRequireAuth()

  return (
    <>
      <h1>Index</h1>
    </>
  )
}
