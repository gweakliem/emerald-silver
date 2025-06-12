import jwt from 'jsonwebtoken'
import { users } from '../db/schema'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key'

export interface SessionData {
  userId: string
  role: 'admin' | 'provider'
  email?: string
  phone?: string
}

export function createSession(userData: SessionData): string {
  return jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' })
}

export function verifySession(token: string): SessionData | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionData
  } catch {
    return null
  }
}

export function isValidIdentifier(identifier: string): { type: 'email' | 'phone'; valid: boolean } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/

  if (emailRegex.test(identifier)) {
    return { type: 'email', valid: true }
  }
  
  if (phoneRegex.test(identifier.replace(/\s/g, ''))) {
    return { type: 'phone', valid: true }
  }

  return { type: 'email', valid: false }
}