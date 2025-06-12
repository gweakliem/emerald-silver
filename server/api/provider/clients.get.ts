import { db } from '~/lib/db'
import { clients } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { eq, desc } from 'drizzle-orm'

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

    const providerId = sessionData.userId

    // Get all clients for this provider
    const providerClients = await db
      .select({
        id: clients.id,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        notes: clients.notes,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt
      })
      .from(clients)
      .where(eq(clients.providerId, providerId))
      .orderBy(desc(clients.createdAt))

    return {
      success: true,
      clients: providerClients
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Provider clients fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load clients'
    })
  }
})