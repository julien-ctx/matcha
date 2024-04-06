import express from "express"
import pool from "../database/db.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config({ path: "../../.env" })

const router = express.Router()

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

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
      )

      res.status(201).send({
        message: "Registered successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        jwt: token,
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
      message: "Please provide both an identifier (username or email) and a password.",
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
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
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

export default router
