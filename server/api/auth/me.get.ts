import { verifySession } from '~/lib/auth/session'
import { db } from '~/lib/db'
import { users, clients } from '~/lib/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    const sessionToken = getCookie(event, 'session-token')
    
    if (!sessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    const sessionData = verifySession(sessionToken)
    
    if (!sessionData) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid session'
      })
    }

    let userData

    if (sessionData.role === 'client') {
      // Get client data
      const client = await db
        .select({
          id: clients.id,
          name: clients.name,
          email: clients.email,
          phone: clients.phone,
          providerId: clients.providerId,
        })
        .from(clients)
        .where(eq(clients.id, sessionData.userId))
        .limit(1)

      if (client.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Client not found'
        })
      }

      userData = {
        ...client[0],
        role: 'client'
      }
    } else {
      // Get user data (admin/provider)
      const user = await db
        .select({
          id: users.id,
          role: users.role,
          name: users.name,
          email: users.email,
          phone: users.phone,
        })
        .from(users)
        .where(eq(users.id, sessionData.userId))
        .limit(1)

      if (user.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }

      userData = user[0]
    }

    return { user: userData }

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