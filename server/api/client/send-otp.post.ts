import { db } from '~/lib/db'
import { clients } from '~/lib/db/schema'
import { createOTPCode } from '~/lib/auth/otp'
import { sendOTPEmail, sendOTPSMS } from '~/lib/auth/notifications'
import { isValidIdentifier } from '~/lib/auth/session'
import { eq, or, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const { identifier } = await readBody(event)

    if (!identifier) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email or phone number is required'
      })
    }

    const { type, valid } = isValidIdentifier(identifier)
    
    if (!valid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email or phone number format'
      })
    }

    // Check if client exists and is active
    const client = await db
      .select()
      .from(clients)
      .where(
        and(
          or(
            eq(clients.email, identifier),
            eq(clients.phone, identifier)
          ),
          eq(clients.isActive, true)
        )
      )
      .limit(1)

    if (client.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Client not found'
      })
    }

    // Generate and send OTP
    const { code } = await createOTPCode(identifier, type, 'login')
    console.log('🔐 [DEBUG] Generated OTP Code for', identifier, ':', code)

    let sendResult
    if (type === 'email') {
      sendResult = await sendOTPEmail(identifier, code)
    } else {
      sendResult = await sendOTPSMS(identifier, code)
    }

    if (!sendResult.success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to send verification code'
      })
    }

    return { 
      success: true, 
      message: `Verification code sent to your ${type}`,
      type 
    }

  } catch (error) {
    console.error('🚨 Client Send OTP Error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})