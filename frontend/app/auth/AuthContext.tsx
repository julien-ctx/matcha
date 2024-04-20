import { createContext, useContext } from "react"
import { AuthStatus, User } from "./authTypes"

interface Props {
  token: string | null | undefined
  login: (newToken: string) => void
  logout: () => void,
  authStatus: AuthStatus,
  user: User | undefined
}

const AuthContext = createContext<Props | null>(null)

export default AuthContext
