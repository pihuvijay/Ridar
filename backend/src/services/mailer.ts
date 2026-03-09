import nodemailer from "nodemailer";
import { env } from "../config/env";

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false, // Mailtrap uses STARTTLS
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});