import express from "express"
import pool from "../database/db.js"

const router = express.Router()

router.get("/data", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM matcha")
    res.json(rows)
  } catch (err) {
    console.error("Error executing query", err.stack)
    res.status(500).send("Server Error")
  }
})

export default router
