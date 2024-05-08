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

/**
 * Checks if there is an existing connection for a user and notifies it about a new attempted connection.
 *
 * @param {Map} userSocketMap - A map that stores user IDs and their corresponding socket IDs.
 * @param {Server} io - The socket.io server instance to communicate with connected clients.
 * @param {Socket} socket - The socket instance representing the new connection attempt.
 */
export const checkAlreadyExistingConnection = (userSocketMap, io, socket) => {
  const existingSocketId = userSocketMap.get(socket.userId)
  if (existingSocketId) {
    io.to(existingSocketId).emit("anotherConnectionFound")
  }
}

export function setupSocketEvents(io) {
  const userSocketMap = new Map()

  io.use(socketAuthenticateJWT)

  io.on("connection", (socket) => {
    if (userSocketMap.has(socket.userId)) {
      checkAlreadyExistingConnection(userSocketMap, io, socket)
    }

    setOnlineStatus(socket.userId, true)
    userSocketMap.set(socket.userId, socket.id)

    socket.on("disconnect", () => {
      setOnlineStatus(socket.userId, false)
      userSocketMap.delete(socket.userId)
    })

    socket.on("useHere", () => {
      checkAlreadyExistingConnection(userSocketMap, io, socket)
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

    socket.on("sendMessage", async ({ content, senderId, recipientId }) => {
      try {
        await pool.query("BEGIN")
        let chatroom = await pool.query(
          `SELECT id FROM T_CHATROOM WHERE (user1_id = LEAST($1::int, $2::int) AND user2_id = GREATEST($1::int, $2::int));`,
          [senderId, recipientId],
        )

        let isNewRoom = false

        if (chatroom.rowCount === 0) {
          chatroom = await pool.query(
            `INSERT INTO T_CHATROOM (user1_id, user2_id) VALUES (LEAST($1::int, $2::int), GREATEST($1::int, $2::int)) RETURNING id, created_at, updated_at;`,
            [senderId, recipientId],
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
          `INSERT INTO T_MESSAGE (chatroom_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, sender_id, content, sent_at, delivered_at, read_at;`,
          [chatroomId, senderId, content],
        )
        const message = result.rows[0]

        await pool.query("COMMIT")

        io.to(chatroomId).emit("newMessage", {
          message,
          chatroomId,
          isNewRoom,
          chatroomInfo: isNewRoom
            ? {
                created_at: chatroom.rows[0].created_at,
                id: chatroomId,
                messages: [message],
                other_user: recipientId,
                updated_at: chatroom.rows[0].updated_at,
              }
            : null,
        })
      } catch (error) {
        await pool.query("ROLLBACK")
        console.error("Database error:", error)
        socket.emit("error", {
          errorCode: "BROADCAST_FAILED",
          message: "Message could not be sent.",
        })
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
        socket.emit("error", {
          errorCode: "READ_FAILED",
          message: "Failed to mark message as read.",
        })
      }
    })
  })
}
