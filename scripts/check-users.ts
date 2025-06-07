import { db } from '../lib/db'
import { users } from '../lib/db/schema'

async function checkUsers() {
  try {
    const allUsers = await db.select().from(users)
    
    console.log('📊 All users in database:')
    console.table(allUsers)
    
    const adminUsers = allUsers.filter(user => user.role === 'admin')
    console.log('\n👑 Admin users:')
    console.table(adminUsers)
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  }

  process.exit(0)
}

checkUsers()