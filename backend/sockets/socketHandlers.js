import { socketAuthenticateJWT } from "../middleware/auth.js"

export function setupSocketEvents(io) {
  io.use(socketAuthenticateJWT)

  io.on("connection", (socket) => {
    console.log("A user connected", socket.id)

    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id)
    })

    socket.on("sendMessage", async ({ content, senderId, recipientId }) => {
      try {
        await pool.query("BEGIN")

        let chatroom = await pool.query(
          `SELECT id FROM T_CHATROOM WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);`,
          [senderId, recipientId],
        )

        if (chatroom.rowCount === 0) {
          const newRoom = await pool.query(
            `INSERT INTO T_CHATROOM (user1_id, user2_id) VALUES ($1, $2) RETURNING id;`,
            [senderId, recipientId],
          )
          chatroom = newRoom
        }

        const chatroomId = chatroom.rows[0].id

        await pool.query(
          `INSERT INTO T_MESSAGE (chatroom_id, sender_id, content) VALUES ($1, $2, $3);`,
          [chatroomId, senderId, content],
        )

        await pool.query("COMMIT")

        io.to(socket.id).emit("messageSent", { content, senderId, recipientId })
        socket
          .to(`user-${recipientId}`)
          .emit("newMessage", { content, senderId, recipientId })
      } catch (error) {
        await pool.query("ROLLBACK")
        console.error("Database error:", error)
        socket.emit("error", { message: "Message could not be sent." })
      }
    })
  })
}
