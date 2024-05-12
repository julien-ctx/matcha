import express from "express"
import pool from "../database/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import passport from "passport"
import {
  sendPasswordRecoveryEmail,
  sendVerificationEmail,
  validatePassword,
} from "../queries/auth.js"
import { httpAuthenticateJWT } from "../middleware/auth.js"

dotenv.config({ path: "../../.env" })

const router = express.Router()

router.post("/register", async (req, res) => {
  const { email, username, firstName, lastName, password } = req.body

  if (!email || !username || !firstName || !lastName || !password) {
    return res.status(400).send({
      message: "One or several fields are missing",
    })
  }

  const tryPassword = validatePassword(password)
  if (!tryPassword.result) {
    return res.status(400).json({ message: tryPassword.message })
  }

  bcrypt.hash(password, 10, async (error, hashedPassword) => {
    if (error) {
      return res.status(500).send({ message: "Error hashing password" })
    }

    const query = `
      INSERT INTO T_USER (email, username, first_name, last_name, password, registration_method)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING id, email, username, first_name, last_name, gender, sexual_orientation, bio, array_to_json(tags) AS tags, pictures, fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country, is_premium;
    `
    const values = [
      email,
      username,
      firstName,
      lastName,
      hashedPassword,
      "Default",
    ]

    try {
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

      sendVerificationEmail(user.id, user.email)

      res.status(201).send({
        message: "Registered successfully",
        user,
        jwt: authToken,
      })
    } catch (dbError) {
      console.error(dbError)
      res
        .status(500)
        .send({ message: "An error occurred during the registration process" })
    }
  })
})

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body

  if (!identifier || !password) {
    return res.status(400).send({
      message:
        "Please provide both an identifier (username or email) and a password.",
    })
  }

  try {
    const query = `
      SELECT id, email, username, password, first_name, last_name, gender, sexual_orientation, bio, array_to_json(tags) AS tags, pictures, fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country, registration_method, is_premium
      FROM T_USER
      WHERE email = $1 OR username = $1;
    `
    const values = [identifier]

    const { rows } = await pool.query(query, values)

    if (rows.length === 0) {
      return res.status(401).send({ message: "Invalid login credentials." })
    }

    const user = rows[0]

    if (user?.registration_method !== "Default" || !user?.password) {
      return res.status(401).send({ message: "Invalid login credentials." })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).send({ message: "Invalid login credentials." })
    }

    const token = jwt.sign(
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

    res.status(200).send({
      message: "Logged in successfully",
      user: {
        ...user,
        password: undefined,
      },
      jwt: token,
    })
  } catch (error) {
    console.error("Database error:", error)
    res
      .status(500)
      .send({ message: "An error occurred during the login process" })
  }
})

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
)

router.get(
  "/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    const user = req.user
    const token = jwt.sign(
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
    res.cookie(
      "userData",
      JSON.stringify({ user, password: undefined, jwt: token, success: true }),
      {
        maxAge: 300000,
        sameSite: "Strict",
      },
    )
    res.redirect(`${process.env.FRONT_URL}`)
  },
  (err, req, res, next) => {
    console.log(err)
    res.cookie("userData", JSON.stringify({ success: false }), {
      maxAge: 30000,
      sameSite: "Strict",
    })
    res.redirect(`${process.env.FRONT_URL}`) // TODO: set error
  },
)

router.post("/jwt-status", async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).send({
      message: "No token provided.",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_JWT_SECRET)
    const userId = decoded.id

    const query = `
      SELECT id, email, username, first_name, last_name, gender, sexual_orientation, bio, array_to_json(tags) AS tags, pictures, fame_rating, last_login, is_online, account_verified, created_at, updated_at, date_of_birth, latitude, longitude, city, country, is_premium
      FROM T_USER
      WHERE id = $1;
    `
    const { rows } = await pool.query(query, [userId])
    if (rows.length === 0) {
      return res
        .status(404)
        .send({ message: "Authenticated user not found in database." })
    }

    const user = rows[0]

    return res.status(200).send({
      user: user,
      message: "Token is valid",
    })
  } catch (error) {
    return res.status(401).send({
      message: "Token is invalid.",
    })
  }
})

router.post("/verify", async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).send({
      message: "No verification token provided.",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.VERIF_JWT_SECRET)
    const id = decoded.id

    const query = `
      UPDATE T_USER
      SET account_verified = TRUE
      WHERE id = $1;
    `

    await pool.query(query, [id])

    res.status(200).send({
      message: "Account verified successfully.",
    })
  } catch (error) {
    console.error("Database error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        message: "Verification token is expired.",
      })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).send({
        message: "Verification token is invalid.",
      })
    } else {
      return res.status(500).send({
        message: "An error occurred during the verification process.",
      })
    }
  }
})

