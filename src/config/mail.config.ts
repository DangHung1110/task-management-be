import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const mailConfig = {
  host: process.env.SMTP_HOST as string,
  port: parseInt(process.env.SMTP_PORT as string, 10),
  secure: false, 
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
  },
};

export const transporter = nodemailer.createTransport(mailConfig);

export const emailTemplates = {
  resetPassword: (otp: string, userName: string) => ({
    subject: "Reset Password OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello ${userName},</p>
        <p>You have requested to reset your password. Use the OTP below to proceed:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
      </div>
    `,
  }),
  
  otpVerificationSuccess: (userName: string) => ({
    subject: "Password Reset Successful",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Successfully</h2>
        <p>Hello ${userName},</p>
        <p>Your password has been reset successfully.</p>
        <p>If you didn't make this change, please contact support immediately.</p>
      </div>
    `,
  }),
};

export default transporter;


