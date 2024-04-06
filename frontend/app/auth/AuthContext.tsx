import { createContext } from "react"

interface Props {
  token: string | null | undefined
  login: (newToken: string) => void
  logout: () => void
}

const AuthContext = createContext<Props | null>(null)

export default AuthContext
