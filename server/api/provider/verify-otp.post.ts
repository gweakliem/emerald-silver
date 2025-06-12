import { db } from '~/lib/db'
import { users } from '~/lib/db/schema'
import { verifyOTPCode } from '~/lib/auth/otp'
import { createSession } from '~/lib/auth/session'
import { eq, or, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const { identifier, code } = await readBody(event)

    if (!identifier || !code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email/phone and verification code are required'
      })
    }

    // Verify the OTP code
    const isValidOTP = await verifyOTPCode(identifier, code, 'login')
    
    if (!isValidOTP) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired verification code'
      })
    }

    // Get user details
    const user = await db
      .select()
      .from(users)
      .where(
        and(
          or(
            eq(users.email, identifier),
            eq(users.phone, identifier)
          ),
          eq(users.role, 'provider'),
          eq(users.isActive, true)
        )
      )
      .limit(1)

    if (user.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const userData = user[0]

    // Create session token
    const sessionToken = createSession({
      userId: userData.id,
      role: userData.role as 'provider',
      email: userData.email || undefined,
      phone: userData.phone || undefined,
    })

    // Set HTTP-only cookie
    setCookie(event, 'session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    })

    return {
      success: true,
      user: {
        id: userData.id,
        role: userData.role,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
      }
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})