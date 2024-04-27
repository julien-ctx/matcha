import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import authenticateJWT from "../middleware/auth.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

/* Save who the currently authenticated user has viewed */
router.post("/view/:userId", authenticateJWT, async (req, res) => {
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
router.post("/like/:userId", authenticateJWT, async (req, res) => {
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
router.delete("/unlike/:userId", authenticateJWT, async (req, res) => {
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
router.get("/likes", authenticateJWT, async (req, res) => {
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
router.get("/views", authenticateJWT, async (req, res) => {
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
router.get("/view-history", authenticateJWT, async (req, res) => {
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
router.post("/report/:userId", authenticateJWT, async (req, res) => {
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
router.post("/block/:userId", authenticateJWT, async (req, res) => {
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
router.delete("/unblock/:userId", authenticateJWT, async (req, res) => {
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
router.get("/matches", authenticateJWT, async (req, res) => {
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

export default router
