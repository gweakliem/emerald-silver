import { db } from '../lib/db'
import { users, clients } from '../lib/db/schema'

async function seedSampleData() {
  try {
    console.log(' Seeding sample data...')

    // Create sample providers
    const providers = await db.insert(users).values([
      {
        email: 'provider1@example.com',
        role: 'provider',
        name: 'Dr. Sarah Johnson',
        isActive: true,
      },
      {
        email: 'provider2@example.com', 
        role: 'provider',
        name: 'Dr. Michael Chen',
        isActive: true,
      },
      {
        email: 'provider3@example.com',
        role: 'provider', 
        name: 'Dr. Emily Rodriguez',
        isActive: true,
      },
      {
        email: 'provider4@example.com',
        role: 'provider',
        name: 'Dr. David Smith',
        isActive: false, // Inactive provider
      }
    ]).returning()

    console.log(' Created providers:', providers.length)

    // Create sample clients for the first provider
    const sampleClients = await db.insert(clients).values([
      {
        providerId: providers[0].id,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+15551234567',
        notes: 'Working on anxiety management',
        isActive: true,
      },
      {
        providerId: providers[0].id,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+15551234568',
        notes: 'Depression therapy sessions',
        isActive: true,
      },
      {
        providerId: providers[1].id,
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        phone: '+15551234569',
        notes: 'Couples therapy',
        isActive: true,
      },
      {
        providerId: providers[1].id,
        name: 'Alice Brown',
        email: 'alice.brown@example.com',
        phone: '+15551234570',
        notes: 'PTSD treatment',
        isActive: true,
      },
      {
        providerId: providers[2].id,
        name: 'Charlie Davis',
        email: 'charlie.davis@example.com',
        phone: '+15551234571',
        notes: 'Substance abuse counseling',
        isActive: false, // Inactive client
      }
    ]).returning()

    console.log('✅ Created clients:', sampleClients.length)

    console.log('\n📊 Sample data summary:')
    console.log(`- ${providers.filter(t => t.isActive).length} active providers`)
    console.log(`- ${providers.filter(t => !t.isActive).length} inactive providers`) 
    console.log(`- ${sampleClients.filter(c => c.isActive).length} active clients`)
    console.log(`- ${sampleClients.filter(c => !c.isActive).length} inactive clients`)

    console.log('\n🎉 Sample data seeded successfully!')

  } catch (error) {
    if (error.code === '23505') {
      console.log('ℹ️  Sample data already exists (duplicate email)')
    } else {
      console.error('❌ Error seeding sample data:', error.message)
    }
  }

  process.exit(0)
}

seedSampleData()