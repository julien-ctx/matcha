"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import React from "react"
import { useAuth } from "../auth/AuthProvider"
import Link from "next/link"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const { login } = useAuth()
  const router = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const redirectPath: string | null = searchParams.get("redirect")

  useEffect(() => {
    const jwt = localStorage.getItem("jwt")
    if (jwt) {
      router.replace("/")
    }
  }, [])

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
      .post(`${process.env.NEXT_PUBLIC_API_URL}/login`, formData)
      .then((response) => {
        if (response?.data?.jwt) {
          login(response.data.jwt)
          if (redirectPath) {
            router.replace(redirectPath)
          }
        } else {
          console.error("Backend didn't send JWT token")
        }
      })
      .catch((error) => console.error("Error:", error))
  }

  const getRegisterPath = (): string => {
    return `register?redirect=${redirectPath ?? ""}`
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="identifier">Email or username:</label>
        <input
          type="identifier"
          id="identifier"
          name="identifier"
          value={formData.identifier}
          onChange={handleChange}
          required
          className="bg-slate-100"
        />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="bg-slate-100"
        />
      </div>
      <button type="submit" className="bg-slate-100">
        Login
      </button>

      <Link href={getRegisterPath()} replace>
        Register instead
      </Link>
    </form>
  )
}
