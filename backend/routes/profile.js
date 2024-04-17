import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import authenticateJWT from "../middleware/auth.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

/* Retrieves the details of a specified user or the current user if no ID is passed. */
router.get("/details/:userId?", authenticateJWT, async (req, res) => {
  const userId = req.params.userId || req.user.id

  try {
    const query = await pool.query("SELECT * FROM T_USER WHERE id = $1", [
      userId,
    ])
    if (query.rows.length === 0) {
      return res.status(404).send({ message: "User not found" })
    }
    res.json(query.rows[0])
  } catch (error) {
    console.error("Database error:", error)
    res.sendStatus(500)
  }
})

/* Update the details of the currently authenticated user. */
router.put("/details", authenticateJWT, async (req, res) => {
  const userId = req.user.id
  const { email, firstName, lastName, bio, pictures, gpsLocation } = req.body

  try {
    const updates = []
    const values = []
    let paramIndex = 1

    if (email) {
      updates.push(`email = $${paramIndex++}`)
      values.push(email)
    }
    if (firstName) {
      updates.push(`first_name = $${paramIndex++}`)
      values.push(firstName)
    }
    if (lastName) {
      updates.push(`last_name = $${paramIndex++}`)
      values.push(lastName)
    }
    if (bio) {
      updates.push(`bio = $${paramIndex++}`)
      values.push(bio)
    }
    if (pictures) {
      updates.push(`pictures = $${paramIndex++}`)
      values.push(pictures)
    }
    if (gpsLocation) {
      updates.push(`gps_location = $${paramIndex++}`)
      values.push(gpsLocation)
    }

    if (updates.length === 0) {
      return res.status(400).send({ message: "No updates provided" })
    }

    updates.push(`updated_at = now()`)
    const query = `UPDATE T_USER SET ${updates.join(", ")} WHERE id = $${paramIndex}`
    values.push(userId)

    await pool.query(query, values)
    res.send({ message: "Profile updated successfully" })
  } catch (error) {
    res
      .status(500)
      .send({ message: "Failed to update profile", error: error.message })
  }
})

/* Save who the currently authenticated user has viewed */
router.post("/:userId/view", authenticateJWT, async (req, res) => {
  const viewerId = req.user.id
  const viewedId = req.params.userId

  try {
    const query =
      "INSERT INTO T_VIEW (viewer_id, viewed_id, viewed_at) VALUES ($1, $2, NOW());"
    const result = await pool.query(query, [viewerId, viewedId])
    res.status(200).send({ message: "Profile view recorded" })
  } catch (error) {
    res.status(500).send({ message: "Failed to record profile view" })
  }
})

/* Save who the currently authenticated user has liked */
router.post("/:userId/like", authenticateJWT, async (req, res) => {
  const likerId = req.user.id
  const likedId = req.params.userId

  try {
    const query =
      "INSERT INTO T_LIKE (liker_id, liked_id, liked_at) VALUES ($1, $2, NOW());"
    const result = await pool.query(query, [likerId, likedId])
    res.status(200).send({ message: "Profile like recorded" })
  } catch (error) {
    console.error(error)
    res.status(500).send({ message: "Failed to record profile like" })
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

export default router
