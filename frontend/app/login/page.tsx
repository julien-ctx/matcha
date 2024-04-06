"use client"

import axios from "axios"
import { useState } from "react"
import React from "react"
import { useAuth } from "../auth/AuthProvider"
import Link from "next/link"

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const { login } = useAuth()

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

      <Link href="/register" replace>
        Register instead
      </Link>
    </form>
  )
}
