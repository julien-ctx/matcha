import dotenv from "dotenv"
import express from "express"
import auth from "./routes/auth.js"
import cors from "cors"

dotenv.config()

const app = express()
app.use(
  cors({
    origin: "http://localhost:8080",
  }),
)
app.use(express.json())

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})

app.use("/api", auth)
