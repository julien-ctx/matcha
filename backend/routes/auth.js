import express from "express"
import pool from "../database/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import nodemailer from "nodemailer"

dotenv.config({ path: "../../.env" })

const router = express.Router()

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

router.post("/register", async (req, res) => {
  const { email, username, firstName, lastName, password } = req.body

  if (!email || !username || !firstName || !lastName || !password) {
    return res.status(400).send({
      message: "One or several fields are missing",
    })
  }

  bcrypt.hash(password, 10, async (error, hashedPassword) => {
    if (error) {
      return res.status(500).send({ message: "Error hashing password" })
    }

    const query = `
      INSERT INTO T_USER (email, username, first_name, last_name, password)
      VALUES($1, $2, $3, $4, $5)
      RETURNING id, email, username, first_name, last_name;
    `
    const values = [email, username, firstName, lastName, hashedPassword]

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

      const verificationToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.VERIF_JWT_SECRET,
        { expiresIn: "15m" },
      )

      const verificationUrl = `${process.env.FRONT_URL}/verify?token=${verificationToken}`
      await transporter.sendMail({
        from: process.env.SMTP_SENDER_EMAIL,
        to: email,
        subject: "Verify your account",
        html: `<p>Please click the following link to verify your account: <a href="${verificationUrl}">Verify now</a></p>`,
      })

      res.status(201).send({
        message: "Registered successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
        },
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
      SELECT id, email, username, first_name, last_name, password
      FROM T_USER
      WHERE email = $1 OR username = $1;
    `
    const values = [identifier]

    const { rows } = await pool.query(query, values)

    if (rows.length === 0) {
      return res.status(401).send({ message: "Invalid login credentials." })
    }

    const user = rows[0]

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
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
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

router.post("/jwt-status", async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).send({
      message: "No token provided.",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.AUTH_JWT_SECRET)
    return res.status(200).send({
      user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.email,
        firstName: decoded.firstName,
        lastName: decoded.lastName,
      },
      message: "Token is valid",
    })
  } catch (error) {
    console.error("Database error:", error)
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
      SELECT id, email
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

    const verificationToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.RECOVERY_JWT_SECRET,
      { expiresIn: "15m" },
    )

    const recoverUrl = `${process.env.FRONT_URL}/update-password?token=${verificationToken}`
    await transporter.sendMail({
      from: process.env.SMTP_SENDER_EMAIL,
      to: user.email,
      subject: "Recover your password",
      html: `<p>Please click the following link to recover your password: <a href="${recoverUrl}">Recover now</a></p>`,
    })

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

router.post("/update-password", async (req, res) => {
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
        message: "Password edited successfully successfully.",
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

export default router
