import dotenv from "dotenv"
import express from "express"
import session from "express-session"
import auth from "./routes/auth.js"
import profile from "./routes/profile.js"
import social from "./routes/social.js"
import explore from "./routes/explore.js"
import http from "http"
import { Server as SocketIO } from "socket.io"
import { setupSocketEvents } from "./sockets/socketHandlers.js"
import cors from "cors"
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import pool from "./database/db.js"

dotenv.config({ path: "../.env" })

const app = express()

app.use(
  session({
    secret: "AUTH_JWT_SECRET",
    resave: false,
    saveUninitialized: false,
  }),
)

app.use(passport.initialize())

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM T_USER WHERE id = $1", [
      id,
    ])
    done(null, rows[0])
  } catch (error) {
    done(error)
  }
})

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_AUTH_CLIENT,
      clientSecret: process.env.GOOGLE_AUTH_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value
      try {
        const { rows } = await pool.query(
          "SELECT * FROM T_USER WHERE email = $1",
          [email],
        )
        if (rows.length && rows[0].registration_method !== "Google") {
          return done(new Error("User not registered with Google"), false)
        } else if (rows.length) {
          return done(null, rows[0])
        } else {
          const newUser = {
            email,
            username: profile.displayName,
            first_name: profile.name.givenName,
            last_name: profile.name.familyName,
          }
          const result = await pool.query(
            "INSERT INTO T_USER (email, username, first_name, last_name, registration_method) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [
              newUser.email,
              newUser.username,
              newUser.first_name,
              newUser.last_name,
              "Google",
            ],
          )
          return done(null, result.rows[0])
        }
      } catch (error) {
        done(error)
      }
    },
  ),
)

const server = http.createServer(app)
const io = new SocketIO(server, {
  cors: {
    origin: process.env.FRONT_URL,
    methods: ["GET", "POST"],
  },
})
setupSocketEvents(io)

app.use(
  cors({
    origin: process.env.FRONT_URL,
  }),
)

app.use(express.json())

app.use("/auth", auth)
app.use("/profile", profile)
app.use("/social", social)
app.use("/explore", explore)

server.listen(3000, () => {
  console.log(`Server Started at ${3000}`)
})
