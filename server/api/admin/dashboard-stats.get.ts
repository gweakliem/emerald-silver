import { db } from '~/lib/db'
import { users, clients, otpCodes } from '~/lib/db/schema'
import { eq, and, count, gte } from 'drizzle-orm'
import { verifySession } from '~/lib/auth/session'

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

    // Get current time for recent logins (24 hours ago)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Fetch statistics from database
    const [
      totalProvidersResult,
      activeClientsResult,
      recentLoginsResult
    ] = await Promise.all([
      // Count total Providers
      db
        .select({ count: count() })
        .from(users)
        .where(
          and(
            eq(users.role, 'provider'),
            eq(users.isActive, true)
          )
        ),
      
      // Count active clients
      db
        .select({ count: count() })
        .from(clients)
        .where(eq(clients.isActive, true)),
      
      // Count recent OTP logins (last 24 hours)
      db
        .select({ count: count() })
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.purpose, 'login'),
            eq(otpCodes.isUsed, true),
            gte(otpCodes.createdAt, twentyFourHoursAgo)
          )
        )
    ])

    const stats = {
      totalProviders: totalProvidersResult[0]?.count || 0,
      activeClients: activeClientsResult[0]?.count || 0,
      recentLogins: recentLoginsResult[0]?.count || 0,
      systemStatus: 'online'
    }

    return { success: true, stats }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch dashboard statistics'
    })
  }
})