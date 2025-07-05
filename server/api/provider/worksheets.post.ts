import { db } from '~/lib/db'
import { worksheetTemplates } from '~/lib/db/schema'
import { verifySession } from '~/lib/auth/session'
import { promises as fs } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'

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

    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No data provided'
      })
    }

    // Extract form fields
    const fields = {}
    let pdfFile = null

    for (const part of formData) {
      if (part.name === 'pdfFile') {
        pdfFile = part
      } else if (part.data) {
        fields[part.name] = part.data.toString()
      }
    }

    const { title, description, type, googleFormsUrl, dueDate } = fields

    // Validate required fields
    if (!title || !type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title and type are required'
      })
    }

    if (type === 'pdf' && !pdfFile) {
      throw createError({
        statusCode: 400,
        statusMessage: 'PDF file is required for PDF type worksheets'
      })
    }

    if (type === 'google_forms' && !googleFormsUrl) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Google Forms URL is required for Google Forms type worksheets'
      })
    }

    // Validate Google Forms URL format
    if (type === 'google_forms' && googleFormsUrl) {
      try {
        new URL(googleFormsUrl)
      } catch {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid Google Forms URL format'
        })
      }
    }

    // Validate PDF file if provided
    if (pdfFile) {
      if (!pdfFile.type || pdfFile.type !== 'application/pdf') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Only PDF files are allowed'
        })
      }
      
      if (pdfFile.data.length > 10 * 1024 * 1024) { // 10MB limit
        throw createError({
          statusCode: 400,
          statusMessage: 'PDF file must be less than 10MB'
        })
      }
    }

    let pdfUrl = null

    // Handle PDF file upload
    if (pdfFile) {
      try {
        // Create uploads directory if it doesn't exist
        const uploadDir = join(process.cwd(), 'uploads', 'worksheets')
        await fs.mkdir(uploadDir, { recursive: true })

        // Generate unique filename
        const fileExtension = '.pdf'
        const filename = `${randomUUID()}${fileExtension}`
        const filepath = join(uploadDir, filename)

        // Save file
        await fs.writeFile(filepath, pdfFile.data)
        
        // Store relative path for database
        pdfUrl = `/uploads/worksheets/${filename}`
      } catch (error) {
        console.error('File upload error:', error)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to upload PDF file'
        })
      }
    }

    // Create worksheet template
    const [newWorksheet] = await db.insert(worksheetTemplates).values({
      providerId: sessionData.userId,
      title: title.trim(),
      description: description?.trim() || null,
      type,
      pdfUrl,
      googleFormsUrl: type === 'google_forms' ? googleFormsUrl.trim() : null,
      isActive: true,
    }).returning({
      id: worksheetTemplates.id,
      title: worksheetTemplates.title,
      description: worksheetTemplates.description,
      type: worksheetTemplates.type,
      pdfUrl: worksheetTemplates.pdfUrl,
      googleFormsUrl: worksheetTemplates.googleFormsUrl,
      isActive: worksheetTemplates.isActive,
      createdAt: worksheetTemplates.createdAt
    })

    return {
      success: true,
      worksheet: newWorksheet,
      message: 'Worksheet created successfully'
    }

  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('Create worksheet error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create worksheet'
    })
  }
})