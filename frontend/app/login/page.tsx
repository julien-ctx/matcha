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
  const { token, login } = useAuth()
  const router = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const [isValidating, setIsValidating] = useState<boolean>(true)
  const redirectPath: string | null = searchParams.get("redirect")

  useEffect(() => {
    if (token) {
      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/jwt-status`, { token })
        .then(() => {
          router.replace(redirectPath ?? "/account")
        })
        .catch((error) => {
          setIsValidating(false)
        })
    } else if (token === null) {
      setIsValidating(false)
    }
  }, [token, router])

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
        } else {
          console.error("Backend didn't send JWT token")
        }
      })
      .catch((error) => console.error("Error:", error))
  }

  const getRegisterPath = (): string => {
    return `register?redirect=${redirectPath ?? "/"}`
  }

  return (
    <>
      {isValidating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!isValidating && (
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

          <button onClick={() => router.replace("/recover-password")}>Recover password</button>
        </form>
      )}
    </>
  )
}
