"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./AuthProvider"
import { usePathname, useRouter } from "next/navigation"
import axios from "axios"

interface User {
  id: number,
  email: string,
  username: string,
  firstName: string,
  lastName: string
}

export const useRequireAuth = (redirectUrl = "/login") => {
  const { token, logout } = useAuth()
  const router = useRouter()
  const currentPath = usePathname()
  const [isValidating, setIsValidating] = useState<boolean>(true)
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    const checkJWT = async () => {
      if (token) {
        await axios
          .post(`${process.env.NEXT_PUBLIC_API_URL}/jwt-status`, { token })
          .then((response) => {
            if (response?.data?.user) {
              setUser(response.data.user)
              setIsValidating(false)
            }
          })
          .catch((error) => {
            logout()
          })
      } else if (token === null) {
        router.replace(`${redirectUrl}?redirect=${currentPath}`)
      }
    }

    checkJWT()
  }, [token, router, redirectUrl])

  return { token, isValidating, user }
}
