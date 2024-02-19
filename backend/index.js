import dotenv from "dotenv"
import express from "express"
import routes from "./routes/routes.js"

dotenv.config()

const app = express()
app.use(express.json())

app.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})

app.use("/api", routes)
