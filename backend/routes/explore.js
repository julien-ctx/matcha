import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import {
  getSexualPreferences,
  getOffset,
  getOrderClause,
} from "../queries/explore.js"
import { httpAuthenticateJWT } from "../middleware/auth.js"
import { getDistance } from "../queries/location.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

router.get("/browse", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id
  const {
    ageMin = 18,
    ageMax = 99,
    locationRadius = 500,
    minFameRating = 0,
    maxFameRating = 100,
    tags = [],
    page = 1,
    limit = 25,
    sortBy = "distance",
    orderBy = "asc",
  } = req.query

  if (!["distance", "fameRating", "age"].includes(sortBy)) {
    return res.status(400).send({
      message:
        "sortBy parameter should be one of the following values: distance, fameRating, age.",
    })
  }

  if (!["asc", "desc", "rand"].includes(orderBy)) {
    return res.status(400).send({
      message:
        "orderBy parameter should be one of the following values: asc, desc, rand.",
    })
  }

  if (ageMax < ageMin) {
    return res
      .status(400)
      .send({ message: "ageMax cannot be less than ageMin" })
  }

  if (maxFameRating < minFameRating) {
    return res
      .status(400)
      .send({ message: "maxFameRating cannot be less than minFameRating" })
  }

  const offset = getOffset(page, limit)

  try {
    const currentUser = await pool.query("SELECT * FROM T_USER WHERE id = $1", [
      userId,
    ])
    if (!currentUser.rows.length) {
      return res.status(404).json({ message: "Authenticated user not found in database." })
    }

    const { latitude, longitude, sexual_orientation, gender } =
      currentUser.rows[0]
    const sexualPreferences = getSexualPreferences(sexual_orientation, gender)

    let conditions = `
      id != $1 AND (${sexualPreferences}) AND
      id NOT IN (SELECT liked_id FROM T_LIKE WHERE liker_id = $1)
      AND id NOT IN (SELECT reported_id FROM T_REPORT WHERE reporter_id = $1)
      AND id NOT IN (SELECT blocked_id FROM T_BLOCK WHERE blocker_id = $1)
    `
    let params = [userId]
    let paramCount = 2

    if (latitude && longitude) {
      conditions += ` AND earth_distance(ll_to_earth(latitude, longitude), ll_to_earth($${paramCount}, $${paramCount + 1})) <= $${paramCount + 2} * 1000`
      params.push(latitude, longitude, locationRadius)
      paramCount += 3
    }

    if (ageMin) {
      conditions += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) >= $${paramCount++}`
      params.push(ageMin)
    }

    if (ageMax) {
      conditions += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) <= $${paramCount++}`
      params.push(ageMax)
    }

    if (minFameRating) {
      conditions += ` AND fame_rating >= $${paramCount++}`
      params.push(minFameRating)
    }

    if (maxFameRating) {
      conditions += ` AND fame_rating <= $${paramCount++}`
      params.push(maxFameRating)
    }

    if (tags.length > 0) {
      conditions += ` AND tags @> $${paramCount++}`
      params.push(tags)
    }

    const baseQuery = `
      SELECT
        id, email, username, first_name, last_name, gender, sexual_orientation, bio,
        array_to_json(tags) AS tags, pictures, fame_rating, last_login, is_online,
        account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country
      FROM T_USER
      WHERE ${conditions}
      ${getOrderClause(sortBy, orderBy, latitude, longitude)}
      LIMIT $${paramCount} OFFSET $${paramCount + 1};
    `
    params.push(limit, offset)

    const suggestions = await pool.query(baseQuery, params)
    res.json(
      suggestions.rows.map((user) => ({
        ...user,
        distance: getDistance(
          latitude,
          longitude,
          user.latitude,
          user.longitude,
        ),
      })),
    )
  } catch (err) {
    console.error("Error fetching suggestions:", err)
    res.status(500).json({ message: "Error fetching profile suggestions" })
  }
})

export default router
