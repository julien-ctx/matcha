"use client"

import { useAuth } from "./auth/AuthProvider"
import { AuthStatus } from "./auth/authTypes"
import PublicHome from "./components/PublicHome"
import MySpace from "./components/MySpace"
import Cookies from "js-cookie"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { authStatus, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const userData = Cookies.get("userData")
    console.log('here', userData)
    if (userData) {
        console.log('userData', userData)
      login(JSON.parse(userData))
      Cookies.remove("userData")
      router.replace("/")
    }
  }, [])


  return (
    <div className="w-full h-full">
      {authStatus === AuthStatus.NotValidated ? (
        <PublicHome />
      ) : authStatus === AuthStatus.Validated ? (
        <MySpace />
      ) : null}
    </div>
  )
}
