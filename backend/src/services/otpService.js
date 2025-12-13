import { db } from '../db/client.js';
import { otpCodes } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { OTP_CONFIG } from '../config/constants.js';

// Generate random OTP
export function generateOtp() {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_CONFIG.length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// Create OTP for user
export async function createOtp(userId) {
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_CONFIG.expirationMinutes * 60 * 1000);

  // Delete old OTPs for this user
  await db.delete(otpCodes).where(eq(otpCodes.userId, userId));

  // Create new OTP
  const [otp] = await db
    .insert(otpCodes)
    .values({
      userId,
      code,
      expiresAt,
      verified: false,
    })
    .returning();

  return otp;
}

// Verify OTP
export async function verifyOtp(userId, code) {
  const now = new Date();

  // Find valid OTP
  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.code, code),
        eq(otpCodes.verified, false),
        gt(otpCodes.expiresAt, now)
      )
    )
    .limit(1);

  if (!otp) {
    return { valid: false, error: 'Invalid or expired OTP' };
  }

  // Mark as verified
  await db
    .update(otpCodes)
    .set({ verified: true })
    .where(eq(otpCodes.id, otp.id));

  return { valid: true, otp };
}

// Check if OTP exists and is valid
export async function hasValidOtp(userId) {
  const now = new Date();

  const [otp] = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.userId, userId),
        eq(otpCodes.verified, false),
        gt(otpCodes.expiresAt, now)
      )
    )
    .limit(1);

  return !!otp;
}

// Clean expired OTPs (can be called periodically)
export async function cleanExpiredOtps() {
  const now = new Date();
  const result = await db.delete(otpCodes).where(gt(now, otpCodes.expiresAt));
  return result;
}

export default {
  generateOtp,
  createOtp,
  verifyOtp,
  hasValidOtp,
  cleanExpiredOtps,
};
