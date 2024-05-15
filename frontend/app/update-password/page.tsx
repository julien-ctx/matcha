"use client"

import React, { useState } from "react"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { useAuth } from "../contexts/AuthContext"
import { validatePassword } from "../utils"

export default function UpdatePassword() {
  const [formData, setFormData] = useState({
    firstPassword: "",
    secondPassword: "",
  })
  const router = useRouter()
  const { logout } = useAuth()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const verificationToken: string | null = searchParams.get("token")
  const [errorMsg, setErrorMsg] = useState<string>("")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setErrorMsg("")

    if (formData.firstPassword !== formData.secondPassword) {
      setErrorMsg("Passwords do not match")
      return
    }

    if (validatePassword(formData.firstPassword).result === false) {
        setErrorMsg(validatePassword(formData.firstPassword).message)
        return
    }

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/external-update-password`, {
        token: verificationToken,
        password: formData.firstPassword,
      })
      .then(() => {
        window.location.href = "/"
      })
      .catch((error) => {
        console.error("Error:", error)
        setErrorMsg("Token is invalid or expired. Please try again.")
      })
  }

  return (
    <div className="relative flex flex-col justify-center items-center w-full h-full"
        style={{
        backgroundImage: "url('/girl_waiting.webp')",
        backgroundSize: "cover",
        backgroundPosition: "50% 0%",
        backgroundRepeat: "no-repeat",
        }}
    >
        <h1 className="text-5xl text-white mb-6">Update your password</h1>
        <form onSubmit={handleSubmit} style={{
                backgroundColor: "rgba(255, 255, 255, 0.75)",
            }}
            className="p-9 rounded-lg flex flex-col items-center gap-1 relative"    
        >
            <div className="w-full flex gap-1">
                <label htmlFor="firstPassword" className="w-[45%] text-end">New password:</label>
                <input
                    type="password"
                    id="firstPassword"
                    name="firstPassword"
                    value={formData.firstPassword}
                    onChange={handleChange}
                    required
                    className="bg-slate-50 rounded-md px-2"
                />
            </div>
            <div className="w-full flex gap-1">
                <label htmlFor="secondPassword" className="w-[45%] text-end">Confirm password:</label>
                <input
                    type="password"
                    id="secondPassword"
                    name="secondPassword"
                    value={formData.secondPassword}
                    onChange={handleChange}
                    required
                    className="bg-slate-50 rounded-md px-2"
                />
            </div>
            <button type="submit" className="bg-gradient-to-r-main text-white px-3 border-1 rounded-lg py-1 mt-2">
                Submit
            </button>
            <p className="absolute text-red-500 bottom-2 left-1/2 -translate-x-1/2 text-center text-nowrap">{errorMsg}</p>
        </form>
    </div>
  )
}