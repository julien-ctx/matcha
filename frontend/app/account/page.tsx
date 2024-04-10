"use client"

import React from "react"
import { useRequireAuth } from "../auth/RequireAuth"
import axios from "axios"

export default function Account() {
  const { isValidating, user } = useRequireAuth()

  const handlePasswordChange = async () => {
    if (user && user.email) {
      await axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/password-recovery-email`, { email: user.email })
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
      {isValidating && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!isValidating && (
        <>
          <h1>Account</h1>
          {user && (
            <>
              <h2>
                Welcome {user.firstName} {user.lastName}
              </h2>
              <button onClick={() => handlePasswordChange()}>
                Recover password
              </button>
            </>
          )}
        </>
      )}
    </>
  )
}
