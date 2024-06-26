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
      return res.json({
        errorCode: "ACCESS_DENIED",
        message: "Access denied.",
      })
    }

    const query =
      "INSERT INTO T_VIEW (viewer_id, viewed_id, viewed_at) VALUES ($1, $2, NOW()) RETURNING id, viewed_at;"
    const viewInfo = await pool.query(query, [viewerId, viewedId])

    res.status(200).send({
      message: "Profile view recorded",
      id: viewInfo.rows[0].id,
      viewed_at: viewInfo.rows[0].viewed_at,
    })
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
    await pool.query("BEGIN")

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
      return res.json({
        errorCode: "ACCESS_DENIED",
        message: "Access denied.",
      })
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
        return res.json({
          errorCode: "LIKE_LIMIT_REACHED",
          message:
            "Like limit reached. Upgrade to premium for unlimited likes.",
        })
      }
    }

    const likeQuery =
      "INSERT INTO T_LIKE (liker_id, liked_id, liked_at) VALUES ($1, $2, NOW()) ON CONFLICT (liker_id, liked_id) DO NOTHING"
    await pool.query(likeQuery, [likerId, likedId])

    const fameRatingQuery =
      "UPDATE T_USER SET fame_rating = LEAST(fame_rating + 1, 100) WHERE id = $1;"
    await pool.query(fameRatingQuery, [likedId])

    const matchQuery = `SELECT * FROM T_LIKE WHERE liked_id = $1 AND liker_id = $2`
    const match = await pool.query(matchQuery, [likerId, likedId])

    await pool.query("COMMIT")
    if (!match.rows.length) {
      res.status(200).send({ message: "Profile like recorded", isMatch: false })
    } else {
      res.status(200).send({ message: "Match recorded", isMatch: true })
    }
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to record profile like" })
  }
})

/* Save who the currently authenticated user has disliked (swipe) */
router.post("/dislike/:userId", httpAuthenticateJWT, async (req, res) => {
  const dislikerId = req.user.id
  const dislikedId = req.params.userId

  try {
    await pool.query("BEGIN")

    const insertBlockQuery = `
      INSERT INTO T_BLOCK (blocker_id, blocked_id)
      VALUES ($1, $2), ($2, $1)
      ON CONFLICT DO NOTHING;
    `
    await pool.query(insertBlockQuery, [dislikerId, dislikedId])

    const fameRatingQuery =
      "UPDATE T_USER SET fame_rating = GREATEST(fame_rating - 1, 0) WHERE id = $1;"
    await pool.query(fameRatingQuery, [dislikedId])

    await pool.query("COMMIT")
    res.status(200).send({ message: "Profile dislike recorded" })
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Database error:", error)
    res.status(500).send({ message: "Failed to record profile dislike" })
  }
})

