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
        { id: user.id, email: user.email },
        process.env.AUTH_JWT_SECRET,
        { expiresIn: "24h" },
      )

      const verificationToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.SMTP_JWT_SECRET,
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
      SELECT id, email, username, password
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
      { id: user.id, email: user.email },
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
    console.error(error)
    res
      .status(500)
      .send({ message: "An error occurred during the login process" })
  }
})

router.post("/jwt-status", async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).send({
      valid: false,
      message: "No token provided.",
    })
  }

  jwt.verify(token, process.env.AUTH_JWT_SECRET, (error) => {
    if (error) {
      return res.status(401).send({
        valid: false,
        message: "Token is invalid.",
      })
    }

    res.status(200).send({
      valid: true,
      message: "Token is valid.",
    })
  })
})

router.post("/verify", async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).send({
      message: "No verification token provided.",
    })
  }

  try {
    const decoded = jwt.verify(token, process.env.SMTP_JWT_SECRET)
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

export default router
