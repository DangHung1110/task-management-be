import dotenv from "dotenv";

dotenv.config();

export const otpConfig = {
  otpLength: parseInt(process.env.OTP_LENGTH || "6", 10),
  otpExpiry: parseInt(process.env.OTP_EXPIRY_MINUTES || "5", 10), 
  maxAttempts: parseInt(process.env.OTP_MAX_ATTEMPTS || "3", 10),
  resendCooldown: parseInt(process.env.OTP_RESEND_COOLDOWN || "60", 10), 
  
  maxRequestsPerHour: parseInt(process.env.OTP_MAX_REQUESTS_PER_HOUR || "5", 10),
};

export default otpConfig;