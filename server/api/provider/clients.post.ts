import { db } from '~/lib/db'
import { users, clients } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { sendInvitationEmail, sendInvitationSMS } from '~/lib/auth/notifications'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Verify provider session
    const sessionToken = getCookie(event, 'session-token')
    
    if (!sessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    const sessionData = verifySession(sessionToken)
    
    if (!sessionData || sessionData.role !== 'provider') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Provider access required'
      })
    }

    const { name, email, phone, notes } = await readBody(event)

    // Validate required fields
    if (!name || (!email && !phone)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name and at least one contact method (email or phone) are required'
      })
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid email format'
        })
      }
    }

    // Validate phone format if provided
    if (phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid phone number format'
        })
      }
    }

    // Check if client with this email or phone already exists for this provider
    if (email) {
      const existingClientByEmail = await db
        .select()
        .from(clients)
        .where(eq(clients.email, email))
        .limit(1)

      if (existingClientByEmail.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'A client with this email already exists'
        })
      }
    }

    if (phone) {
      const existingClientByPhone = await db
        .select()
        .from(clients)
        .where(eq(clients.phone, phone))
        .limit(1)

      if (existingClientByPhone.length > 0) {
        throw createError({
          statusCode: 409,
          statusMessage: 'A client with this phone number already exists'
        })
      }
    }

    // Create new client
    const [newClient] = await db.insert(clients).values({
      providerId: sessionData.userId,
      name: name.trim(),
      email: email?.trim().toLowerCase() || null,
      phone: phone?.trim() || null,
      notes: notes?.trim() || null,
      isActive: true,
    }).returning({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      notes: clients.notes,
      isActive: clients.isActive,
      createdAt: clients.createdAt
    })

    // Send invitation notifications
    const clientLoginUrl = `${getHeader(event, 'origin') || 'http://localhost:3000'}/client/login`
    const invitationResults = []

    if (email) {
      const emailResult = await sendInvitationEmail(email, name, clientLoginUrl)
      invitationResults.push({ type: 'email', success: emailResult.success })
    }

    if (phone) {
      const smsResult = await sendInvitationSMS(phone, name, clientLoginUrl)
      invitationResults.push({ type: 'sms', success: smsResult.success })
    }

    return {
      success: true,
      client: newClient,
      invitations: invitationResults,
      message: 'Client created successfully'
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Create client error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create client'
    })
  }
})