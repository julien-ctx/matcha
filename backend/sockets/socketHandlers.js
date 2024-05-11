import { socketAuthenticateJWT } from "../middleware/auth.js"
import pool from "../database/db.js"
import { getDistance } from "../queries/location.js"

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
  const existingSocketId = userSocketMap.get(socket.user.id)
  if (existingSocketId) {
    io.to(existingSocketId).emit("anotherConnectionFound")
  }
}

/**
 * Sends a custom socket event to a specific user.
 * @param {Map} userSocketMap - The map storing user IDs and their corresponding socket IDs.
 * @param {Server} io - The socket.io server instance.
 * @param {number} userId - The ID of the user to whom the message will be sent.
 * @param {string} eventType - The type of event to emit.
 * @param {Object} data - The data to be sent with the event.
 */
const sendEventToUser = (userSocketMap, io, userId, eventType, data) => {
  const socketId = userSocketMap.get(userId)
  if (socketId) {
    io.to(socketId).emit(eventType, data)
  }
}

export function setupSocketEvents(io) {
  const userSocketMap = new Map()

  io.use(socketAuthenticateJWT)

  io.on("connection", (socket) => {
    if (userSocketMap.has(socket.user.id)) {
      checkAlreadyExistingConnection(userSocketMap, io, socket)
    }

    setOnlineStatus(socket.user.id, true)
    userSocketMap.set(socket.user.id, socket.id)

    socket.on("disconnect", () => {
      setOnlineStatus(socket.user.id, false)
      userSocketMap.delete(socket.user.id)
    })

    socket.on("useHere", (_, callback) => {
      checkAlreadyExistingConnection(userSocketMap, io, socket)
      callback({ success: true })
    })

    socket.on("setOnlineStatus", ({ isOnline }) => {
      setOnlineStatus(socket.user.id, isOnline)
      socket.broadcast.emit("userOnlineStatusChanged", {
        userId: socket.user.id,
        isOnline,
      })
    })

    socket.on("typing", ({ chatroomId, recipientId }) => {
      sendEventToUser(userSocketMap, io, recipientId, "userIsTyping", {
        userId: socket.user.id,
        chatroomId,
      })
    })

    socket.on("stopTyping", ({ chatroomId, recipientId }) => {
      sendEventToUser(userSocketMap, io, recipientId, "userStoppedTyping", {
        userId: socket.user.id,
        chatroomId,
      })
    })

    socket.on("sendMessage", async ({ content, recipientId }, callback) => {
      const senderId = socket.user.id

      console.log("sendMessage", { content, recipientId, senderId })
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

        const notification = `
          INSERT INTO T_UNREAD_NOTIFICATION (notification_type, sender_id, recipient_id, content, sent_at)
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (sender_id, recipient_id) 
          DO UPDATE SET 
            content = EXCLUDED.content, 
            sent_at = CURRENT_TIMESTAMP
        `
        await pool.query(notification, [
          "Message",
          senderId,
          recipientId,
          content,
        ])

        const result = await pool.query(
          `INSERT INTO T_MESSAGE (chatroom_id, sender_id, content) VALUES ($1, $2, $3) RETURNING id, sender_id, content, sent_at, delivered_at, read_at;`,
          [chatroomId, senderId, content],
        )
        const message = result.rows[0]

        await pool.query("COMMIT")

        sendEventToUser(userSocketMap, io, recipientId, "newMessage", {
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

        socket.emit("newMessage", {
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

        callback({ success: true })
      } catch (error) {
        await pool.query("ROLLBACK")
        console.error("Database error:", error)
        socket.emit("error", {
          errorCode: "BROADCAST_FAILED",
          message: "Message could not be sent.",
        })
      }
    })

    socket.on("like", async ({ recipientId }) => {
      const senderId = socket.user.id
      try {
        let reverseLike = await pool.query(
          `SELECT EXISTS (
            SELECT 1 FROM T_LIKE WHERE liker_id = $1 AND liked_id = $2
        ) AS "exists";`,
          [recipientId, senderId],
        )

        let isMatch = reverseLike.rows[0].exists

        const senderInfo = await pool.query(
          "SELECT id, username, first_name, last_name, bio, pictures, latitude, longitude, date_of_birth FROM T_USER WHERE id = $1",
          [senderId],
        )
        if (!senderInfo.rowCount) {
          socket.emit("error", {
            errorCode: "INVALID_SENDER_ID",
            message: "Like could not be sent.",
          })
        }
        const recipientInfo = await pool.query(
          "SELECT longitude, latitude FROM T_USER WHERE id = $1",
          [recipientId],
        )
        if (!recipientInfo.rowCount) {
          socket.emit("error", {
            errorCode: "INVALID_RECIPIENT_ID",
            message: "Like could not be sent.",
          })
        }
        const distance = getDistance(
          senderInfo.rows[0].latitude,
          senderInfo.rows[0].longitude,
          recipientInfo.rows[0].latitude,
          recipientInfo.rows[0].longitude,
        )
        sendEventToUser(userSocketMap, io, recipientId, "profileLiked", {
          ...senderInfo.rows[0],
          distance,
          is_match: isMatch,
        })
      } catch (error) {
        console.error("Database error:", error)
        socket.emit("error", {
          errorCode: "BROADCAST_FAILED",
          message: "Like could not be sent.",
        })
      }
    })

    socket.on("unlike", async ({ recipientId }) => {
      const senderId = socket.user.id
      sendEventToUser(userSocketMap, io, recipientId, "profileUnliked", {
        unlikerId: senderId,
      })
    })

    socket.on("view", async ({ recipientId }) => {
      const senderId = socket.user.id
      try {
        const senderInfo = await pool.query(
          "SELECT id, username, first_name, last_name, bio, pictures, latitude, longitude, date_of_birth FROM T_USER WHERE id = $1",
          [senderId],
        )
        if (!senderInfo.rowCount) {
          socket.emit("error", {
            errorCode: "INVALID_SENDER_ID",
            message: "View could not be sent.",
          })
        }
        const recipientInfo = await pool.query(
          "SELECT longitude, latitude FROM T_USER WHERE id = $1",
          [recipientId],
        )
        if (!recipientInfo.rowCount) {
          socket.emit("error", {
            errorCode: "INVALID_RECIPIENT_ID",
            message: "View could not be sent.",
          })
        }
        const distance = getDistance(
          senderInfo.rows[0].latitude,
          senderInfo.rows[0].longitude,
          recipientInfo.rows[0].latitude,
          recipientInfo.rows[0].longitude,
        )
        sendEventToUser(userSocketMap, io, recipientId, "profileViewed", {
          ...senderInfo.rows[0],
          distance,
        })
      } catch (error) {
        console.error("Database error:", error)
        socket.emit("error", {
          errorCode: "BROADCAST_FAILED",
          message: "View could not be sent.",
        })
      }
    })

    socket.on("readNotification", async ({ recipientId }) => {
      const senderId = socket.user.id
      try {
        const result = await pool.query(
          "DELETE FROM T_UNREAD_NOTIFICATION WHERE sender_id = $1 AND recipient_id = $2",
          [recipientId, senderId],
        )
        if (result.rowCount) {
          sendEventToUser(userSocketMap, io, recipientId, "messageRead", {
            senderId,
          })
        }
      } catch (error) {
        await pool.query("ROLLBACK")
        console.error("Database error:", error)
        socket.emit("error", {
          errorCode: "BROADCAST_FAILED",
          message: "Read receipt could not be sent.",
        })
      }
    })
  })
}
