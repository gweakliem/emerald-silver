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

export async function sendInvitationEmail(email: string, clientName: string, loginUrl: string) {
  try {
    // In development, log the invitation instead of sending email if no API key
    if (!resend || process.env.NODE_ENV === 'development') {
      console.log('📧 [DEV] Invitation Email for', email, '- Login at:', loginUrl)
      return { success: true }
    }

    await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@example.com',
      to: email,
      subject: 'Welcome - Your Therapist Has Invited You',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome ${clientName}!</h2>
          <p>Your therapist has invited you to access your personalized worksheets and activities.</p>
          
          <div style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Getting Started</h3>
            <p>Click the link below to access your client portal:</p>
            <a href="${loginUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0;">
              Access Your Portal
            </a>
          </div>
          
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Secure login using your email or phone number</li>
            <li>Access to worksheets assigned by your therapist</li>
            <li>Easy-to-use interface optimized for mobile devices</li>
          </ul>
          
          <p>If you have any questions, please contact your therapist directly.</p>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you did not expect this invitation, please ignore this email.
          </p>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send invitation email:', error)
    return { success: false, error }
  }
}

export async function sendInvitationSMS(phone: string, clientName: string, loginUrl: string) {
  try {
    // In development, log the invitation instead of sending SMS if no API credentials
    if (!twilioClient || process.env.NODE_ENV === 'development') {
      console.log('📱 [DEV] Invitation SMS for', phone, '- Login at:', loginUrl)
      return { success: true }
    }

    await twilioClient.messages.create({
      body: `Hi ${clientName}! Your therapist has invited you to access your worksheets. Login here: ${loginUrl}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    return { success: true }
  } catch (error) {
    console.error('Failed to send invitation SMS:', error)
    return { success: false, error }
  }
}