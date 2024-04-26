import { createContext } from "react"
import { AuthStatus, User } from "./authTypes"
import { SocketClient } from "../socket/SocketClient"

interface Props {
  token: string | null | undefined
  login: (newToken: string) => void
  logout: () => void,
  authStatus: AuthStatus,
  user: User | undefined,
  socket: any | null // TODO type set
}

const AuthContext = createContext<Props | null>(null)

export default AuthContext
