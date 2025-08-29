# Desk Booking Frontend

A React TypeScript web interface for managing desk reservations with real-time availability tracking.

## Project Structure

```
src/
├── commons/          # Shared components
│   └── components/   # Reusable UI components
├── contexts/         # React contexts and hooks
│   ├── DesksContext.tsx     # Desk data management
│   ├── ToastContext.tsx     # Notification system
│   ├── UserContext.tsx      # User authentication state
│   └── useApiRequest.ts     # API request hook
├── tabs/             # Main application tabs
│   ├── CronJob/      # Automated booking configuration
│   ├── Desks/        # Desk availability and booking
│   ├── Login/        # User authentication
│   ├── Logs/         # Application logs viewer
│   └── Reservations/ # Reservation management
├── App.tsx           # Main application component
├── consts.ts         # Application constants
├── main.tsx          # Application entry point
└── types.ts          # TypeScript type definitions
```

## Architecture

### Component Structure

- **Tabs**: Main feature areas with dedicated contexts and hooks
- **Contexts**: Global state management for user, desks, and notifications
- **Commons**: Shared UI components and utilities

### Key Features

#### Desk Management (`tabs/Desks/`)
- View real-time desk availability
- Interactive floor plan visualization
- Book desks with date/time selection

#### Automated Booking (`tabs/CronJob/`)
- Configure recurring desk reservations
- Weekly booking schedule management
- Conflict detection and resolution

#### Reservations (`tabs/Reservations/`)
- View and manage current bookings
- Check-in/check-out functionality
- Reservation status tracking

#### Authentication (`tabs/Login/`)
- User login and session management
- User search and selection

## Development

### Setup

```bash
yarn install
```

### Development Mode

```bash
yarn start
```

Runs on http://localhost:3000

### Build

```bash
yarn build
```

## Technology Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TanStack Query** for data fetching
- **Context API** for state management
- **CSS Modules** for styling

## Features

- Real-time desk availability updates
- Interactive floor plan with desk selection
- Automated booking configuration
- Reservation management with check-in
- User authentication and session handling
- Toast notifications for user feedback
- Auto-refresh data every 10 seconds