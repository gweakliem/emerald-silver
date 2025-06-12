export default defineEventHandler(async (event) => {
  // Clear the session cookie
  setCookie(event, 'session-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Immediately expire
  })

  return { success: true, message: 'Logged out successfully' }
})