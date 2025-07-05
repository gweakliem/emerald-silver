import { db } from '~/lib/db'
import { clients } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { eq, and } from 'drizzle-orm'

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

    // Get client ID from route params
    const clientId = getRouterParam(event, 'id')

    if (!clientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Client ID is required'
      })
    }

    // Get client (must belong to the provider)
    const client = await db.select().from(clients)
      .where(and(
        eq(clients.id, clientId),
        eq(clients.providerId, sessionData.userId)
      ))
      .limit(1)

    if (!client.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Client not found'
      })
    }

    return {
      success: true,
      client: client[0]
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Get client error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get client'
    })
  }
})