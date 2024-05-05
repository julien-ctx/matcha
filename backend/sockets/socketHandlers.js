import { socketAuthenticateJWT } from "../middleware/auth.js"
import pool from "../database/db.js"

/**
 * Update the user's online status in the database.
 * @param {number} userId - The ID of the user.
 * @param {boolean} isOnline - The new online status of the user.
 */
export const setOnlineStatus = async (userId, isOnline) => {
  try {
    await pool.query("UPDATE T_USER SET is_online = $1 WHERE id = $2;", [
      isOnline,
      userId,
    ])
  } catch (error) {
    console.error("Database error setting user online status:", error)
  }
}

export function setupSocketEvents(io) {
  const userSocketMap = new Map()

  io.use(socketAuthenticateJWT)

  io.on("connection", (socket) => {
    setOnlineStatus(socket.userId, true)
    userSocketMap.set(socket.userId, socket.id)

    socket.on("disconnect", () => {
      setOnlineStatus(socket.userId, false)
      userSocketMap.delete(socket.userId)
    })

    socket.on("setOnlineStatus", ({ isOnline }) => {
      setOnlineStatus(socket.userId, isOnline)
      socket.broadcast.emit("userOnlineStatusChanged", {
        userId: socket.userId,
        isOnline,
      })
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

    socket.on(
      "sendMessage",
      async ({ content, senderId, recipientId }, callback) => {
        try {
          await pool.query("BEGIN")

          let chatroom = await pool.query(
            `SELECT id FROM T_CHATROOM WHERE (user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1);`,
            [senderId, recipientId],
          )

          let isNewRoom = false

          if (chatroom.rowCount === 0) {
            chatroom = await pool.query(
              `INSERT INTO T_CHATROOM (user1_id, user2_id) VALUES ($1, $2) RETURNING id;`,
              [LEAST(senderId, recipientId), GREATEST(senderId, recipientId)],
            )
            isNewRoom = true
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
            chatroomId,
            isNewRoom,
          })

          callback({ success: true, messageId, chatroomId, isNewRoom })
        } catch (error) {
          await pool.query("ROLLBACK")
          console.error("Database error:", error)
          socket.emit("error", { message: "Message could not be sent." })

          callback({
            success: false,
            error: "Message could not be sent due to a server error.",
          })
        }
      },
    )

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
