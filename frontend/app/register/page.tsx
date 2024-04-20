"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import React from "react"
import { useAuth } from "../auth/AuthProvider"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import styles from "./page.module.css"

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
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
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/jwt-status`, { token })
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData)
      .then((response) => {
        if (response?.data?.jwt) {
          login(response.data.jwt)
        } else {
          console.error("Backend didn't send JWT token")
        }
      })
      .catch((error) => console.error("Error:", error))
  }

  return (
    <div className="flex justify-center items-center">
      {isValidating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!isValidating && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 justify-center items-center bg-red-200 p-12">
          <div className="flex gap-2 justify-center items-center">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.registerInput}
            />
          </div>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={styles.registerInput}
            />
          </div>
          <div>
            <label htmlFor="firstName">First Name:</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={styles.registerInput}
            />
          </div>
          <div>
            <label htmlFor="lastName">Last Name:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={styles.registerInput}
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
              className={styles.registerInput}
            />
          </div>
          <button type="submit" className="bg-slate-100">
            Register
          </button>
        </form>
      )}
    </div>
  )
}
