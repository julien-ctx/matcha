import express from "express"
import pool from "../database/db.js"
import dotenv from "dotenv"
import {
  getDistance,
  getLocationFromLatitudeLongitude,
  getLocationWithoutPermission,
} from "../queries/location.js"
import { getName } from "country-list"
import { httpAuthenticateJWT } from "../middleware/auth.js"
import { sendVerificationEmail } from "../queries/auth.js"
import jwt from "jsonwebtoken"
import multer from 'multer';
import fs from 'fs/promises';

dotenv.config({ path: "../../.env" })

const router = express.Router()
const upload = multer({ dest: 'uploads/' });

/* Retrieves the details of a specified user or the current user if no ID is passed. */
router.get("/details/:userId?", httpAuthenticateJWT, async (req, res) => {
  const requestedUserId = req.params.userId || req.user.id
  const currentUserId = req.user.id

  try {
    if (requestedUserId !== currentUserId) {
      const blockCheckQuery = `
        SELECT 1
        FROM T_BLOCK
        WHERE blocker_id = $1 AND blocked_id = $2;
      `
      const blockCheckResult = await pool.query(blockCheckQuery, [
        requestedUserId,
        currentUserId,
      ])
      if (blockCheckResult.rowCount > 0) {
        return res.status(403).send({ message: "Access denied." })
      }
    }

    const usersQuery = `
      SELECT id, email, username, first_name, last_name, gender, sexual_orientation, bio, array_to_json(tags) AS tags, pictures,
      fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country, registration_method, is_premium
      FROM T_USER
      WHERE id IN ($1, $2);
    `
    const queryResult = await pool.query(usersQuery, [
      requestedUserId,
      currentUserId,
    ])
    const users = queryResult.rows

    if (users.length === 0) {
      return res.status(404).send({ message: "User not found" })
    }

    const otherUser = users.find((user) => user.id == requestedUserId)
    const currentUser = users.find((user) => user.id == currentUserId)

    if (!otherUser || !currentUser) {
      return res.status(404).send({ message: "User not found" })
    }

    if (requestedUserId === currentUserId) {
      return res.json(currentUser)
    }

    const distance = getDistance(
      currentUser.latitude,
      currentUser.longitude,
      otherUser.latitude,
      otherUser.longitude,
    )

    res.json({
      ...otherUser,
      distance,
    })
  } catch (error) {
    console.error("Database error:", error)
    res.sendStatus(500)
  }
})

/* Update the details of the currently authenticated user. */
router.put("/details", httpAuthenticateJWT, upload.array('pictures'), async (req, res) => {  
  const userId = req.user.id
  const {
    email,
    firstName,
    lastName,
    gender,
    sexualOrientation,
    bio,
    tags,
    lastLogin,
    isOnline,
    accountVerified,
    dateOfBirth,
    latitude,
    longitude,
    isPremium,
  } = req.body

  try {
    const updates = []
    const values = []
    let paramIndex = 1

    if (email) {
      updates.push(`email = $${paramIndex++}`)
      updates.push("account_verified = false")
      values.push(email)
      sendVerificationEmail(userId, email)
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
      const tagsArray = tags.split(',');
      updates.push(`tags = $${paramIndex++}`);
      values.push(tagsArray);
    }
  
    if (req.files && req.files.length > 0) {
      const fileNames = req.files.map(file => file.path);
      if (fileNames.length > 0) {
        updates.push(`pictures = $${paramIndex++}`);
        values.push(`{${fileNames.join(",")}}`);
      }
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
    if (isPremium !== undefined) {
      updates.push(`is_premium = $${paramIndex++}`)
      values.push(isPremium)
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
      if (location) {
        updates.push(`city = $${paramIndex++}`)
        updates.push(`country = $${paramIndex++}`)
        values.push(location.city, location.country)
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
      RETURNING id, email, username, first_name, last_name, gender, sexual_orientation, bio, array_to_json(tags) AS tags, pictures, fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country, is_premium;
    `
    values.push(userId)
    const { rows } = await pool.query(query, values)

    const user = rows[0]
    const authToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      process.env.AUTH_JWT_SECRET,
      { expiresIn: "24h" },
    )

    res.send({
      message: "Profile updated successfully",
      user: {
        ...rows[0],
        password: undefined,
      },
      jwt: authToken,
    })
  } catch (error) {
    console.error("Database error:", error)
    res
      .status(500)
      .send({ message: "Failed to update profile", error: error.message })
  }
})

/* Retrieves the filter settings of the currently authenticated user. */
router.get("/filter", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  const query = `
    SELECT id, user_id, age_min, age_max, location_radius, min_fame_rating, max_fame_rating, array_to_json(tags) AS tags, page_number, limit_number, sort_by, order_by, created_at
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
router.put("/filter", httpAuthenticateJWT, async (req, res) => {
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
      RETURNING id, user_id, age_min, age_max, location_radius, min_fame_rating, max_fame_rating, array_to_json(tags) AS tags, page_number, limit_number, sort_by, order_by, created_at;
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
router.post("/filter", httpAuthenticateJWT, async (req, res) => {
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
    RETURNING id, user_id, age_min, age_max, location_radius, min_fame_rating, max_fame_rating, array_to_json(tags) AS tags, page_number, limit_number, sort_by, order_by, created_at;
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

/* Update profile photos of the user */
router.put("/update-photos", httpAuthenticateJWT, upload.array('new_photos'), async (req, res) => {
  const files = req.files;
  const userId = req.user.id;
  const pictures = JSON.parse(req.body.pictures);
  const removedPictures = req.body.removedPictures ? JSON.parse(req.body.removedPictures) : null;

  try {
    const updatedPictures = pictures.map(photo => {
      if (photo.filename) {
        return files.find(f => f.originalname === photo.filename).path;
      } else if (photo.url) {
        return photo.url;
      }
    }).filter(p => p);
    const query = `
      UPDATE T_USER SET
      pictures = $1::text[]
      WHERE id = $2
      RETURNING id, pictures;
    `;
    await pool.query(query, [updatedPictures, userId]);

    if (removedPictures) {
      for (const picturePath of removedPictures)
        await fs.unlink(picturePath);
    }

    res.send({ message: "Photos updated successfully" });
  } catch (error) {
    console.error("Database error:", error)
    res.sendStatus(500)
  }
});

export default router
