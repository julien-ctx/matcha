import { socketAuthenticateJWT } from "../middleware/auth"

export function setupSocketEvents(io) {
  io.use(socketAuthenticateJWT)

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id)

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id)
    })

    socket.on("test", (data) => {
      console.log("Example event received:", data)
      socket.emit("testRes", { status: true })
    })
  })
}
