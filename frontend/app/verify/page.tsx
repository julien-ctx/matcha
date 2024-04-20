"use client"

import { useEffect, useState } from "react"
import { useRequireAuth } from "../auth/RequireAuth"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import axios from "axios"

export default function Verify() {
  const { token, isValidating } = useRequireAuth()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const verificationToken: string | null = searchParams.get("token")
  const [displayMessage, setDisplayMessage] = useState<string>("")

  useEffect(() => {
    if (!isValidating && token) {
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, { token: verificationToken })
        .then((response) => {
          setDisplayMessage("Successfully verified")
        })
        .catch((error) => {
          setDisplayMessage(error?.response?.data?.message ?? "")
        })
    }
  }, [isValidating])

  return (
    <>
      {isValidating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!isValidating && displayMessage && (
        <>
          <h1>{displayMessage}</h1>
        </>
      )}
    </>
  )
}
