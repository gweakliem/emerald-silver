import { pgTable, uuid, varchar, timestamp, text, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique(),
  phone: varchar('phone', { length: 20 }),
  role: varchar('role', { length: 20 }).notNull().default('provider'), // 'admin' | 'provider'
  name: varchar('name', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  identifier: varchar('identifier', { length: 255 }).notNull(), // email or phone
  code: varchar('code', { length: 6 }).notNull(),
  type: varchar('type', { length: 10 }).notNull(), // 'email' | 'sms'
  purpose: varchar('purpose', { length: 20 }).notNull().default('login'), // 'login' | 'verification'
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  notes: text('notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const worksheetTemplates = pgTable('worksheet_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 20 }).notNull(), // 'pdf' | 'google_forms'
  pdfUrl: varchar('pdf_url', { length: 500 }),
  googleFormsUrl: varchar('google_forms_url', { length: 500 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const worksheetInstances = pgTable('worksheet_instances', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: uuid('template_id').notNull().references(() => worksheetTemplates.id),
  clientId: uuid('client_id').notNull().references(() => clients.id),
  providerId: uuid('provider_id').notNull().references(() => users.id),
  dueDate: timestamp('due_date'),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'overdue'
  assignedAt: timestamp('assigned_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  providerNotes: text('provider_notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})