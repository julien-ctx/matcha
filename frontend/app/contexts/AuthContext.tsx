"use client"

import React, { useContext, useEffect, useState, createContext } from "react"
import axios from "axios"
import { AuthStatus, User } from "../types/authTypes"
import { io } from "socket.io-client"
import { generateTabId, setActiveTab } from "../tabManager"

interface Props {
  token: string | null | undefined
  login: (newToken: string) => void
  logout: () => void
  authStatus: AuthStatus
  user: User | undefined
  socket: any | null // TODO type set
  httpAuthHeader: any
}

export const AuthContext = createContext<Props | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

const AuthProvider = ({ children }) => {
  const [token, setAuthToken] = useState<string | null | undefined>(undefined);
  const [socket, setSocket] = useState<any | null>(null); // TODO type set

  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.Validating);
  const [user, setUser] = useState<User | undefined>(undefined)

  const [httpAuthHeader, setHttpAuthHeader] = useState<any | null>(null); // TODO type set

  function connectSocket(tok: string) {
    const newSocket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      auth: {
        token: tok
      }
    });
    setSocket(newSocket);
  }

  const login = (data: any) => {
    localStorage.setItem("jwt", data.jwt)
    setAuthToken(data.jwt)
    setHttpAuthHeader({ headers: { Authorization: `Bearer ${data.jwt}` }})
    setAuthStatus(AuthStatus.Validated)
    setUser(data.user)
    connectSocket(data.jwt)
  }

  const logout = () => {
    localStorage.removeItem("jwt")
    socket?.disconnect()
    setSocket(null)
    setAuthToken(null)
    setAuthStatus(AuthStatus.NotValidated)
    setHttpAuthHeader(null)
    setUser(undefined)
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem('jwt');
    if (storedToken) {
      axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/jwt-status`, { token: storedToken })
        .then((response) => {
          if (response?.data?.user) {
              setAuthToken(storedToken);
              setHttpAuthHeader({ headers: { Authorization: `Bearer ${storedToken}` }})
              setUser(response.data.user)
              if (response.data.user.date_of_birth) {
                connectSocket(storedToken);
                // console.log('Socket connection established.')
              }
            setAuthStatus(AuthStatus.Validated);
          } else {
            logout();
          }
        })
        .catch(logout);
    } else {
      logout();
    }
  }, []);

  return <AuthContext.Provider value={{ token, login, logout, authStatus, user, socket, httpAuthHeader }}>{children}</AuthContext.Provider>
} 

export default AuthProvider
