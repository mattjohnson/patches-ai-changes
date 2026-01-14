# TaskFlow Pro

A modern project and task management application built with Next.js.

## Features

- Project management with color coding and archiving
- Task tracking with status, priority, and due dates
- Real-time updates and optimistic UI
- OAuth authentication (GitHub, Google)
- Responsive design with smooth animations

## Tech Stack

- **Framework**: Next.js with TypeScript
- **Styling**: styled-components
- **Data Fetching**: React Query
- **Forms**: React Hook Form with Yup validation
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then update the `.env` file with your database credentials and OAuth app keys.

4. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

5. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run prisma:studio` - Open Prisma Studio

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions and configurations
├── pages/          # Next.js pages and API routes
├── styles/         # Global styles
├── types/          # TypeScript type definitions
└── mocks/          # Mock data for testing
```

## License

MIT
