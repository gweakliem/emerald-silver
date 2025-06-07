import { db } from '../db'
import { otpCodes } from '../db/schema'
import { eq, and, gt } from 'drizzle-orm'
import { desc } from 'drizzle-orm'
import crypto from 'crypto'

export function generateOTPCode(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function createOTPCode(
  identifier: string,
  type: 'email' | 'sms',
  purpose: 'login' | 'verification' = 'login'
) {
  const code = generateOTPCode()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  const [otpRecord] = await db.insert(otpCodes).values({
    identifier,
    code,
    type,
    purpose,
    expiresAt,
  }).returning()

  return { code, expiresAt, id: otpRecord.id }
}

export async function verifyOTPCode(
  identifier: string,
  code: string,
  purpose: 'login' | 'verification' = 'login'
): Promise<boolean> {
  const otpRecord = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.identifier, identifier),
        eq(otpCodes.code, code),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.isUsed, false),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .limit(1)

  if (otpRecord.length === 0) {
    return false
  }

  // Mark OTP as used
  await db
    .update(otpCodes)
    .set({ isUsed: true })
    .where(eq(otpCodes.id, otpRecord[0].id))

  return true
}

export async function cleanupExpiredOTPs() {
  await db
    .delete(otpCodes)
    .where(gt(new Date(), otpCodes.expiresAt))
}