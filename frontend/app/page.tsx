"use client"

import { useAuth } from "./auth/AuthProvider"
import { AuthStatus } from "./auth/authTypes"
import PublicHome from "./components/PublicHome"
import MySpace from "./components/MySpace"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "./components/Modal"

export default function Home() {
  const { authStatus, login } = useAuth()
  const router = useRouter()
  const [googleAuthErrorModalOpen, setGoogleAuthErrorModalOpen] = useState<boolean>(false)

  useEffect(() => {
    const userData = Cookies.get("userData")
    if (!userData) return
    else if (userData.success === true) {
      login(JSON.parse(userData))
      Cookies.remove("userData")
      router.replace("/")
    } else  {
      Cookies.remove("userData")
      setGoogleAuthErrorModalOpen(true)
    }
  }, [])

  return (
    <div className="w-full h-full">
      {authStatus === AuthStatus.NotValidated ? (
        <PublicHome />
      ) : authStatus === AuthStatus.Validated ? (
        <MySpace />
      ) : null}
      <Modal isOpen={googleAuthErrorModalOpen} onClose={() => setGoogleAuthErrorModalOpen(false)}>
        <div className="flex flex-col pt-3 justify-center gap-3 items-center">
          <h1 className="w-full text-center text-rose-500 text-2xl">Google authentication failed. Please try again.</h1>
          <button className="border-rose-500 border-2 rounded-lg bg-white duration-100 hover:brightness-95 text-rose-500 px-3 text-lg py-1"
            onClick={() => setGoogleAuthErrorModalOpen(false)}
          >Close</button>
        </div>
      </Modal>
    </div>
  )
}
