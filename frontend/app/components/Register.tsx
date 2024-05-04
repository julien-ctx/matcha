"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import React from "react"
import { useAuth } from "../auth/AuthProvider"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"
import "./Register.css"

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
    <div className="flex flex-col justify-center items-center w-full h-full border-4 rounded-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.45)'}}>
      <div className="flex flex-col p-8 px-6 rouned-md rouned-sm justify-center items-center gap-2 ">
        <h1 className="text-5xl mb-5">Join us</h1>

        <button className="bg-slate-50 flex gap-4 justify-center items-center px-3 py-2 rounded-lg border-2 hover:brightness-95 duration-150"
          onClick={() => router.replace(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)}
        >
          <img className="w-6 h-6" src="/google.svg" alt="g" />
          <p className="text-xl">Connect with Google</p>
        </button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 justify-center items-center border-2 pl-4 pr-7 pb-4 pt-8 rounded-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.75)'}}>
          <div className="registerLine">
            <label className="w-1/5 text-end" htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="registerInput"
            />
          </div>
          <div className="registerLine">
            <label className="w-1/5 text-end" htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="registerInput"
            />
          </div>
          <div className="registerLine">
            <label className="w-1/5 text-end" htmlFor="firstName">Name:</label>
            <div className="flex gap-1 w-full">
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First"
                required
                className="w-24 bg-slate-50 rounded-sm px-2"
              />
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last"
                required
                className="w-24 bg-slate-50 rounded-sm px-2"
              />
            </div>
          </div>
          <div className="registerLine">
            <label className="w-1/5 text-end" htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="registerInput"
            />
          </div>
          <button type="submit" className="border-rose-500 border-2 text-rose-500 px-3 bg-white rounded-lg hover:brightness-95 duration-100 mt-3">
            Register
          </button>
        </form>
      </div>
    </div>
  )
}
