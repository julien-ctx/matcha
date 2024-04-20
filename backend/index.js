import dotenv from "dotenv"
import express from "express"
import auth from "./routes/auth.js"
import profile from "./routes/profile.js"
import social from "./routes/social.js"
import explore from "./routes/explore.js"
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

app.use("/auth", auth)
app.use("/profile", profile)
app.use("/social", social)
app.use("/explore", explore)
