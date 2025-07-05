import { db } from '~/lib/db'
import { users, clients, worksheetInstances } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { eq, and, count, sql, inArray } from 'drizzle-orm'

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

    // Get total clients for this provider
    const totalClientsResult = await db
      .select({ count: count() })
      .from(clients)
      .where(eq(clients.providerId, providerId))

    const totalClients = totalClientsResult[0]?.count || 0

    // Get active worksheets (assigned but not completed)
    const activeWorksheetsResult = await db
      .select({ count: count() })
      .from(worksheetInstances)
      .where(
        and(
          eq(worksheetInstances.providerId, providerId),
          inArray(worksheetInstances.status, ['pending', 'in_progress', 'overdue'])
        )
      )

    const activeWorksheets = activeWorksheetsResult[0]?.count || 0

    // Get pending reviews (completed worksheets awaiting review)
    const pendingReviewsResult = await db
      .select({ count: count() })
      .from(worksheetInstances)
      .where(
        and(
          eq(worksheetInstances.providerId, providerId),
          eq(worksheetInstances.status, 'completed')
        )
      )

    const pendingReviews = pendingReviewsResult[0]?.count || 0

    // Get recent activity (active clients in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivityResult = await db
      .select({ count: count() })
      .from(clients)
      .where(
        and(
          eq(clients.providerId, providerId),
          eq(clients.isActive, true),
          sql`${clients.updatedAt} >= ${thirtyDaysAgo.toISOString()}`
        )
      )

    const recentActivity = recentActivityResult[0]?.count || 0

    return {
      success: true,
      stats: {
        totalClients,
        activeWorksheets,
        pendingReviews,
        recentActivity
      }
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Provider stats error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load provider statistics'
    })
  }
})