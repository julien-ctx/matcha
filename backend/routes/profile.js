import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import authenticateJWT from "../middleware/auth.js"
import {
  getLocationFromLatitudeLongitude,
  getLocationWithoutPermission,
} from "../queries/location.js"
import { getName } from "country-list"

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
    if (latitude === 999 && longitude === 999) {
      const location = await getLocationWithoutPermission()
      if (
        location &&
        location.latitude &&
        location.longitude &&
        location.city &&
        location.country
      ) {
        updates.push(`latitude = $${paramIndex++}`)
        updates.push(`longitude = $${paramIndex++}`)
        updates.push(`city = $${paramIndex++}`)
        updates.push(`country = $${paramIndex++}`)
        values.push(
          location.latitude,
          location.longitude,
          location.city,
          getName(location.country) ?? location.country,
        )
      }
    } else if (latitude !== undefined && longitude !== undefined) {
      updates.push(`latitude = $${paramIndex++}`)
      updates.push(`longitude = $${paramIndex++}`)
      values.push(latitude, longitude)
      const location = await getLocationFromLatitudeLongitude(
        latitude,
        longitude,
      )
      if (location && location.city && location.country) {
        updates.push(`city = $${paramIndex++}`)
        updates.push(`country = $${paramIndex ++}`)
        values.push(
          location.city,
          getName(location.country) ?? location.country,
        )
      }
    }

    if (updates.length === 0) {
      return res.status(400).send({ message: "No updates provided" })
    }

    updates.push(`updated_at = now()`)
    const query = `
      UPDATE T_USER
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, email, username, first_name, last_name, gender, sexual_orientation, bio, tags, pictures, fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country;
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

/* Retrieves the filter settings of the currently authenticated user. */
router.get("/filter", authenticateJWT, async (req, res) => {
  const userId = req.user.id

  const query = `
    SELECT *
    FROM T_FILTER
    WHERE user_id = $1
  `

  try {
    const queryResult = await pool.query(query, [userId])
    if (queryResult.rows.length === 0) {
      return res
        .status(404)
        .send({ message: "Filter settings not found for the user." })
    }
    res.json(queryResult.rows[0])
  } catch (error) {
    console.error("Database error:", error)
    res.sendStatus(500)
  }
})

/* Update the filter settings of the currently authenticated user. */
router.put("/filter", authenticateJWT, async (req, res) => {
  const userId = req.user.id
  const {
    ageMin,
    ageMax,
    locationRadius,
    minFameRating,
    maxFameRating,
    tags,
    pageNumber,
    limitNumber,
    sortBy,
    orderBy,
  } = req.body

  try {
    const updates = []
    const values = []
    let paramIndex = 1

    if (ageMin !== undefined) {
      updates.push(`age_min = $${paramIndex++}`)
      values.push(ageMin)
    }
    if (ageMax !== undefined) {
      updates.push(`age_max = $${paramIndex++}`)
      values.push(ageMax)
    }
    if (locationRadius !== undefined) {
      updates.push(`location_radius = $${paramIndex++}`)
      values.push(locationRadius)
    }
    if (minFameRating !== undefined) {
      updates.push(`min_fame_rating = $${paramIndex++}`)
      values.push(minFameRating)
    }
    if (maxFameRating !== undefined) {
      updates.push(`max_fame_rating = $${paramIndex++}`)
      values.push(maxFameRating)
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`)
      values.push(tags)
    }
    if (pageNumber !== undefined) {
      updates.push(`page_number = $${paramIndex++}`)
      values.push(pageNumber)
    }
    if (limitNumber !== undefined) {
      updates.push(`limit_number = $${paramIndex++}`)
      values.push(limitNumber)
    }
    if (sortBy !== undefined) {
      updates.push(`sort_by = $${paramIndex++}`)
      values.push(sortBy)
    }
    if (orderBy !== undefined) {
      updates.push(`order_by = $${paramIndex++}`)
      values.push(orderBy)
    }

    if (updates.length === 0) {
      return res.status(400).send({ message: "No updates provided" })
    }

    const query = `
      UPDATE T_FILTER
      SET ${updates.join(", ")}
      WHERE user_id = $${paramIndex}
      RETURNING *;
    `
    values.push(userId)

    const { rows } = await pool.query(query, values)
    if (rows.length === 0) {
      return res
        .status(404)
        .send({ message: "Filter settings not found for the user." })
    }
    res.send({
      message: "Filter settings updated successfully",
      filter: rows[0],
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({
      message: "Failed to update filter settings",
      error: error.message,
    })
  }
})

/* Create new filter settings for the currently authenticated user with optional fields. */
router.post("/filter", authenticateJWT, async (req, res) => {
  const userId = req.user.id
  const {
    ageMin = 18,
    ageMax = 99,
    locationRadius = 100,
    minFameRating = 1,
    maxFameRating = 100,
    tags = [],
    pageNumber = 1,
    limitNumber = 25,
    sortBy = "distance",
    orderBy = "asc",
  } = req.body

  const query = `
    INSERT INTO T_FILTER (
      user_id,
      age_min,
      age_max,
      location_radius,
      min_fame_rating,
      max_fame_rating,
      tags,
      page_number,
      limit_number,
      sort_by,
      order_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `

  const values = [
    userId,
    ageMin,
    ageMax,
    locationRadius,
    minFameRating,
    maxFameRating,
    tags,
    pageNumber,
    limitNumber,
    sortBy,
    orderBy,
  ]

  try {
    const { rows } = await pool.query(query, values)
    res.status(201).send({
      message: "Filter settings created successfully",
      filter: rows[0],
    })
  } catch (error) {
    console.error("Database error:", error)
    res.status(500).send({
      message: "Failed to create filter settings",
      error: error.message,
    })
  }
})

export default router
