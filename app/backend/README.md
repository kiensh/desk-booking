# Desk Booking Backend

A TypeScript backend service for managing desk reservations with automated booking and check-in capabilities.

## Project Structure

```
src/
├── config/           # Configuration management
│   └── index.ts      # Environment variables and app config
├── controllers/      # HTTP request handlers
│   ├── auth.controller.ts
│   ├── cron.controller.ts
│   ├── desk.controller.ts
│   ├── log.controller.ts
│   ├── reservation.controller.ts
│   └── user.controller.ts
├── jobs/             # Background job management
│   ├── scheduler.ts  # Cron job scheduler
│   └── tasks.ts      # Job task definitions
├── lib/              # Core utilities and shared libraries
│   ├── date-utils.ts # Date formatting utilities
│   ├── file-storage.ts # File system operations
│   ├── http-client.ts # HTTP client for external APIs
│   └── logger.ts     # Logging utilities
├── middleware/       # Express middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── logging.middleware.ts
├── services/         # Business logic layer
│   ├── auth.service.ts
│   ├── cron.service.ts
│   ├── desk.service.ts
│   ├── reservation.service.ts
│   └── user.service.ts
├── routes.ts         # API route definitions
├── server.ts         # Application entry point
└── types.ts          # TypeScript type definitions
```

## Architecture

### Service Layer Pattern

- **Services**: Contain business logic and data access
- **Controllers**: Handle HTTP requests/responses and validation
- **Middleware**: Cross-cutting concerns (auth, logging, errors)
- **Jobs**: Background tasks and scheduled operations

### Key Components

#### Configuration (`config/`)

Centralized configuration management with environment variable handling.

#### HTTP Client (`lib/http-client.ts`)

Unified HTTP client with retry logic and error handling for external API calls.

#### Services (`services/`)

- `auth.service.ts`: Authentication and authorization
- `user.service.ts`: User management and data persistence
- `desk.service.ts`: Desk availability and booking operations
- `reservation.service.ts`: Reservation management and check-in
- `cron.service.ts`: Automated booking configuration

#### Job Scheduler (`jobs/`)

Manages automated tasks:

- Auto-booking desks 14 days in advance
- Auto check-in for reservations
- User authentication validation

## Development

### Setup

```bash
yarn install
```

### Development Mode

```bash
yarn start
```

### Build

```bash
yarn build
```

## Features

- **Desk Management**: View availability and book desks
- **Reservation System**: Manage bookings with state tracking
- **Automated Booking**: Schedule recurring desk reservations
- **Auto Check-in**: Automatic check-in for scheduled reservations
- **User Management**: Authentication and user data persistence
- **Logging**: Comprehensive request/response logging
- **Error Handling**: Centralized error management

## API Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/logout` - User logout
- `POST /desks` - Get available desks
- `POST /desks/book` - Book a desk
- `POST /reservations` - Get user reservations
- `POST /reservations/action` - Manage reservation state
- `POST /users/search` - Search users
- `GET /cron-configs` - Get automation configs
- `POST /cron-configs` - Update automation configs
- `GET /logs` - Get application logs
