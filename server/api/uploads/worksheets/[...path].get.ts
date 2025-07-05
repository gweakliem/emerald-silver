import { promises as fs } from 'fs'
import { join } from 'path'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const path = getRouterParam(event, 'path')
    
    if (!path) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Path is required'
      })
    }

    // Security: Only allow access to specific file types and prevent directory traversal
    if (!path.match(/^[a-zA-Z0-9_-]+\.pdf$/)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid file path'
      })
    }

    const filePath = join(process.cwd(), 'uploads', 'worksheets', path)
    
    try {
      const fileBuffer = await fs.readFile(filePath)
      
      // Set appropriate headers for PDF files
      setHeader(event, 'Content-Type', 'application/pdf')
      setHeader(event, 'Content-Disposition', `inline; filename="${path}"`)
      setHeader(event, 'Cache-Control', 'public, max-age=3600')
      
      return fileBuffer
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw createError({
          statusCode: 404,
          statusMessage: 'File not found'
        })
      }
      throw error
    }
  } catch (error) {
    if (error.statusCode) {
      throw error
    }
    
    console.error('File serve error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to serve file'
    })
  }
})