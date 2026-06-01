# Noir Sane - Luxury Chocolate Shopping Platform

A full-stack e-commerce platform for luxury chocolates built with React, TypeScript, Express, and PostgreSQL.

## Features

- **User Authentication**: JWT-based auth with role-based access control
- **Product Catalog**: Browse and search luxury chocolate products
- **Shopping Cart**: Add, update, and remove items from cart
- **Order Management**: Complete order flow with payment processing
- **Admin Panel**: Product, category, stock, and order management
- **Delivery Tracking**: Real-time order tracking for customers
- **Payment Integration**: UPI payment support with verification

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- TailwindCSS for styling
- Radix UI components
- React Router for navigation
- Zustand for state management
- React Query for API calls

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Zod for validation
- Helmet for security
- Rate limiting
- Swagger API documentation

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `noir_sane`
3. Update the `.env` file with your database credentials

#### Option B: PostgreSQL via Package Manager
```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql
createdb noir_sane

# On Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createdb noir_sane
```

### 3. Environment Configuration

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Key environment variables:
```env
DATABASE_URL="postgresql:@localhost:5432/noir_sane?schema=public"
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=4000
CORS_ORIGIN="http://localhost:8080"
ADMIN_EMAIL="admin@noirsane.com"
ADMIN_PASSWORD="Admin@12345"
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

### 5. Start the Application

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/docs

## Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start frontend only
npm run backend:dev      # Start backend only

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate    # Run database migrations
npm run prisma:seed      # Seed database with initial data

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode

# Code Quality
npm run lint             # Run ESLint
npm run backend:typecheck # Type check backend
```

## Default Credentials

### Admin User
- Email: `admin@noirsane.com`
- Password: `Admin@12345`

### Delivery Partner
- Email: `delivery@noirsane.com`
- Password: `Admin@12345`

## API Documentation

Once the backend is running, visit http://localhost:4000/docs for interactive API documentation.

## Project Structure

```
gilded-bites/
├── src/                 # Frontend source code
│   ├── components/      # React components
│   ├── pages/          # Page components
│   ├── store/          # State management
│   ├── lib/            # Utilities and API client
│   └── services/       # API services
├── backend/            # Backend source code
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── middleware/ # Express middleware
│   │   ├── schemas/    # Validation schemas
│   │   └── utils/      # Backend utilities
│   └── prisma/         # Database schema and migrations
└── public/             # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.
