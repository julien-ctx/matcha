"use client"

import { useEffect } from "react"
import { useAuth } from "./AuthProvider"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

export const useRequireAuth = (redirectUrl = "/login") => {
  const { token } = useAuth()
  const router = useRouter()
  const currentPath = usePathname()

  useEffect(() => {
    if (token === null) {
      router.replace(`${redirectUrl}?redirect=${currentPath}`)
    }
  }, [token, router, redirectUrl])

  return token
}
