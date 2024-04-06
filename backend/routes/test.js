import express from "express"
import dotenv from "dotenv"
import authenticateJWT from "../middleware/auth.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

router.get("/test", authenticateJWT, (req, res) => {
	res.send(200)
})

export default router
