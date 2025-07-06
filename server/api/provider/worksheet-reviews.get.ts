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

    const providerId = sessionData.userId

    // Get completed worksheets that need review
    const pendingReviews = await db
      .select({
        id: worksheetInstances.id,
        status: worksheetInstances.status,
        assignedAt: worksheetInstances.assignedAt,
        completedAt: worksheetInstances.completedAt,
        providerNotes: worksheetInstances.providerNotes,
        dueDate: worksheetInstances.dueDate,
        // Worksheet template info
        title: worksheetTemplates.title,
        description: worksheetTemplates.description,
        type: worksheetTemplates.type,
        pdfUrl: worksheetTemplates.pdfUrl,
        googleFormsUrl: worksheetTemplates.googleFormsUrl,
        // Client info
        clientName: clients.name,
        clientEmail: clients.email,
        clientId: clients.id
      })
      .from(worksheetInstances)
      .innerJoin(worksheetTemplates, eq(worksheetInstances.templateId, worksheetTemplates.id))
      .innerJoin(clients, eq(worksheetInstances.clientId, clients.id))
      .where(
        and(
          eq(worksheetInstances.providerId, providerId),
          eq(worksheetInstances.status, 'completed')
        )
      )
      .orderBy(worksheetInstances.completedAt)

    return {
      success: true,
      reviews: pendingReviews
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Provider worksheet reviews error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load worksheet reviews'
    })
  }
})