import { Resend } from 'resend'
import twilio from 'twilio'

// Initialize services only if credentials exist
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) 
  : null

export async function sendOTPEmail(email: string, code: string) {
  try {
    // In development, log the code instead of sending email if no API key
    if (!resend || process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Email OTP Code for', email, ':', code)
      return { success: true }
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to: email,
      subject: 'Your Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Login Code</h2>
          <p>Use this code to complete your login:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}

export async function sendOTPSMS(phone: string, code: string) {
  try {
    // In development, log the code instead of sending SMS if no API credentials
    if (!twilioClient || process.env.NODE_ENV === 'development') {
      console.log('📱 [DEV] SMS OTP Code for', phone, ':', code)
      return { success: true }
    }

    await twilioClient.messages.create({
      body: `Your login code is: ${code}. This code expires in 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return { success: false, error }
  }
}