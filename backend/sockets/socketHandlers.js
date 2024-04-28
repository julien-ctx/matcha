import { socketAuthenticateJWT } from "../middleware/auth.js"

export function setupSocketEvents(io) {
  const userSocketMap = new Map()

  io.use(socketAuthenticateJWT)

  io.on("connection", (socket) => {
    userSocketMap.set(socket.userId, socket.id)

    socket.on("disconnect", () => {
      userSocketMap.delete(socket.userId)
    })

    socket.on("typing", ({ chatroomId }) => {
      socket
        .to(chatroomId)
        .emit("userIsTyping", { userId: socket.userId, chatroomId })
    })

    socket.on("stopTyping", ({ chatroomId }) => {
      socket
        .to(chatroomId)
        .emit("userStoppedTyping", { userId: socket.userId, chatroomId })
    })

    socket.on("sendMessage", async ({ content, senderId, recipientId }) => {
      try {
        await pool.query("BEGIN")

        let chatroom = await pool.query(
          `SELECT id FROM T_CHATROOM WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);`,
          [senderId, recipientId],
        )

        if (chatroom.rowCount === 0) {
          chatroom = await pool.query(
            `INSERT INTO T_CHATROOM (user1_id, user2_id) VALUES ($1, $2) RETURNING id;`,
            [senderId, recipientId],
          )
        }

        const chatroomId = chatroom.rows[0].id

        socket.join(chatroomId)
        const recipientSocketId = userSocketMap.get(recipientId)
        if (recipientSocketId) {
          io.sockets.sockets.get(recipientSocketId)?.join(chatroomId)
        }

        const result = await pool.query(
          `INSERT INTO T_MESSAGE (chatroom_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id;`,
          [chatroomId, senderId, content],
        )
        const messageId = result.rows[0].id

        await pool.query("COMMIT")

        io.to(chatroomId).emit("newMessage", {
          messageId,
          content,
          senderId,
          recipientId,
        })

        socket.emit("messageSent", {
          messageId,
          content,
          senderId,
          recipientId,
        })
      } catch (error) {
        await pool.query("ROLLBACK")
        console.error("Database error:", error)
        socket.emit("error", { message: "Message could not be sent." })
      }
    })

    socket.on("markMessageAsRead", async ({ messageId }) => {
      try {
        await pool.query("BEGIN")

        const updateResult = await pool.query(
          `UPDATE T_MESSAGE SET read_at = NOW() WHERE id = $1 RETURNING sender_id, chatroom_id;`,
          [messageId],
        )

        if (updateResult.rows.length > 0) {
          await pool.query("COMMIT")

          const { sender_id: senderId, chatroom_id: chatroomId } =
            updateResult.rows[0]
          const senderSocketId = userSocketMap.get(senderId)
          if (senderSocketId) {
            socket.to(chatroomId).emit("messageRead", { messageId })
          }
        } else {
          await pool.query("ROLLBACK")
        }
      } catch (error) {
        await pool.query("ROLLBACK")
        console.error("Database error during markMessageAsRead:", error)
        socket.emit("error", { message: "Failed to mark message as read." })
      }
    })
  })
}
