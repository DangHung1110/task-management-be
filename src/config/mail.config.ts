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

  verifyEmail: (otp: string, userName: string) => ({
    subject: "Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email Address</h2>
        <p>Hello ${userName},</p>
        <p>Thank you for registering! Please verify your email address by entering the OTP below:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
      </div>
    `,
  }),

  workspaceInvitation: (userName: string, workspaceName: string, invitationLink: string, expiresAt: Date) => ({
    subject: `Invitation to join ${workspaceName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Workspace Invitation</h2>
        <p>Hello ${userName},</p>
        <p>You have been invited to join the workspace <strong>${workspaceName}</strong>.</p>
        <p>Click the button below to accept the invitation:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Accept Invitation
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">
          Or copy and paste this link into your browser:<br>
          ${invitationLink}
        </p>
        <p style="color: #999; font-size: 12px;">
          This invitation will expire on ${expiresAt.toLocaleDateString()}.
        </p>
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
        <p style="color: #666; font-size: 12px;">This is an automated email, please do not reply.</p>
      </div>
    `,
  }),
};

export default transporter;


