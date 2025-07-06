import { db } from '~/lib/db'
import { worksheetInstances } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  try {
    // Verify client session
    const sessionToken = getCookie(event, 'session-token')
    
    if (!sessionToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated'
      })
    }

    const sessionData = verifySession(sessionToken)
    
    if (!sessionData || sessionData.role !== 'client') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Client access required'
      })
    }

    const clientId = sessionData.userId
    const worksheetId = getRouterParam(event, 'id')

    if (!worksheetId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Worksheet ID is required'
      })
    }

    // Verify that this worksheet belongs to the client and is not already completed
    const existingWorksheet = await db
      .select()
      .from(worksheetInstances)
      .where(
        and(
          eq(worksheetInstances.id, worksheetId),
          eq(worksheetInstances.clientId, clientId)
        )
      )
      .limit(1)

    if (existingWorksheet.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Worksheet not found or access denied'
      })
    }

    const worksheet = existingWorksheet[0]

    if (worksheet.status === 'completed') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Worksheet is already completed'
      })
    }

    // Update worksheet status to completed
    const updatedWorksheet = await db
      .update(worksheetInstances)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date()
      })
      .where(
        and(
          eq(worksheetInstances.id, worksheetId),
          eq(worksheetInstances.clientId, clientId)
        )
      )
      .returning()

    return {
      success: true,
      message: 'Worksheet marked as completed',
      worksheet: updatedWorksheet[0]
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Complete worksheet error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to complete worksheet'
    })
  }
})