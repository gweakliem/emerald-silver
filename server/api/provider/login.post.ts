// This endpoint is no longer used - providers now use OTP authentication
// The login flow is now: /api/provider/send-otp -> /api/provider/verify-otp
export default defineEventHandler(async (event) => {
  throw createError({
    statusCode: 404,
    statusMessage: 'This endpoint has been replaced with OTP authentication'
  })
})