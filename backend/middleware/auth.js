import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

export const httpAuthenticateJWT = (req, res, next) => {
  const header = req.headers.authorization
  const splitHeader = header?.split(" ")
  if (!splitHeader || splitHeader.length < 2) {
    return res.sendStatus(403)
  }
  const token = splitHeader[1]

  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.AUTH_JWT_SECRET, (error, decoded) => {
    if (error) {
      console.log("Error during HTTP authentication:", error)
      return res.sendStatus(403)
    }

    req.user = decoded
    next()
  })
}

export const socketAuthenticateJWT = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.token

  if (!token) {
    return next(new Error("Authentication error: Token not provided"))
  }

  jwt.verify(token, process.env.AUTH_JWT_SECRET, (error, decoded) => {
    if (error) {
      console.log("Error during socket authentication:", error)
      return next(new Error("Authentication error: Invalid token"))
    }

    socket.user = decoded
    next()
  })
}
