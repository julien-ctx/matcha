"use client"

import { useEffect } from "react"
import { useAuth } from "./AuthProvider"
import { useRouter } from "next/navigation"

export const useRequireAuth = (redirectUrl = "/login") => {
  const { token } = useAuth()
  const router = useRouter()

  useEffect(() => {
	console.log(token)
    if (!token) {
		//?redirect=${router.asPath}
	  router.push(`${redirectUrl}`);
    }
  }, [token, router, redirectUrl])

  return token
}
