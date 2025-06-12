import { db } from '../lib/db'
import { users } from '../lib/db/schema'
import { hashPassword } from '../lib/auth/password'

async function createTestProvider() {
  try {
    const email = process.env.TEST_PROVIDER_EMAIL || 'test@provider.com'
    const password = process.env.TEST_PROVIDER_PASSWORD || 'testpass123'
    const name = process.env.TEST_PROVIDER_NAME || 'Dr. Test Provider'

    console.log('🧪 Creating test provider...')

    // Hash the password
    const hashedPassword = await hashPassword(password)

    // Create test provider
    const [provider] = await db.insert(users).values({
      email: email,
      name: name,
      role: 'provider',
      passwordHash: hashedPassword,
      isActive: true,
    }).returning()

    console.log('✅ Test provider created successfully!')
    console.log('📧 Email:', provider.email)
    console.log('🔑 Password:', password)
    console.log('👤 Name:', provider.name)
    console.log('\n🚀 You can now test provider login at /provider/login')

  } catch (error) {
    if (error.code === '23505') {
      console.log('ℹ️  Test provider already exists (duplicate email)')
    } else {
      console.error('❌ Error creating test provider:', error.message)
    }
  }

  process.exit(0)
}

createTestProvider()