router.post("/password-recovery-email", async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).send({
      message: "Please provide an email.",
    })
  }

  try {
    const query = `
      SELECT id, email, registration_method
      FROM T_USER
      WHERE email = $1;
    `
    const values = [email]

    const { rows } = await pool.query(query, values)

    if (rows.length === 0) {
      return res.status(200).send({
        message:
          "If that email address is in our system, we've sent a password recovery link.",
      })
    }

    const user = rows[0]

    sendPasswordRecoveryEmail(user.id, user.email, user.registration_method)

    return res.status(200).send({
      message:
        "If that email address is in our system, we've sent a password recovery link.",
    })
  } catch (error) {
    console.error("Database error:", error)
    return res.status(500).send({
      message:
        "An error occurred while trying to send the password recovery email.",
    })
  }
})

/* Update password of the currently authenticated user who provides his current password along with a new password */
router.post(
  "/internal-update-password",
  httpAuthenticateJWT,
  async (req, res) => {
    const userId = req.user.id
    const { password, newPassword } = req.body

    if (!password || !newPassword) {
      return res
        .status(400)
        .send({ message: "Please provide both current and new passwords." })
    }

    try {
      const userQuery = `SELECT password FROM T_USER WHERE id = $1;`
      const userResult = await pool.query(userQuery, [userId])

      if (userResult.rows.length === 0) {
        return res.status(401).send({ message: "Authentication failed." })
      }

      const isMatch = userResult.rows[0]?.password
        ? await bcrypt.compare(password, userResult.rows[0].password)
        : false
      if (!isMatch) {
        return res.status(401).send({ message: "Authentication failed." })
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const updateQuery = `UPDATE T_USER SET password = $1 WHERE id = $2;`
      await pool.query(updateQuery, [hashedPassword, userId])

      res.status(200).send({ message: "Password successfully updated." })
    } catch (error) {
      console.error("Database error:", error)
      res
        .status(500)
        .send({ message: "An error occurred while updating the password." })
    }
  },
)

/* Update the password of a user who forgot it and used the link sent by email to reset it */
router.post("/external-update-password", async (req, res) => {
  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).send({
      message: "Please provide a new password and a JWT token",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.RECOVERY_JWT_SECRET)
    const id = decoded.id

    bcrypt.hash(password, 10, async (error, hashedPassword) => {
      if (error) {
        return res.status(500).send({ message: "Error hashing password" })
      }

      const query = `
        UPDATE T_USER
        SET password = $2
        WHERE id = $1;
      `

      await pool.query(query, [id, hashedPassword])
      res.status(200).send({
        message: "Password edited successfully.",
      })
    })
  } catch (error) {
    console.error("Database error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        message: "Recovery token is expired.",
      })
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).send({
        message: "Recovery token is invalid.",
      })
    } else {
      return res.status(500).send({
        message: "An error occurred during the recovery process.",
      })
    }
  }
})

/* Send a verification email to the currently authenticated user */
router.get(
  "/send-verification-email",
  httpAuthenticateJWT,
  async (req, res) => {
    try {
      sendVerificationEmail(req.user.id, req.user.email)
      res.status(200).send({
        message: "Email successfully sent.",
      })
    } catch (error) {
      console.error("Database error:", error)
      return res.status(500).send({
        message: "An error occurred while sending verification email",
      })
    }
  },
)

router.delete("/delete-account", httpAuthenticateJWT, async (req, res) => {
  const userId = req.user.id

  try {
    await pool.query("BEGIN")

    const chatroomsToDelete = await pool.query(
      "SELECT id FROM T_CHATROOM WHERE user1_id = $1 OR user2_id = $1;",
      [userId],
    )
    for (const chatroom of chatroomsToDelete.rows) {
      await pool.query("DELETE FROM T_MESSAGE WHERE chatroom_id = $1;", [
        chatroom.id,
      ])
    }

    await pool.query(
      "DELETE FROM T_UNREAD_NOTIFICATION WHERE sender_id = $1 OR recipient_id = $1",
      [userId],
    )

    await pool.query(
      "DELETE FROM T_CHATROOM WHERE user1_id = $1 OR user2_id = $1;",
      [userId],
    )

    await pool.query(
      "DELETE FROM T_VIEW WHERE viewer_id = $1 OR viewed_id = $1;",
      [userId],
    )
    await pool.query(
      "DELETE FROM T_LIKE WHERE liker_id = $1 OR liked_id = $1;",
      [userId],
    )
    await pool.query(
      "DELETE FROM T_REPORT WHERE reporter_id = $1 OR reported_id = $1;",
      [userId],
    )
    await pool.query(
      "DELETE FROM T_BLOCK WHERE blocker_id = $1 OR blocked_id = $1;",
      [userId],
    )
    await pool.query("DELETE FROM T_FILTER WHERE user_id = $1;", [userId])

    await pool.query("DELETE FROM T_USER WHERE id = $1;", [userId])

    await pool.query("COMMIT")
    res.send({ message: "Account successfully deleted." })
  } catch (error) {
    await pool.query("ROLLBACK")
    console.error("Database error during account deletion:", error)
    res.status(500).send({
      message: "Failed to delete account",
      error: error.message,
    })
  }
})

export default router
