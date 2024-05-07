"use client"

import React, { useState } from "react"
import axios from "axios"

export default function RecoverPassword() {
  const [emailSent, setEmailSent] = useState(false)

  const [formData, setFormData] = useState({
    email: "",
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (formData.email) {
      await axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/password-recovery-email`, {
          email: formData.email,
        })
        .then((response) => {
          console.log(response)
          setEmailSent(true)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  return (
    <div className="border-2 relative p-6 flex justify-center items-center flex-col gap-2 rounded-lg pt-8" style={{backgroundColor: 'rgba(255, 255, 255, 0.45)'}}>
      <h1 className="text-4xl">Recover Password</h1>
      {
        !emailSent ? (
          <form className="flex flex-col gap-3 items-center" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center">
            <label htmlFor="email" className="text-lg">Please enter your email which you registered with</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Email"
              className="bg-slate-100 px-2 rounded-md h-8 w-3/4"
            />
          </div>
  
          <button type="submit" className="bg-white px-3 text-rose-500 border-rose-500 border-2 rounded-md hover:brightness-95 duration-100">
            Send
          </button>
        </form>

        ) : (
          <p className="text-xl my-5">A password recovery link has been sent by email.</p>
        )
      }
    </div>
  )
}
