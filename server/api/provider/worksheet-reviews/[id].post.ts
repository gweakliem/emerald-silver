import { db } from '~/lib/db'
import { worksheetInstances } from '~/lib/db/schema'
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

    const providerId = sessionData.userId
    const worksheetId = getRouterParam(event, 'id')
    const { notes, action } = await readBody(event)

    if (!worksheetId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Worksheet ID is required'
      })
    }

    if (!action || !['approve', 'request_revision'].includes(action)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valid action is required (approve or request_revision)'
      })
    }

    // Verify worksheet belongs to this provider and is completed
    const existingWorksheet = await db
      .select()
      .from(worksheetInstances)
      .where(
        and(
          eq(worksheetInstances.id, worksheetId),
          eq(worksheetInstances.providerId, providerId),
          eq(worksheetInstances.status, 'completed')
        )
      )
      .limit(1)

    if (existingWorksheet.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Worksheet not found or not available for review'
      })
    }

    // Update worksheet with review
    const newStatus = action === 'approve' ? 'approved' : 'revision_requested'
    
    const updatedWorksheet = await db
      .update(worksheetInstances)
      .set({
        status: newStatus,
        providerNotes: notes || null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(worksheetInstances.id, worksheetId),
          eq(worksheetInstances.providerId, providerId)
        )
      )
      .returning()

    return {
      success: true,
      message: action === 'approve' ? 'Worksheet approved' : 'Revision requested',
      worksheet: updatedWorksheet[0]
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Worksheet review error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit review'
    })
  }
})