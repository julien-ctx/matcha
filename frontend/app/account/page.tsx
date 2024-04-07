"use client"

import React from "react"
import { useRequireAuth } from "../auth/RequireAuth"

export default function Account() {
  const { isValidating } = useRequireAuth()

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
        </>
      )}
    </>
  )
}
