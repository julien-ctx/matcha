import dotenv from "dotenv"
import express from "express"
import auth from "./routes/auth.js"
import profile from "./routes/profile.js"
import social from "./routes/social.js"
import explore from "./routes/explore.js"
import http from "http"
import { Server as SocketIO} from "socket.io"
import { setupSocketEvents } from "./sockets/socketHandlers.js"
import cors from "cors"

dotenv.config({ path: "../.env" })

const app = express()
const server = http.createServer(app)
const io = new SocketIO(server, {
  cors: {
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"]
  },
})
setupSocketEvents(io)

app.use(
  cors({
    origin: process.env.FRONT_URL,
  }),
)
app.use(express.json())

app.use("/auth", auth)
app.use("/profile", profile)
app.use("/social", social)
app.use("/explore", explore)

server.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})