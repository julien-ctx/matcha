"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import React from "react"
import { useAuth } from "../contexts/AuthContext"
import { useRouter } from "next/navigation"
import "./Register.css"
import { validatePassword } from "../utils"

interface RegisterProps {
  goBackHome: Function;
}

export default function Register({ goBackHome }: RegisterProps) {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    firstName: "",
    lastName: "",
    password: "",
  })
  const { login } = useAuth()
  const router = useRouter()
  const [errorMsg, setErrorMsg] = useState("")

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMsg("")

    const tryPassword = validatePassword(formData.password)
    if (!tryPassword.result) {
      setErrorMsg(tryPassword.message)
      return;
    }

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, formData)
      .then((response) => {
        if (response?.data?.jwt) {
          login(response.data)
        } else {
          console.error("Backend didn't send JWT token")
        }
      })
      .catch((error) => {
        console.error(error)
        setErrorMsg("Please try again with different email or username.")
      
      })
  }

  return (
    <div className="flex flex-col justify-center items-center w-full h-full border-4 rounded-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.45)'}}>
      <button className="absolute top-2 left-5 text-slate-200 text-5xl font-jersey200 hover:brightness-110 duration-100"
        onClick={() => goBackHome()}
      >&lt;</button>

      <div className="flex flex-col p-8 px-6 rouned-md rouned-sm justify-center items-center gap-2 ">
        
        <h1 className="text-5xl mb-5">Join us</h1>

        <button className="bg-slate-50 flex gap-4 justify-center items-center px-3 py-2 rounded-lg border-2 hover:brightness-95 duration-150"
          onClick={() => router.replace(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`)}
        >
          <img className="w-6 h-6" src="/google.svg" alt="g" />
          <p className="text-xl">Connect with Google</p>
        </button>
        <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 justify-center items-center border-2 pl-4 pr-7 pb-5 pt-10 rounded-lg" style={{backgroundColor: 'rgba(255, 255, 255, 0.75)'}}>
          <p className="absolute w-full text-center text-rose-500 top-2 left-0">{errorMsg}</p>
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
