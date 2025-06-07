import { db } from '../lib/db'
import { users } from '../lib/db/schema'

async function createAdmin() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'gordon@eighty-twenty.net'
    const adminPhone = process.env.ADMIN_PHONE || '+17208417234'
    const adminName = process.env.ADMIN_NAME || 'System Administrator'

    const [admin] = await db.insert(users).values({
      email: adminEmail,
      phone: adminPhone,
      role: 'admin',
      name: adminName,
      isActive: true,
    }).returning()

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('📱 Phone:', admin.phone)
    console.log('👤 Name:', admin.name)
    console.log('\n🚀 You can now test the admin login at /admin/login')
    
  } catch (error) {
    if (error.code === '23505') {
      console.log('ℹ️  Admin user already exists')
    } else {
      console.error('❌ Error creating admin user:', error.message)
    }
  }

  process.exit(0)
}

createAdmin()