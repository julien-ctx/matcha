import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

const authenticateJWT = (req, res, next) => {
  const header = req.headers.authorization
  const splitHeader = header?.split(" ")
  if (!splitHeader || splitHeader.length < 2) {
    return res.sendStatus(403)
  }
  const token = splitHeader[1]

  if (!token) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.AUTH_JWT_SECRET, (error, user) => {
    if (error) {
      console.log("Error:", error)
      return res.sendStatus(403)
    }

    req.user = user
    next()
  })
}

export default authenticateJWT
