"use client"

import React, { useContext, useEffect, useState } from "react"
import AuthContext from "./AuthContext"
import axios from "axios"
import { AuthStatus, User } from "./authTypes"
// import { usePathname, useRouter } from "next/navigation"
import io from 'socket.io-client';

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
  const [socket, setSocket] = useState<any>(null) // TODO type this

  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.Validating);
  const [user, setUser] = useState<User | undefined>(undefined)

  // const router = useRouter()
  // const currentPath = usePathname()

  const login = (newToken: string) => {
    localStorage.setItem("jwt", newToken)
    setAuthToken(newToken)
    setAuthStatus(AuthStatus.Validated)
  }

  const logout = () => {
    localStorage.removeItem("jwt")
    setAuthToken(null)
    setAuthStatus(AuthStatus.NotValidated)
    setUser(undefined)
    setSocket(null)
  }

  function connectSocket() {
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: {
        token: token
      }
    });
    setSocket(newSocket);
    console.log('Socket connection request sent.');
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem('jwt');
    
    setAuthStatus(AuthStatus.Validated)

    if (storedToken) {
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/jwt-status`, { token: storedToken })
        .then((response) => {
          if (response?.data?.user) {
              setUser(response.data.user)
            setAuthStatus(AuthStatus.Validated);
            connectSocket();
          } else {
            logout();
          }
        })
        .catch(logout);
    } else {
      logout();
    }
  }, []);

  return <AuthContext.Provider value={{ token, login, logout, authStatus, user, socket }}>{children}</AuthContext.Provider>
} 

export default AuthProvider
