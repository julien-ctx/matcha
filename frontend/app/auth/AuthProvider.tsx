"use client"

import React, { useContext, useEffect, useState } from "react"
import AuthContext from "./AuthContext"
import axios from "axios"
import { AuthStatus } from "./authTypes"


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
  const [token, setAuthToken] = useState<string | null | undefined>(undefined)
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.Validating);

  const login = (newToken: string) => {
    localStorage.setItem("jwt", newToken)
    setAuthToken(newToken)
    setAuthStatus(AuthStatus.Validated)
  }

  const logout = () => {
    localStorage.removeItem("jwt")
    setAuthToken(null)
    setAuthStatus(AuthStatus.NotValidated)
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem('jwt');
    
    setAuthStatus(AuthStatus.Validated)

    // if (storedToken) {
    //   axios.post(`${process.env.NEXT_PUBLIC_API_URL}/jwt-status`, { token: storedToken })
    //     .then((response) => {
    //       if (response.data.valid) {
    //         setAuthStatus(AuthStatus.Validated);
    //       } else {
    //         logout();
    //       }
    //     })
    //     .catch(logout);
    // } else {
    //   console.log("here");
    //   logout();
    // }
  }, []);

  return <AuthContext.Provider value={{ token, login, logout, authStatus }}>{children}</AuthContext.Provider>
}

export default AuthProvider
