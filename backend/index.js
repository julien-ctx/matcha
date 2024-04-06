import dotenv from "dotenv"
import express from "express"
import auth from "./routes/auth.js"
import test from "./routes/test.js"
import cors from "cors"

dotenv.config({ path: "../.env" })

const app = express()
app.use(
  cors({
    origin: process.env.FRONT_URL,
  }),
)
app.use(express.json())

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})

app.use("/api", auth)
app.use("/api", test)
