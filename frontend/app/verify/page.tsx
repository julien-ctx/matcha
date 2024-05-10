"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { ReadonlyURLSearchParams, useSearchParams, useRouter } from "next/navigation"
import axios from "axios"
import { AuthStatus } from "../auth/authTypes"

export default function Verify() {
  const { token, authStatus } = useAuth()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const verificationToken: string | null = searchParams.get("token")
  const [displayMessage, setDisplayMessage] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    if (authStatus !== AuthStatus.Validating && token) {
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, { token: verificationToken })
        .then((response) => {
          setDisplayMessage("Successfully verified")
          router.push('/')
        })
        .catch((error) => {
          setDisplayMessage(error?.response?.data?.message ?? "")
        })
    }
  }, [authStatus])

  return (
    <>
      {authStatus === AuthStatus.Validating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {authStatus !== AuthStatus.Validating && displayMessage && (
        <>
          <h1>{displayMessage}</h1>
        </>
      )}
    </>
  )
}
