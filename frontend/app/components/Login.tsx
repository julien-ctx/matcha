"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import React from "react"
import { useAuth } from "../auth/AuthProvider"
import { useRouter } from "next/navigation"
import "./Login.css"

interface LoginProps {
  goBackHome: Function;
  goRegister: Function;
  goRecover: Function;
}

export default function Login({ goBackHome, goRegister, goRecover }: LoginProps) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const { login } = useAuth()
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")

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
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, formData)
      .then((response) => {
        if (response?.data?.user) {
          login(response.data)
          console.log("login", response.data.user)
        } else {
          console.error("Backend didn't send JWT token")
          setErrorMsg("Unknown error. Please try again.")
        }
      })
      .catch((error) => {
        setErrorMsg("Wrong ID or password. Please try again.")
      })
  }

  const signInWithGoogle = () => {
    router.replace(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
  }

  return (
    <div className="border-2 relative p-6 flex justify-center items-center flex-col gap-2 rounded-lg pt-8" style={{backgroundColor: 'rgba(255, 255, 255, 0.45)'}}>
      <button className="absolute top-2 left-4 text-slate-200 text-5xl font-jersey200 hover:brightness-110 duration-100"
        onClick={() => goBackHome()}
      >&lt;</button>
      <h1 className="text-4xl mb-3">Connect with us</h1>
      <button className="bg-slate-50 flex gap-4 justify-center items-center px-3 py-2 rounded-lg border-2 hover:brightness-95 duration-150"
          onClick={signInWithGoogle}
        >
          <img className="w-6 h-6" src="/google.svg" alt="g" />
          <p className="text-xl">Connect with Google</p>
      </button>
        <div className="w-full flex flex-col justify-center items-center p-2 gap-1">
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 p-2 pr-4 pb-3 pt-9 items-center rounded-lg border-1 relative"
            style={{backgroundColor: 'rgba(255, 255, 255, 0.75)'}}
          >
            <h2 className="absolute top-2 text-rose-500 w-full text-center">{errorMsg}</h2>
            <div className="loginLine">
              <label className="text-end pr-2" htmlFor="identifier">
                Email / Username:
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
                className="bg-slate-100 px-2"
                autoComplete="username"
              />
            </div>
            <div className="loginLine">
              <label className="text-end pr-2" htmlFor="password">
                Password:
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="bg-slate-100 px-2"
              />
            </div>
            <button type="submit" className="border-rose-500 border-2 text-rose-500 px-3 bg-white rounded-lg hover:brightness-95 duration-100 mt-2">
              Login
            </button>
          </form>
          <div className="flex flex-col text-sm justify-center items-center">
            <button
              className="hover:bg-white hover:brightness-90 px-2 rounded-md duration-75"
              onClick={() => goRecover()}
            >
              I forgot the password
            </button>
            <button
              className="hover:bg-white hover:brightness-90 px-2 rounded-md duration-75"
              onClick={() => goRegister()}
            >
              Register
            </button>
          </div>
        </div>
    </div>
  )
}
