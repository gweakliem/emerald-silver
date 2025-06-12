# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A mobile-responsive web application for providers to manage worksheets for clients. Built with Nuxt.js and TypeScript, deployed to Vercel.

## Development Commands

### Project Setup
```bash
# Install dependencies
npm install

# Set up database
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema changes to database
npm run db:seed      # Seed database with initial data (if available)
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run typecheck

# Linting and formatting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
```

### Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run single test file
npm run test -- path/to/test.spec.ts
```

### Database Operations
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Reset database (development only)
npm run db:reset

# Open database studio
npm run db:studio
```

## Environment Configuration

### Required Environment Variables
Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL=postgresql://...          # Neon PostgreSQL connection string

# Authentication
NEXTAUTH_SECRET=your-secret-key        # Session encryption key
NEXTAUTH_URL=http://localhost:3000     # Base URL for auth callbacks

# SMS (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=+1234567890        # Your Twilio phone number

# Email (Resend)
RESEND_API_KEY=re_...                  # Resend API key
FROM_EMAIL=noreply@yourdomain.com      # Sender email address

# Application
NODE_ENV=development                   # Environment (development/production)
```

## Architecture

### Tech Stack
- **Frontend**: Nuxt.js with TypeScript
- **Database**: PostgreSQL with Neon (serverless, Vercel-optimized)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Deployment**: Vercel
- **Authentication**: Custom OTP system (SMS/Email)
- **SMS**: Twilio for OTP delivery
- **Email**: Resend for OTP delivery and notifications

### Project Structure
```
/
├── components/          # Vue components
│   ├── admin/          # Admin-specific components
│   ├── provider/      # Provider-specific components
│   ├── client/         # Client-specific components
│   └── shared/         # Shared components
├── pages/              # Nuxt.js pages/routes
├── server/             # Server-side code
│   └── api/           # API routes
├── lib/               # Shared utilities and configurations
│   ├── db/            # Database schema and utilities
│   └── auth/          # Authentication utilities
├── types/             # TypeScript type definitions
└── assets/            # Static assets
```

### Core User Flows
1. **Admin Flow**: OTP Login → Dashboard → Manage Providers → System oversight
2. **Provider Flow**: Email/Password Login → Dashboard → Manage clients/worksheets → Review submissions
3. **Client Flow**: OTP Login → Dashboard → Complete worksheets → Submit

### Key Data Models
- **Users**: Providers (email/password auth) and system admins (OTP auth)
- **Clients**: Provider-owned records with phone/email for OTP authentication
- **Worksheet Templates**: Form definitions with prompts and response fields
- **Worksheet Instances**: Client-completed worksheets with Provider notes
- **OTP Codes**: Time-limited (5min) authentication codes for clients and admins

## Authentication Strategy
- **Providers**: Standard email/password authentication
- **Admins**: OTP-based authentication via SMS or email (same system as clients)
- **Clients**: OTP-based authentication via SMS or email
- **Access Control**: Providers can only access their own clients' data, Admins can manage providers

## Features

### User Authentication
- Provider authentication via OTP (SMS/email) with 5-minute expiration
- Admin authentication via OTP (SMS/email) with 5-minute expiration
- Client authentication via OTP (SMS/email) with 5-minute expiration
- Secure access control ensuring providers only see their clients and admins can manage providers

### Admin Dashboard
- Provider management interface (add, edit, remove providers)
- System overview and management

### Provider Dashboard
- Client management interface
- Worksheet to-do list with review links
- Worksheet template management access

### Client Management
- CRUD operations for client records
- Worksheet assignment with automatic notifications
- Provider-scoped access control

### Worksheet System
- Template creation and management
- Form-based worksheets with prompt/response sections
- Assignment workflow with notifications
- Review system with provider notes
- PDF export functionality

### Client Experience
- Simple dashboard showing assigned worksheets
- Direct worksheet completion interface
- Deep-link support for direct worksheet access

## Development Guidelines

### File Organization
When implementing:
- Separate components for provider and client interfaces
- Shared components for common UI elements
- API routes for backend functionality

### Security Considerations
- Implement proper session management
- Validate provider-client relationships on all operations
- Secure OTP generation and validation
- Input validation and sanitization

### Mobile Responsiveness
- Design mobile-first approach
- Ensure all forms work well on mobile devices
- Touch-friendly interface elements

## Important Instructions
- Do what has been asked; nothing more, nothing less
- NEVER create files unless absolutely necessary
- ALWAYS prefer editing existing files over creating new ones
- NEVER proactively create documentation files unless explicitly requested
- If an action requires a manual step, update the README.md file with the instructions. README.md should ALWAYS contain all the instructions needed to run the application from a fresh clone of the repository.
