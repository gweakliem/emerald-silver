import { db } from '~/lib/db'
import { worksheetTemplates } from '~/lib/db/schema'
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

    // Get all active worksheet templates for this provider
    const templates = await db.select({
      id: worksheetTemplates.id,
      title: worksheetTemplates.title,
      description: worksheetTemplates.description,
      type: worksheetTemplates.type,
      pdfUrl: worksheetTemplates.pdfUrl,
      googleFormsUrl: worksheetTemplates.googleFormsUrl,
      createdAt: worksheetTemplates.createdAt
    })
    .from(worksheetTemplates)
    .where(and(
      eq(worksheetTemplates.providerId, sessionData.userId),
      eq(worksheetTemplates.isActive, true)
    ))
    .orderBy(worksheetTemplates.createdAt)

    return {
      success: true,
      templates
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Get worksheet templates error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get worksheet templates'
    })
  }
})