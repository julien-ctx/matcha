"use client"

import React, { useContext, useState } from "react"
import AuthContext from "./AuthContext"

interface Props {
  children: React.ReactNode
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const AuthProvider = ({ children }: Props) => {
  const [token, setAuthToken] = useState<string | null>(localStorage.getItem("jwt"))

  const login = (newToken: string) => {
    localStorage.setItem("jwt", newToken)
    setAuthToken(newToken)
  }

  const logout = () => {
    localStorage.removeItem("jwt")
    setAuthToken(null)
  }

  return <AuthContext.Provider value={{ token, login, logout }}>{children}</AuthContext.Provider>
}

export default AuthProvider
