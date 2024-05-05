"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { ReadonlyURLSearchParams, useSearchParams } from "next/navigation"
import axios from "axios"
import { AuthStatus } from "../auth/authTypes"

export default function Verify() {
  const { token, authStatus } = useAuth()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const verificationToken: string | null = searchParams.get("token")
  const [displayMessage, setDisplayMessage] = useState<string>("")

  useEffect(() => {
    if (authStatus !== AuthStatus.Validating && token) {
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify`, { token: verificationToken })
        .then((response) => {
          setDisplayMessage("Successfully verified")
        })
        .catch((error) => {
          setDisplayMessage(error?.response?.data?.message ?? "")
        })
    }
  }, [authStatus])

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full"
      style={{
        backgroundImage: "url('/girl_waiting.webp')",
        backgroundSize: "cover",
        backgroundPosition: "50% -2%",
        backgroundRepeat: "no-repeat",
      }}
    >
    <h1 className="text-7xl text-white absolute top-32">Just one more step...</h1>

      <div
        className="border-1 rounded-xl p-8 py-24 flex flex-col gap-12 items-center justify-around absolute bottom-24 border-rose-200"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.3)",
        }}
      >
        <h2 className="text-4xl w-72 text-slate-200">Please verify your mail to continue with us !</h2>
        <button
          className="px-4 py-2 text-2xl bg-gradient-to-r-main text-white rounded-lg hover:scale-105 hover:brightness-110 border-1 duration-150"
          onClick={() => {
            axios.
          }}
        >Resend verification mail</button>

      </div>
    </div>
  )
}
