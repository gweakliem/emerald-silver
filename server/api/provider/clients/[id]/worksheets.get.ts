import { db } from '~/lib/db'
import { worksheetInstances, worksheetTemplates, clients } from '~/lib/db/schema'
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

    // Verify client belongs to provider
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

    // Get worksheet instances with template details
    const worksheets = await db.select({
      id: worksheetInstances.id,
      templateId: worksheetInstances.templateId,
      dueDate: worksheetInstances.dueDate,
      status: worksheetInstances.status,
      assignedAt: worksheetInstances.assignedAt,
      completedAt: worksheetInstances.completedAt,
      providerNotes: worksheetInstances.providerNotes,
      template: {
        id: worksheetTemplates.id,
        title: worksheetTemplates.title,
        description: worksheetTemplates.description,
        type: worksheetTemplates.type,
        pdfUrl: worksheetTemplates.pdfUrl,
        googleFormsUrl: worksheetTemplates.googleFormsUrl
      }
    })
    .from(worksheetInstances)
    .innerJoin(worksheetTemplates, eq(worksheetInstances.templateId, worksheetTemplates.id))
    .where(and(
      eq(worksheetInstances.clientId, clientId),
      eq(worksheetInstances.providerId, sessionData.userId)
    ))
    .orderBy(worksheetInstances.assignedAt)

    return {
      success: true,
      worksheets
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Get client worksheets error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to get client worksheets'
    })
  }
})