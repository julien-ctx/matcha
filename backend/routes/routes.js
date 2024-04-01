import express from "express"
import pool from "../database/db.js"

const router = express.Router()

router.get("/db-test", async (req, res) => {
  try {
    await pool.query("SELECT 1 FROM User WHERE FALSE")
    res.send("The 'User' table exists in the database.")
  } catch (err) {
    if (err.code === "42P01") {
      console.error("The 'User' table does not exist.", err.stack)
      res.status(500).send("The 'User' table does not exist.")
    } else {
      console.error("Error executing query", err.stack)
      res.status(500).send("Server Error")
    }
  }
})

router.get("/front-test", async (req, res) => {
  res.status(200).send("OK")
})

export default router
