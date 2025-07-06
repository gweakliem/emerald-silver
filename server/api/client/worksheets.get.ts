import { db } from '~/lib/db'
import { worksheetInstances, worksheetTemplates } from '~/lib/db/schema'
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

    // Get all worksheet instances assigned to this client
    const assignedWorksheets = await db
      .select({
        id: worksheetInstances.id,
        status: worksheetInstances.status,
        dueDate: worksheetInstances.dueDate,
        assignedAt: worksheetInstances.assignedAt,
        completedAt: worksheetInstances.completedAt,
        title: worksheetTemplates.title,
        description: worksheetTemplates.description,
        type: worksheetTemplates.type,
        pdfUrl: worksheetTemplates.pdfUrl,
        googleFormsUrl: worksheetTemplates.googleFormsUrl
      })
      .from(worksheetInstances)
      .innerJoin(worksheetTemplates, eq(worksheetInstances.templateId, worksheetTemplates.id))
      .where(
        and(
          eq(worksheetInstances.clientId, clientId),
          eq(worksheetTemplates.isActive, true)
        )
      )
      .orderBy(worksheetInstances.assignedAt)

    return {
      success: true,
      worksheets: assignedWorksheets
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Client worksheets error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load worksheets'
    })
  }
})