import { db } from '~/lib/db'
import { clients } from '~/lib/db/schema'
import { verifyOTPCode } from '~/lib/auth/otp'
import { createSession } from '~/lib/auth/session'
import { eq, or, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const { identifier, code } = await readBody(event)

    console.log('🔍 Client OTP Verification:', { identifier, code })

    if (!identifier || !code) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email/phone and verification code are required'
      })
    }

    // Verify the OTP code
    console.log('⏳ Verifying OTP code...')
    const isValidOTP = await verifyOTPCode(identifier, code, 'login')
    console.log('📧 OTP verification result:', isValidOTP)
    
    if (!isValidOTP) {
      console.log('❌ OTP verification failed')
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired verification code'
      })
    }

    // Get client details
    console.log('🔍 Looking for client with identifier:', identifier)
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

    console.log('👤 Client search result:', client)

    if (client.length === 0) {
      console.log('❌ No client found')
      throw createError({
        statusCode: 404,
        statusMessage: 'Client not found'
      })
    }

    const clientData = client[0]

    // Create session token
    const sessionToken = createSession({
      userId: clientData.id,
      role: 'client' as const,
      email: clientData.email || undefined,
      phone: clientData.phone || undefined,
      providerId: clientData.providerId,
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
        id: clientData.id,
        role: 'client',
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        providerId: clientData.providerId,
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