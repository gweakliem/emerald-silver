# Emerald Silver

A mobile-responsive web application for providers to manage worksheets for clients. Built with Nuxt.js and TypeScript, featuring OTP-based authentication for admins and clients, with standard email/password authentication for providers.

## Features

- **Admin Dashboard**: OTP-based authentication with system oversight capabilities
- **Provider Management**: Email/password authentication with client and worksheet management
- **Client Portal**: OTP-based authentication for worksheet completion
- **Worksheet System**: Template creation, assignment, and review workflow
- **Mobile-First Design**: Responsive interface optimized for all devices

## Tech Stack

- **Frontend**: Nuxt.js with TypeScript
- **Database**: PostgreSQL with Neon (serverless)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Authentication**: Custom OTP system (SMS/Email) + traditional auth
- **SMS**: Twilio for OTP delivery
- **Email**: Resend for OTP delivery and notifications
- **Deployment**: Vercel

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/emerald_silver_dev"

# Authentication
NEXTAUTH_SECRET="your-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# SMS (Twilio)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Application
NODE_ENV="development"
```

### 3. Database Setup with Supabase (Recommended)

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project" 
3. Choose your organization
4. Enter project details:
   - **Name**: `emerald-silver`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project" (takes ~2 minutes)

#### Step 2: Get Database Connection
1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (looks like `postgresql://postgres:[YOUR-PASSWORD]@...`)
5. Replace `[YOUR-PASSWORD]` with the password you created

#### Step 3: Update Environment Variables
Update your `.env` file with the Supabase connection string:

```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
```

#### Step 4: Push Schema to Database
```bash
# Push schema directly to Supabase (recommended for development)
npm run db:push
```

✅ **Success!** You should see output like:
```
Your database is now in sync with your schema
```

#### Step 5: Verify Database Setup (Optional)
You can view your tables in Supabase:
1. Go to **Table Editor** in your Supabase dashboard
2. You should see 3 tables: `users`, `clients`, `otp_codes`
3. Or use Drizzle Studio: `npm run db:studio`

#### Alternative Options:

**Local PostgreSQL with Docker:**
```bash
# Start local PostgreSQL with Docker
docker-compose up -d
# Then: npm run db:push
```

**Traditional Migration Approach:**

```bash
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
```

### 4. Create Admin User

Once your database is set up and schema is pushed, create an admin user:

```bash
# Create admin user automatically
npm run create-admin
```

Or manually add to your database:
```sql
INSERT INTO users (email, phone, role, name, is_active) 
VALUES ('admin@example.com', '+1234567890', 'admin', 'System Administrator', true);
```

You can customize the admin user by setting environment variables:
```bash
ADMIN_EMAIL="your-admin@example.com" npm run create-admin
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` and navigate to **Admin Login** to test the OTP authentication flow.

## Testing the Admin Login

1. **Start the server**: `npm run dev` and go to `http://localhost:3000`
2. **Navigate to Admin Login**: Click "Admin Login" or go to `/admin/login`
3. **Enter Admin Credentials**: Use `admin@example.com` or `+1234567890` (from the created admin user)
4. **Receive OTP**: Check your email/SMS for the 6-digit verification code
5. **Verify Code**: Enter the code on the verification page
6. **Access Dashboard**: Successfully authenticated admins will be redirected to `/admin/dashboard`

**Note**: Make sure your Twilio and Resend API keys are configured in `.env` to receive OTP codes.

## Development Commands

### Database Operations
```bash
npm run db:generate    # Generate new migration from schema changes
npm run db:migrate     # Apply pending migrations
npm run db:push        # Push schema directly (development)
npm run db:studio      # Open Drizzle Studio (database GUI)
```

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm run typecheck     # Run TypeScript checks
```

## Project Structure

```
/
├── components/          # Vue components
│   ├── admin/          # Admin-specific components
│   ├── provider/      # Provider-specific components
│   ├── client/         # Client-specific components
│   └── shared/         # Shared components
├── pages/              # Nuxt.js pages/routes
│   ├── admin/          # Admin login and dashboard
│   └── index.vue       # Home page
├── server/             # Server-side code
│   └── api/           # API routes
│       └── auth/      # Authentication endpoints
├── lib/               # Shared utilities and configurations
│   ├── db/            # Database schema and utilities
│   └── auth/          # Authentication utilities
├── middleware/        # Route protection middleware
└── assets/            # Static assets and styles
```

## Authentication Flow

### Admin Authentication (OTP)
1. Admin enters email or phone number
2. System generates 6-digit OTP code (5-minute expiration)
3. Code sent via Resend (email) or Twilio (SMS)
4. Admin enters code for verification
5. JWT session token created and stored in HTTP-only cookie

### Session Management
- Sessions last 24 hours
- HTTP-only cookies for security
- Automatic session verification via middleware
- Protected routes redirect to login if session invalid

## Database Schema

### Core Tables
- **users**: Admins and providers with role-based access
- **clients**: Client records managed by providers
- **otp_codes**: Time-limited verification codes
- **worksheet_templates**: Form definitions (future)
- **worksheet_instances**: Completed worksheets (future)

## Security Features

- **Input Validation**: Server-side validation for all inputs
- **Session Management**: Secure JWT tokens with HTTP-only cookies
- **OTP Security**: Time-limited codes with single-use enforcement
- **Role-based Access**: Middleware protection for admin/provider routes
- **CSRF Protection**: SameSite cookie configuration

## Deployment

This application is designed for deployment on Vercel with Neon PostgreSQL:

1. **Database**: Set up Neon PostgreSQL database
2. **Environment Variables**: Configure all required env vars in Vercel
3. **Build Command**: `npm run build`
4. **Output Directory**: `.output`

For detailed deployment instructions, see the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment).
