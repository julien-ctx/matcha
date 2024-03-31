import express from "express"
import pool from "../database/db.js"

const router = express.Router()

router.get("/data", async (req, res) => {
  try {
    await pool.query("SELECT 1")
    res.send("Successfully connected to the database")
  } catch (err) {
    console.error("Error executing query", err.stack)
    res.status(500).send("Server Error")
  }
})

export default router
