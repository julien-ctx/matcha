"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import React from "react"
import { useAuth } from "../auth/AuthProvider"
import Link from "next/link"
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from "next/navigation"

interface LoginProps {
  setModalOpen: (value: boolean) => void
}

export default function Login({ setModalOpen }: LoginProps) {
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
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, formData)
      .then((response) => {
        if (response?.data?.jwt) {
          login(response.data.jwt)
          console.log('login', response.data.user)
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
    <div className="p-0 h-72 flex justify-center items-center flex-col gap-2">
      <h1 className="text-4xl">Get Started</h1>
      {isValidating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!isValidating && (
        <div className="w-full flex flex-col justify-center items-center p-2">
          <form onSubmit={handleSubmit} className=" w-full flex flex-col gap-2 p-2 items-center">
            <div className="w-full flex justify-center">
              <label className="w-1/3 text-end pr-2" htmlFor="identifier">Email / Username:</label>
              <input
                type="identifier"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="bg-slate-100 h-7 w-2/5"
              />
            </div>
            <div className="w-full flex justify-center">
              <label className="w-1/3 text-end pr-2" htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="bg-slate-100 h-7 w-2/5"
              />
            </div>
            <button type="submit" className="bg-slate-200 hover:brightness-90 px-3 py-1">
              Login
            </button>
          </form>
          <div className="flex flex-col text-sm justify-center items-center"> 
            <button className="bg-white hover:brightness-90 px-2 " onClick={() => {
              setModalOpen(false);
              router.replace("/recover-password");
            }}>I forgot the password</button>
            <Link className="bg-white hover:brightness-90 px-2" href={getRegisterPath()} replace onClick={() => {
              setModalOpen(false);
            }}>
              Register
            </Link>
          </div>
        </div>

      )}
    </div>
  )
}
