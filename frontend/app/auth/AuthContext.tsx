import { createContext } from "react"

interface Props {
  token: string | null
  login: (newToken: string) => void
  logout: () => void
}

const AuthContext = createContext<Props | null>(null)

export default AuthContext
