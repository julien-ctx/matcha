import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import { httpAuthenticateJWT } from "../middleware/auth.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

/* Save who the currently authenticated user has viewed */
router.post("/view/:userId", httpAuthenticateJWT, async (req, res) => {
  const viewerId = req.user.id
  const viewedId = req.params.userId

  try {
    const query =
      "INSERT INTO T_VIEW (viewer_id, viewed_id, viewed_at) VALUES ($1, $2, NOW());"
    await pool.query(query, [viewerId, viewedId])
    res.status(200).send({ message: "Profile view recorded" })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to record profile view" })
  }
})

/* Save who the currently authenticated user has liked */
router.post("/like/:userId", httpAuthenticateJWT, async (req, res) => {
  const likerId = req.user.id
  const likedId = req.params.userId

  try {
    const query =
      "INSERT INTO T_LIKE (liker_id, liked_id, liked_at) VALUES ($1, $2, NOW()) ON CONFLICT (liker_id, liked_id) DO NOTHING"
    await pool.query(query, [likerId, likedId])
    res.status(200).send({ message: "Profile like recorded" })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to record profile like" })
  }
})

/* Remove a like from the authenticated user to another user */
router.delete("/unlike/:userId", httpAuthenticateJWT, async (req, res) => {
  const likerId = req.user.id
  const likedId = req.params.userId

  try {
    const query = "DELETE FROM T_LIKE WHERE liker_id = $1 AND liked_id = $2"
    const result = await pool.query(query, [likerId, likedId])
    if (result.rowCount === 0) {
      res.status(404).send({ message: "Like not found or already removed" })
    } else {
      res.status(200).send({ message: "Profile unlike successful" })
    }
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to remove like" })
  }
})

/* Retrieve an array of people who likes the currently authenticated user */
router.get("/likes", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  try {
    const query = `
      SELECT u.id, u.username, u.first_name, u.last_name, u.bio, u.pictures
      FROM T_USER u
      JOIN T_LIKE l ON l.liker_id = u.id
      WHERE l.liked_id = $1;
    `
    const result = await pool.query(query, [userId])
    res.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to retrieve likes" })
  }
})

/* Retrieve an array of people who viewed the currently authenticated user */
router.get("/views", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  try {
    const query = `
      SELECT u.id, u.username, u.first_name, u.last_name, u.bio, u.pictures
      FROM T_USER u
      JOIN T_VIEW v ON v.viewer_id = u.id
      WHERE v.viewed_id = $1;
    `
    const result = await pool.query(query, [userId])
    res.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to retrieve views" })
  }
})

/* Route to get history of profiles viewed by the currently authenticated user */
router.get("/view-history", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  try {
    const query = `
      SELECT v.viewed_id, u.username, u.first_name, u.last_name, u.bio, u.pictures
      FROM T_VIEW v
      JOIN T_USER u ON u.id = v.viewed_id
      WHERE v.viewer_id = $1
      ORDER BY v.viewed_at DESC;
    `
    const result = await pool.query(query, [userId])
    res.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to retrieve viewed profiles" })
  }
})

/* The currently authenticated user reports another user */
router.post("/report/:userId", httpAuthenticateJWT, async (req, res) => {
  const reporterId = req.user.id
  const reportedId = req.params.userId
  const { reason } = req.body

  if (!reason) {
    return res.status(400).send({
      message: "Reason is missing",
    })
  }

  try {
    const query = `
			INSERT INTO T_REPORT (reporter_id, reported_id, reason)
			VALUES ($1, $2, $3)
			ON CONFLICT DO NOTHING;
		`
    const result = await pool.query(query, [reporterId, reportedId, reason])
    if (result.rowCount === 0) {
      res.status(409).send({ message: "User has already been reported by you" })
    } else {
      res.status(201).send({ message: "Report successfully submitted" })
    }
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to submit report" })
  }
})

/* The currently authenticated user blocks another user */
router.post("/block/:userId", httpAuthenticateJWT, async (req, res) => {
  const blockerId = req.user.id
  const blockedId = req.params.userId

  if (blockerId === parseInt(blockedId, 10)) {
    return res.status(400).send({ message: "Users cannot block themselves" })
  }

  try {
    const query = `
        INSERT INTO T_BLOCK (blocker_id, blocked_id, block_date)
        VALUES ($1, $2, NOW())
        ON CONFLICT DO NOTHING;
    `
    const result = await pool.query(query, [blockerId, blockedId])
    if (result.rowCount === 0) {
      res.status(409).send({ message: "User is already blocked" })
    } else {
      res.status(201).send({ message: "User successfully blocked" })
    }
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to block user" })
  }
})

/* The currently authenticated user unblocks another user */
router.delete("/unblock/:userId", httpAuthenticateJWT, async (req, res) => {
  const blockerId = req.user.id
  const blockedId = req.params.userId

  try {
    const query = `
      DELETE FROM T_BLOCK
      WHERE blocker_id = $1 AND blocked_id = $2;
    `
    const result = await pool.query(query, [blockerId, blockedId])
    if (result.rowCount === 0) {
      res
        .status(404)
        .send({ message: "No existing block found or already unblocked" })
    } else {
      res.status(200).send({ message: "User successfully unblocked" })
    }
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to unblock user" })
  }
})

/* Retrieve all matches for the authenticated user. */
router.get("/matches", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  const query = `
    SELECT u.id, u.username, u.email, u.first_name, u.last_name
    FROM T_USER u
    JOIN T_LIKE AS l1 ON u.id = l1.liker_id
    JOIN T_LIKE AS l2 ON l1.liker_id = l2.liked_id AND l1.liked_id = l2.liker_id
    WHERE l1.liked_id = $1 AND l1.liker_id = l2.liked_id
  `

  try {
    const result = await pool.query(query, [userId])
    res.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({
      message: "Failed to retrieve matches",
      error: error.message,
    })
  }
})

/* Retrieve all chatrooms for the currently authenticated user with messages. */
router.get("/chatrooms", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  try {
    const chatroomsResult = await pool.query(
      `
      SELECT cr.id, cr.user1_id, cr.user2_id, cr.created_at, cr.updated_at,
             u.id AS other_user_id, u.first_name, u.last_name, u.pictures, u.is_online
      FROM T_CHATROOM cr
      JOIN T_USER u ON u.id = CASE WHEN cr.user1_id = $1 THEN cr.user2_id ELSE cr.user1_id END
      WHERE cr.user1_id = $1 OR cr.user2_id = $1;
    `,
      [userId],
    )

    const chatrooms = await Promise.all(
      chatroomsResult?.rows.map(async (room) => {
        const messagesResult = await pool.query(
          `
            SELECT id, sender_id, content, sent_at, delivered_at, read_at
            FROM T_MESSAGE
            WHERE chatroom_id = $1
            ORDER BY sent_at ASC;
          `,
          [room.id],
        )

        return {
          id: room.id,
          created_at: room.created_at,
          updated_at: room.updated_at,
          other_user: {
            id: room.other_user_id,
            first_name: room.first_name,
            last_name: room.last_name,
            profile_picture: room.pictures.length ? room.pictures[0] : null,
            is_online: room.is_online,
          },
          messages: messagesResult.rows,
        }
      }),
    )

    res.json(chatrooms)
  } catch (error) {
    console.error("Database error:", error)
    res
      .status(500)
      .send({ message: "Failed to retrieve chatrooms and messages" })
  }
})

export default router
