"use client"

import { useAuth } from "./contexts/AuthContext"
import { AuthStatus } from "./types/authTypes"
import PublicHome from "./components/PublicHome"
import MySpace from "./components/MySpace"
import Cookies from "js-cookie"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Modal from "./components/Modal"

export default function Home() {
  const { authStatus, login, socket } = useAuth()
  const router = useRouter()
  const [googleAuthErrorModalOpen, setGoogleAuthErrorModalOpen] = useState<boolean>(false)
  const [generalErrorModalOpen, setGeneralErrorModalOpen] = useState(false);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");

  useEffect(() => {
    const userData = Cookies.get("userData")
    if (!userData) return
    const userDataObject = JSON.parse(userData)
    if (userDataObject.success === true) {
      login(userDataObject)
      Cookies.remove("userData")
      router.replace("/")
    } else  {
      Cookies.remove("userData")
      setGoogleAuthErrorModalOpen(true)
    }
  }, [])

  useEffect(() => {
    if (!socket) return;

    socket.on('error', (data) => {
      setGeneralErrorMessage(data.message);
      setGeneralErrorModalOpen(true);
    })
  }, [socket])

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

      <Modal isOpen={generalErrorModalOpen} onClose={() => setGeneralErrorModalOpen(false)}>
        <div className="flex flex-col justify-center items-center gap-3">
          <p className="text-center text-lg">An error occurred. Please try again.</p>
          <button className="border-rose-500 border-2 rounded-lg bg-white duration-100 hover:brightness-95 text-rose-500 px-3 text-lg py-1"
            onClick={() => setGeneralErrorModalOpen(false)}
          >Close</button>
        </div>
      </Modal>
    </div>
  )
}
