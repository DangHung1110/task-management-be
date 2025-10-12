import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined,
  secure: (process.env.SMTP_SECURE ?? "false").toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

export async function sendEmail(options: {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const { from, to, subject, text, html } = options;
  await transporter.sendMail({ from, to, subject, text, html });
}


