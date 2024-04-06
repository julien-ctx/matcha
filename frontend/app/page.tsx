"use client"

import { useEffect, useState } from "react"
import { useRequireAuth } from "./auth/RequireAuth"

export default function Home() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const token = useRequireAuth()

  useEffect(() => {
    if (token) {
      setIsLoading(false)
    }
  }, [token])

  return (
    <>
      {isLoading && (
        <>
          <h1>Loading...</h1>
        </>
      )}
     {!isLoading && (
        <>
          <h1>Index</h1>
        </>
      )}
    </>
  )
}
