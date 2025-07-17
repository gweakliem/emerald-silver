import { db } from '~/lib/db'
import { worksheetTemplates, worksheetInstances } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { eq, and, count } from 'drizzle-orm'

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

    const worksheetId = getRouterParam(event, 'id')
    
    if (!worksheetId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Worksheet ID is required'
      })
    }

    // Check if worksheet exists and belongs to the provider
    const worksheet = await db.select()
      .from(worksheetTemplates)
      .where(and(
        eq(worksheetTemplates.id, worksheetId),
        eq(worksheetTemplates.providerId, sessionData.userId)
      ))
      .limit(1)

    if (worksheet.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Worksheet not found'
      })
    }

    // Check if worksheet has any active instances
    const instanceCount = await db.select({ count: count() })
      .from(worksheetInstances)
      .where(eq(worksheetInstances.templateId, worksheetId))

    if (instanceCount[0].count > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Cannot delete worksheet with active assignments'
      })
    }

    // Delete the worksheet template
    await db.delete(worksheetTemplates)
      .where(and(
        eq(worksheetTemplates.id, worksheetId),
        eq(worksheetTemplates.providerId, sessionData.userId)
      ))

    return {
      success: true,
      message: 'Worksheet deleted successfully'
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Delete worksheet error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete worksheet'
    })
  }
})