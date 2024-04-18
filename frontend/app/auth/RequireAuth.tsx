"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"
import axios from "axios"
import { AuthStatus } from "./authTypes"

export const useRequireAuth = (redirectUrl = "/login") => {
  const { token, logout } = useAuth()
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState<AuthStatus>(AuthStatus.Validating);

  useEffect(() => {
    const checkJWT = async () => {
      if (token) {
        await axios
          .post(`${process.env.NEXT_PUBLIC_API_URL}/jwt-status`, { token })
          .then((response) => {
            if (response?.data?.valid) {
              setAuthStatus(AuthStatus.Validated);
            } else {
              setAuthStatus(AuthStatus.NotValidated);
              logout()
            }
          })
          .catch((error) => {
            setAuthStatus(AuthStatus.NotValidated);
            logout()
          })
      } else if (token === null) {
        console.log('token is null')
        setAuthStatus(AuthStatus.NotValidated);
        // router.replace(`${redirectUrl}?redirect=${currentPath}`)
      }
    }

    checkJWT()
  }, [token, router, redirectUrl])

  return { token, authStatus }
}
