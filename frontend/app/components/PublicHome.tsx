import { useEffect } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { useAuth } from "../auth/AuthProvider"

export default function PublicHome() {
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    const cookieToken = Cookies.get("token")
    if (cookieToken) {
      login(cookieToken)
      Cookies.remove("token")
      router.replace("/")
    }
  }, [])

  return (
    <div className="h-full w-full pt-20 flex justify-center items-center">
      <h1 className="text-black text-6xl font-jersey10Charted">&nbsp;Find your love&nbsp;</h1>
    </div>
  )
}
