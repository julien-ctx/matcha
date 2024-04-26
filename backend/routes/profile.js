import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import authenticateJWT from "../middleware/auth.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

/* Retrieves the details of a specified user or the current user if no ID is passed. */
router.get("/details/:userId?", authenticateJWT, async (req, res) => {
  const userId = req.params.userId || req.user.id

  const query = `
  SELECT
      id,
      email,
      username,
      first_name,
      last_name,
      gender,
      sexual_orientation,
      bio,
      tags,
      pictures,
      fame_rating,
      last_login,
      is_online,
      account_verified,
      created_at,
      updated_at,
      date_of_birth,
      latitude,
      longitude
      FROM T_USER
      WHERE id = $1
  `
  try {
    const queryResult = await pool.query(query, [userId])
    if (queryResult.rows.length === 0) {
      return res.status(404).send({ message: "User not found" })
    }
    res.json(queryResult.rows[0])
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
    lastLogin,
    isOnline,
    accountVerified,
    dateOfBirth,
    latitude,
    longitude,
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
    if (dateOfBirth) {
      updates.push(`date_of_birth = $${paramIndex++}`);
      values.push(new Date(dateOfBirth));
    }
    if (gender) {
      updates.push(`gender = $${paramIndex++}`)
      values.push(gender)
    }
    if (sexualOrientation) {
      updates.push(`sexual_orientation = $${paramIndex++}`)
      //todo change
      values.push(sexualOrientation[0])
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
    if (lastLogin) {
      updates.push(`last_login = $${paramIndex++}`)
      values.push(lastLogin)
    }
    if (isOnline !== undefined) {
      updates.push(`is_online = $${paramIndex++}`)
      values.push(isOnline)
    }
    if (accountVerified !== undefined) {
      updates.push(`account_verified = $${paramIndex++}`)
      values.push(accountVerified)
    }
    if (dateOfBirth) {
      updates.push(`date_of_birth = $${paramIndex++}`)
      values.push(dateOfBirth)
    }
    if (latitude) {
      updates.push(`latitude = $${paramIndex++}`)
      values.push(latitude)
    }
    if (longitude) {
      updates.push(`longitude = $${paramIndex++}`)
      values.push(longitude)
    }

    if (updates.length === 0) {
      return res.status(400).send({ message: "No updates provided" })
    }

    updates.push(`updated_at = now()`)
    const query = `
      UPDATE T_USER
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, email, username, first_name, last_name, gender, sexual_orientation, bio, tags, pictures, fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude;
    `
    values.push(userId)
    const { rows } = await pool.query(query, values)

    res.send({
      message: "Profile updated successfully",
      user: {
        ...rows[0],
        password: undefined,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    res
      .status(500)
      .send({ message: "Failed to update profile", error: error.message })
  }
})

export default router
