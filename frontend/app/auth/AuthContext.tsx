import { createContext, useContext } from "react"
import { AuthStatus } from "./authTypes"

interface Props {
  token: string | null | undefined
  login: (newToken: string) => void
  logout: () => void,
  authStatus: AuthStatus
}

const AuthContext = createContext<Props | null>(null)

export default AuthContext
