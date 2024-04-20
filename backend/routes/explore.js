// Todo
// Add check that min cannot be > max of age
// Limit the limit!
// Order by location distance
// fix gender and sexual orientation null
// duplicate tag generation with sql
import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import authenticateJWT from "../middleware/auth.js"
import { getGenderQuery, getOffset } from "../query.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

router.get("/browse", authenticateJWT, async (req, res) => {
  const userId = req.user.id
  const {
    ageMin,
    ageMax,
    locationRadius,
    minFameRating,
    tags = [],
    page = 1,
    limit = 25,
  } = req.query

  const offset = getOffset(page, limit)

  try {
    const currentUser = await pool.query("SELECT * FROM T_USER WHERE id = $1", [
      userId,
    ])
    if (!currentUser.rows.length) {
      return res.status(404).json({ message: "User not found" })
    }

    const { latitude, longitude, sexual_orientation } = currentUser.rows[0]

    const genderQuery = getGenderQuery(sexual_orientation)

    let conditions = `id != $1 AND (${genderQuery})`
    let params = [userId]
    let paramCount = 2

    if (locationRadius && latitude && longitude) {
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

    if (tags.length > 0) {
      conditions += ` AND tags @> $${paramCount++}`
      params.push(tags)
    }

    const baseQuery = `
			SELECT *
			FROM T_USER
            WHERE ${conditions}
            LIMIT $${paramCount} OFFSET $${paramCount + 1};
		`

    params.push(limit, offset)

    const suggestions = await pool.query(baseQuery, params)

    res.json(suggestions.rows)
  } catch (err) {
    console.error("Error fetching suggestions:", err)
    res.status(500).json({ message: "Error fetching profile suggestions" })
  }
})

export default router
