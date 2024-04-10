"use client"

import React, { useState } from "react"
import axios from "axios"

export default function RecoverPassword() {
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
        .post(`${process.env.NEXT_PUBLIC_API_URL}/password-recovery-email`, {
          email: formData.email,
        })
        .then((response) => {
          // inform the user that the email has been sent
        })
        .catch((error) => {
          // inform the user that the email has not been sent
        })
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="bg-slate-100"
          />
        </div>

        <button type="submit" className="bg-slate-100">
          Send recovery email
        </button>
      </form>
    </>
  )
}
