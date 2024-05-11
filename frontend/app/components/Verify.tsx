"use client"

import { useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import axios from "axios"

export default function Verify() {
  const { httpAuthHeader, logout } = useAuth()
  const [ mailSent, setMailSent ] = useState<boolean>(false)

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full"
      style={{
        backgroundImage: "url('/girl_waiting.webp')",
        backgroundSize: "cover",
        backgroundPosition: "50% -2%",
        backgroundRepeat: "no-repeat",
      }}
    >
    <h1 className="text-7xl text-white absolute top-32 w-full text-center mb-12">Just one more step...</h1>

      <div
        className="border-1 rounded-xl p-8 py-8 sm:py-16 flex flex-col gap-1 items-center justify-center absolute bottom-32 sm:bottom-40 border-rose-200"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.3)",
        }}
      >
        <h2 className="text-4xl w-72 text-slate-200 text-center mb-7">Please verify your mail to continue with us !</h2>
        {mailSent === false ? (
        <button
          className="px-4 py-2 text-2xl bg-gradient-to-r-main text-white rounded-lg hover:scale-105 hover:brightness-110 border-1 duration-150"
          onClick={() => {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-verification-email`, httpAuthHeader)
              .then(response => {
                setMailSent(true)
              }).catch(error => {
                console.error(error)
              })
          }}
        >Resend verification mail</button>        
        ) : (
          <p className="text-slate-400 text-lg">Please check your mailbox !</p>
        )}

        <button className="text-white mt-1" onClick={logout}>Logout</button>
      </div>
    </div>
  )
}
