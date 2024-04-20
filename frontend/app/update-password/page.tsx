"use client"

import React, { useState } from "react"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import axios from "axios"
import { useAuth } from "../auth/AuthProvider"

export default function UpdatePassword() {
  const [formData, setFormData] = useState({
    firstPassword: "",
    secondPassword: "",
  })
  const router = useRouter()
  const { logout } = useAuth()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const verificationToken: string | null = searchParams.get("token")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-password`, {
        token: verificationToken,
        password: formData.firstPassword,
      })
      .then(() => {
        logout()
        router.replace("/")
      })
      .catch((error) => {
        // display error message in the UI
        console.error("Error:", error)
      })
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="firstPassword">Password:</label>
          <input
            type="firstPassword"
            id="firstPassword"
            name="firstPassword"
            value={formData.firstPassword}
            onChange={handleChange}
            required
            className="bg-slate-100"
          />
        </div>
        <div>
          <label htmlFor="secondPassword">Password again:</label>
          <input
            type="secondPassword"
            id="secondPassword"
            name="secondPassword"
            value={formData.secondPassword}
            onChange={handleChange}
            required
            className="bg-slate-100"
          />
        </div>
        <button type="submit" className="bg-slate-100">
          Change password
        </button>
      </form>
    </>
  )
}
