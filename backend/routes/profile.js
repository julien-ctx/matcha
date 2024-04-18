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
  const {
    email,
    firstName,
    lastName,
    gender,
    sexualOrientation,
    bio,
    tags,
    pictures,
    gpsLocation,
    isOnline,
  } = req.body

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
    if (gender) {
      updates.push(`gender = $${paramIndex++}`)
      values.push(gender)
    }
    if (sexualOrientation) {
      updates.push(`sexual_orientation = $${paramIndex++}`)
      values.push(sexualOrientation)
    }
    if (bio) {
      updates.push(`bio = $${paramIndex++}`)
      values.push(bio)
    }
    if (tags) {
      updates.push(`tags = $${paramIndex++}`)
      values.push(tags)
    }
    if (pictures) {
      updates.push(`pictures = $${paramIndex++}`)
      values.push(pictures)
    }
    if (gpsLocation) {
      updates.push(`gps_location = $${paramIndex++}`)
      values.push(gpsLocation)
    }
    if (isOnline !== undefined) {
      updates.push(`is_online = $${paramIndex++}`)
      values.push(isOnline)
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
    console.error("Database error:", error)
    res
      .status(500)
      .send({ message: "Failed to update profile", error: error.message })
  }
})

export default router
