import { createContext } from "react"
import { AuthStatus, User } from "./authTypes"

interface Props {
  token: string | null | undefined
  login: (newToken: string) => void
  logout: () => void
  authStatus: AuthStatus
  user: User | undefined
  socket: any | null // TODO type set
  httpAuthHeader: any
}

const AuthContext = createContext<Props | null>(null)

export default AuthContext
