import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import { httpAuthenticateJWT } from "../middleware/auth.js"
import { getDistance } from "../queries/location.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

/* Save who the currently authenticated user has viewed */
router.post("/view/:userId", httpAuthenticateJWT, async (req, res) => {
  const viewerId = req.user.id
  const viewedId = req.params.userId

  try {
    const blockCheckQuery = `
      SELECT 1
      FROM T_BLOCK
      WHERE blocker_id = $1 AND blocked_id = $2;
    `
    const blockCheckResult = await pool.query(blockCheckQuery, [
      viewedId,
      viewerId,
    ])
    if (blockCheckResult.rowCount > 0) {
      return res.status(403).send({ message: "Access denied." })
    }
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
    const blockCheckQuery = `
      SELECT 1
      FROM T_BLOCK
      WHERE blocker_id = $1 AND blocked_id = $2;
    `
    const blockCheckResult = await pool.query(blockCheckQuery, [
      likedId,
      likerId,
    ])
    if (blockCheckResult.rowCount > 0) {
      return res.status(403).send({ message: "Access denied." })
    }

    const userQuery = "SELECT is_premium FROM T_USER WHERE id = $1"
    const userResult = await pool.query(userQuery, [likerId])
    if (userResult.rowCount === 0 || !userResult.rows[0].is_premium) {
      const likeCountQuery = `
        SELECT COUNT(*) AS like_count
        FROM T_LIKE
        WHERE liker_id = $1
        AND liked_at > CURRENT_TIMESTAMP - INTERVAL '24 hours';
      `
      const likeCountResult = await pool.query(likeCountQuery, [likerId])
      if (parseInt(likeCountResult.rows[0].like_count, 10) >= 20) {
        return res.status(403).json({
          message:
            "Like limit reached. Upgrade to premium for unlimited likes.",
        })
      }
    }

    const likeQuery =
      "INSERT INTO T_LIKE (liker_id, liked_id, liked_at) VALUES ($1, $2, NOW()) ON CONFLICT (liker_id, liked_id) DO NOTHING"
    await pool.query(likeQuery, [likerId, likedId])
    const matchQuery = `SELECT * FROM T_LIKE WHERE liked_id = $1 AND liker_id = $2`
    const match = await pool.query(matchQuery, [likerId, likedId])
    if (!match.rows.length) {
      res.status(200).send({ message: "Profile like recorded", isMatch: false })
    } else {
      res.status(200).send({ message: "Match recorded", isMatch: true })
    }
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
      SELECT u.id, u.username, u.first_name, u.last_name, u.bio, u.pictures, u.latitude, u.longitude
      FROM T_USER u
      JOIN T_LIKE l ON l.liker_id = u.id
      WHERE l.liked_id = $1;
    `
    const result = await pool.query(query, [userId])

    const currentUser = await pool.query(
      "SELECT latitude, longitude FROM T_USER WHERE id = $1",
      [userId],
    )
    if (!currentUser.rows.length) {
      res.json(result.rows)
    }
    const resultWithDistance = result.rows.map((user) => {
      const distance = getDistance(
        currentUser.rows[0].latitude,
        currentUser.rows[0].longitude,
        user.latitude,
        user.longitude,
      )
      return {
        ...user,
        distance,
      }
    })
    res.json(resultWithDistance)
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
      SELECT u.id, u.username, u.first_name, u.last_name, u.bio, u.pictures, u.longitude, u.latitude
      FROM T_USER u
      JOIN T_VIEW v ON v.viewer_id = u.id
      WHERE v.viewed_id = $1;
    `
    const result = await pool.query(query, [userId])

    const currentUser = await pool.query(
      "SELECT latitude, longitude FROM T_USER WHERE id = $1",
      [userId],
    )
    if (!currentUser.rows.length) {
      res.json(result.rows)
    }
    const resultWithDistance = result.rows.map((user) => {
      const distance = getDistance(
        currentUser.rows[0].latitude,
        currentUser.rows[0].longitude,
        user.latitude,
        user.longitude,
      )
      return {
        ...user,
        distance,
      }
    })
    res.json(resultWithDistance)
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
      SELECT v.viewed_id, u.username, u.first_name, u.last_name, u.bio, u.pictures, u.is_online
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
    SELECT 
    u.id, 
    u.email, 
    u.username, 
    u.first_name, 
    u.last_name, 
    u.gender, 
    u.sexual_orientation, 
    u.bio, 
    array_to_json(u.tags) AS tags, 
    u.pictures, 
    u.fame_rating, 
    u.last_login, 
    u.is_online, 
    u.account_verified, 
    u.created_at, 
    u.updated_at, 
    u.date_of_birth, 
    u.latitude, 
    u.longitude, 
    u.city, 
    u.country
    FROM T_USER u
    JOIN T_LIKE AS l1 ON u.id = l1.liker_id
    JOIN T_LIKE AS l2 ON l1.liker_id = l2.liked_id AND l1.liked_id = l2.liker_id
    WHERE l1.liked_id = $1 AND l1.liker_id = l2.liked_id
  `

  try {
    const result = await pool.query(query, [userId])

    const currentUser = await pool.query(
      "SELECT latitude, longitude FROM T_USER WHERE id = $1",
      [userId],
    )
    if (!currentUser.rows.length) {
      res.json(result.rows)
    }
    const resultWithDistance = result.rows.map((user) => {
      const distance = getDistance(
        currentUser.rows[0].latitude,
        currentUser.rows[0].longitude,
        user.latitude,
        user.longitude,
      )
      return {
        ...user,
        distance,
      }
    })
    res.json(resultWithDistance)
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({
      message: "Failed to retrieve matches",
      error: error.message,
    })
  }
})

/* Delete 2 rows corresponding to a match in T_LIKE */
router.delete("/match", httpAuthenticateJWT, async (req, res) => {
  const { firstUserId, secondUserId } = req.body

  if (!firstUserId || !secondUserId) {
    return res.status(400).send({ message: "Both user IDs must be provided." })
  }

  if (req.user.id !== firstUserId && req.user.id !== secondUserId) {
    return res.status(401).send({ message: "Unauthorized operation." })
  }

  try {
    await pool.query("BEGIN")

    const matchCheckQuery = `
      SELECT COUNT(*) FROM T_LIKE
      WHERE (liker_id = $1 AND liked_id = $2) AND EXISTS (
        SELECT 1 FROM T_LIKE WHERE liker_id = $2 AND liked_id = $1
      );
    `
    const matchCheckResult = await pool.query(matchCheckQuery, [
      firstUserId,
      secondUserId,
    ])
    if (matchCheckResult.rows[0].count !== "1") {
      await pool.query("ROLLBACK")
      return res
        .status(404)
        .send({ message: "No mutual like (match) found to delete." })
    }

    const deleteMatchQuery = `
      DELETE FROM T_LIKE
      WHERE (liker_id = $1 AND liked_id = $2) OR (liker_id = $2 AND liked_id = $1);
    `
    await pool.query(deleteMatchQuery, [firstUserId, secondUserId])
    await pool.query("COMMIT")

    res.send({ message: "Match successfully deleted." })
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Database error during match deletion:", error)
    res
      .status(500)
      .send({ message: "Failed to delete match", error: error.message })
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
