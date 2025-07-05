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

    // Parse request body
    const { templateId, clientId, dueDate, notes } = await readBody(event)

    // Validate required fields
    if (!templateId || !clientId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Template ID and Client ID are required'
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

    // Verify template belongs to provider
    const template = await db.select().from(worksheetTemplates)
      .where(and(
        eq(worksheetTemplates.id, templateId),
        eq(worksheetTemplates.providerId, sessionData.userId),
        eq(worksheetTemplates.isActive, true)
      ))
      .limit(1)

    if (!template.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Worksheet template not found'
      })
    }

    // Create worksheet instance
    const [newWorksheet] = await db.insert(worksheetInstances).values({
      templateId,
      clientId,
      providerId: sessionData.userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      providerNotes: notes || null,
      status: 'pending',
      assignedAt: new Date()
    }).returning({
      id: worksheetInstances.id,
      templateId: worksheetInstances.templateId,
      clientId: worksheetInstances.clientId,
      dueDate: worksheetInstances.dueDate,
      status: worksheetInstances.status,
      assignedAt: worksheetInstances.assignedAt,
      completedAt: worksheetInstances.completedAt,
      providerNotes: worksheetInstances.providerNotes
    })

    // Return the worksheet with template details
    const worksheetWithTemplate = {
      ...newWorksheet,
      template: template[0]
    }

    return {
      success: true,
      worksheet: worksheetWithTemplate,
      message: 'Worksheet assigned successfully'
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Assign worksheet error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to assign worksheet'
    })
  }
})