/* Retrieve an array of people who likes the currently authenticated user */
router.get("/likes", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  try {
    const query = `
      SELECT u.id, u.username, u.first_name, u.last_name, u.bio, u.pictures, u.latitude, u.longitude, u.date_of_birth
      FROM T_USER u
      JOIN T_LIKE l ON l.liker_id = u.id
      WHERE l.liked_id = $1
      AND NOT EXISTS (
        SELECT 1 FROM T_LIKE l2 WHERE l2.liker_id = $1 AND l2.liked_id = l.liker_id
      );
    `
    const result = await pool.query(query, [userId])

    const currentUser = await pool.query(
      "SELECT latitude, longitude FROM T_USER WHERE id = $1",
      [userId],
    )
    if (!currentUser.rows.length) {
      return res.json(result.rows)
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
      SELECT u.id, u.username, u.first_name, u.last_name, u.bio, u.pictures, u.latitude, u.longitude, u.date_of_birth, v.viewed_at
      FROM T_USER u
      JOIN T_VIEW v ON v.viewer_id = u.id
      WHERE v.viewed_id = $1 AND NOT EXISTS (
        SELECT 1 FROM T_LIKE l WHERE l.liker_id = u.id AND l.liked_id = $1
      );
    `
    const result = await pool.query(query, [userId])

    const currentUser = await pool.query(
      "SELECT latitude, longitude FROM T_USER WHERE id = $1",
      [userId],
    )
    if (!currentUser.rows.length) {
      return res.json(result.rows)
    }
    const currentCoordinates = currentUser.rows[0]

    const resultWithDistance = result.rows.map((user) => {
      const distance = getDistance(
        currentCoordinates.latitude,
        currentCoordinates.longitude,
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
  const blockedId = parseInt(req.params.userId, 10)

  if (blockerId === parseInt(blockedId, 10)) {
    return res.status(400).send({ message: "Users cannot block themselves" })
  }

  try {
    await pool.query("BEGIN")

    const chatroomQuery = `
      SELECT id FROM T_CHATROOM
      WHERE (user1_id = LEAST($1::int, $2::int) AND user2_id = GREATEST($1::int, $2::int));
    `
    const chatroomResult = await pool.query(chatroomQuery, [
      blockerId,
      blockedId,
    ])
    if (chatroomResult.rows.length > 0) {
      const chatroomId = chatroomResult.rows[0].id

      const deleteMessagesQuery = `DELETE FROM T_MESSAGE WHERE chatroom_id = $1;`
      await pool.query(deleteMessagesQuery, [chatroomId])

      const deleteChatroomQuery = `DELETE FROM T_CHATROOM WHERE id = $1;`
      await pool.query(deleteChatroomQuery, [chatroomId])
    }

    const deleteLikesQuery = `
      DELETE FROM T_LIKE
      WHERE (liker_id = $1 AND liked_id = $2) OR (liker_id = $2 AND liked_id = $1);
    `
    await pool.query(deleteLikesQuery, [blockerId, blockedId])

    const insertBlockQuery = `
      INSERT INTO T_BLOCK (blocker_id, blocked_id, block_date)
      VALUES ($1, $2, NOW())
      ON CONFLICT DO NOTHING;
    `
    await pool.query(insertBlockQuery, [blockerId, blockedId])

    await pool.query("COMMIT")

    res.status(201).send({
      message: "User successfully blocked and all related likes removed",
    })
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Database error during block operation:", error)
    res
      .status(500)
      .send({ message: "Failed to block user", error: error.message })
  }
})

/* The currently authenticated user unblocks another user */
router.post("/unblock/:userId", httpAuthenticateJWT, async (req, res) => {
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
        .status(200)
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
    AND NOT EXISTS (
      SELECT 1 FROM T_CHATROOM
      WHERE (user1_id = l1.liker_id AND user2_id = l1.liked_id) OR
            (user1_id = l1.liked_id AND user2_id = l1.liker_id)
    )
  `

  try {
    const result = await pool.query(query, [userId])

    const currentUser = await pool.query(
      "SELECT latitude, longitude FROM T_USER WHERE id = $1",
      [userId],
    )
    if (!currentUser.rows.length) {
      return res.json(result.rows)
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
        .status(200)
        .send({ message: "No mutual like (match) found to delete." })
    }

    const chatroomQuery = `
      SELECT id FROM T_CHATROOM
      WHERE (user1_id = LEAST($1::int, $2::int) AND user2_id = GREATEST($1::int, $2::int));
    `
    const chatroomResult = await pool.query(chatroomQuery, [
      firstUserId,
      secondUserId,
    ])
    if (chatroomResult.rows.length > 0) {
      const chatroomId = chatroomResult.rows[0].id

      const deleteMessagesQuery = `DELETE FROM T_MESSAGE WHERE chatroom_id = $1;`
      await pool.query(deleteMessagesQuery, [chatroomId])

      const deleteChatroomQuery = `DELETE FROM T_CHATROOM WHERE id = $1;`
      await pool.query(deleteChatroomQuery, [chatroomId])
    }

    const deleteMatchQuery = `
      DELETE FROM T_LIKE
      WHERE (liker_id = $1 AND liked_id = $2) OR (liker_id = $2 AND liked_id = $1);
    `
    await pool.query(deleteMatchQuery, [firstUserId, secondUserId])

    const blockEachOtherQuery = `
      INSERT INTO T_BLOCK (blocker_id, blocked_id)
      VALUES ($1, $2), ($2, $1)
      ON CONFLICT DO NOTHING;
    `
    await pool.query(blockEachOtherQuery, [firstUserId, secondUserId])

    await pool.query("COMMIT")

    res.send({
      message: "Match and chatroom deleted, users blocked successfully.",
    })
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Database error during match deletion:", error)
    res.status(500).send({
      message: "Failed to delete match and chatroom, update block list",
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
      WHERE cr.user1_id = $1 OR cr.user2_id = $1
      ORDER BY cr.updated_at DESC;
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

        const unreadMessagesResult = await pool.query(
          `
            SELECT sender_id, recipient_id
            FROM T_UNREAD_NOTIFICATION
            WHERE (sender_id = $1 AND recipient_id = $2) OR (sender_id = $2 AND recipient_id = $1)
          `,
          [userId, room.other_user_id],
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
          unread_messages: unreadMessagesResult.rows.map((unreadMessage) => ({
            sender_id: unreadMessage.sender_id,
            recipient_id: unreadMessage.recipient_id,
          })),
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
