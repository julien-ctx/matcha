import nodemailer from "nodemailer"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config({ path: "../../.env" })

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

/**
 * Sends a verification email to a user with a token to verify their account.
 * @param {number} id - The unique ID of the user.
 * @param {string} email - The email address of the user.
 * @throws Will throw an error if sending the email fails.
 */
export const sendVerificationEmail = async (id, email) => {
  const verificationToken = jwt.sign(
    { id, email },
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
}

/**
 * Sends a password recovery email to a user with a token to reset their password.
 * @param {number} id - The unique ID of the user.
 * @param {string} email - The email address of the user.
 * @param {string} registrationMethod - The registration method of the user.
 * @throws Will throw an error if sending the email fails.
 *
 */
export const sendPasswordRecoveryEmail = async (
  id,
  email,
  registrationMethod,
) => {
  if (registrationMethod !== "Default") {
    await transporter.sendMail({
      from: process.env.SMTP_SENDER_EMAIL,
      to: email,
      subject: "Recover your password",
      html: "You requested a password recovery link but you initially registered with a third party login solution like Google. Change your password directly in your third party account.",
    })
    return
  }

  const verificationToken = jwt.sign(
    { id, email },
    process.env.RECOVERY_JWT_SECRET,
    { expiresIn: "15m" },
  )

  const recoverUrl = `${process.env.FRONT_URL}/update-password?token=${verificationToken}`
  await transporter.sendMail({
    from: process.env.SMTP_SENDER_EMAIL,
    to: email,
    subject: "Recover your password",
    html: `<p>Please click the following link to recover your password: <a href="${recoverUrl}">Recover now</a></p>`,
  })
}

/**
 * Validates a password based on several criteria including length,
 * presence of uppercase and lowercase letters, and inclusion of special characters.
 *
 * @param {string} password - The password to validate.
 * @returns {object} An object containing a boolean `result` and a `string` message indicating the validation outcome.
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return {
      result: false,
      message: "Password must be at least 8 characters long.",
    }
  }

  if (!/[A-Z]/.test(password)) {
    return {
      result: false,
      message: "Password must contain at least one uppercase letter.",
    }
  }

  if (!/[a-z]/.test(password)) {
    return {
      result: false,
      message: "Password must contain at least one lowercase letter.",
    }
  }

  if (!/[!@#$%^&*(),.?":{}|<>/]/.test(password)) {
    return {
      result: false,
      message: "Password must contain at least one special character.",
    }
  }

  return { result: true, message: "Password is valid." }
}
