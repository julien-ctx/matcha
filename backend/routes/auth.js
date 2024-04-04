import express from "express"
import pool from "../database/db.js"
import bcrypt from "bcryptjs"

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
      res.status(201).send({
        message: "User registered successfully",
        user: rows[0],
      })
    } catch (dbError) {
      console.error(dbError)
      res
        .status(500)
        .send({ message: "An error occurred during the registration process" })
    }
  })
})

export default router
