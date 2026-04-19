# Tech Learning Progress Tracker

A modern, full-stack learning progress tracker built with Next.js 16, Prisma 7, NextAuth.js with email/password authentication, and PostgreSQL. Track your technology learning journey with structured phases, tasks, and progress statistics.

## Features

- **Email/Password Authentication**: Sign up and login with secure password hashing (NextAuth.js)
- **Subject Management**: Create and manage learning subjects with priority levels
- **Structured Learning Phases**: 5 predefined learning phases with default tasks
- **Task Tracking**: Mark tasks as complete and track progress
- **Progress Statistics**: View total subjects, completed tasks, and average progress
- **Responsive Design**: Beautiful UI with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **File Upload Ready**: Supabase integration for future file/image uploads

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Prisma 7 ORM
- **Authentication**: NextAuth.js v5 (beta) with Credentials provider & JWT
- **Password Hashing**: bcryptjs
- **Validation**: Zod + react-hook-form
- **State Management**: React hooks + server fetching
- **File Storage**: Supabase (for future uploads)

## Prerequisites

- Node.js 20+ LTS
- PostgreSQL database (local or cloud)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd tech-tracker
pnpm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

#### Required Variables:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/tech_tracker?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

Generate a secret with:
```bash
openssl rand -base64 32
```

#### Supabase (for file uploads, optional):
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 3. Set up Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following models:

- **User**: Stores user information
- **Subject**: Learning subjects with priority and dates
- **Phase**: Learning phases (Foundation, Core Learning, etc.)
- **Task**: Individual tasks within phases

## Default Learning Template

When creating a new subject, the following phases are automatically created with predefined tasks:

1. **Foundation & Planning** - 7 tasks
2. **Core Learning** - 7 tasks
3. **Hands-On Application** - 7 tasks
4. **Community & Professional Development** - 7 tasks
5. **Assessment & Certification** - 7 tasks

## Project Structure

```
tech-tracker/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Main dashboard
│   │   └── page.tsx      # Home page
│   ├── components/       # Reusable components
│   │   ├── SubjectCard.tsx
│   │   ├── PhaseSection.tsx
│   │   ├── TaskItem.tsx
│   │   ├── AddSubjectModal.tsx
│   │   └── StatsDashboard.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client
│   │   ├── supabase.ts         # Supabase client
│   │   ├── learning-template.ts # Default phases/tasks
│   │   └── zod-schemas.ts      # Validation schemas
│   └── generated/
│       └── prisma/             # Generated Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
└── prisma.config.ts           # Prisma configuration
```

## API Routes

- `GET /api/subjects` - Fetch all subjects for logged-in user
- `POST /api/subjects` - Create new subject with default phases
- `DELETE /api/subjects/delete` - Delete a subject
- `POST /api/tasks/toggle` - Toggle task completion
- `POST /api/auth/create-user` - Create user in database after signup

## Development

### Run Prisma Studio (Database GUI)

```bash
npx prisma studio
```

### Create a New Migration

```bash
npx prisma migrate dev --name migration_name
```

### Reset Database

```bash
npx prisma migrate reset
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to set these in your hosting platform:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## License

MIT
