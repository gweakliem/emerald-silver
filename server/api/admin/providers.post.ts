import { db } from '~/lib/db'
import { users } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Verify admin session
    const sessionToken = getCookie(event, 'session-token')
    
    if (!sessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    const sessionData = verifySession(sessionToken)
    
    if (!sessionData || sessionData.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    const { name, email, phone } = await readBody(event)

    // Validate required fields
    if (!name || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and email are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existingUser.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this email already exists'
      })
    }

    // Create new provider (no password needed - uses OTP authentication)
    const [newProvider] = await db.insert(users).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      role: 'provider',
      isActive: true,
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt
    })

    return {
      success: true,
      provider: newProvider,
      message: 'Provider created successfully'
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Create provider error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create provider'
    })
  }
})