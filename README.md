# Desk Booking Manager

A TypeScript web interface for managing desk reservations with real-time availability tracking.

## Quick Start

### Development

```bash
yarn install:all
yarn start
```

Open http://localhost:3000 in your browser.

### Backend Only

```bash
yarn server
```

Backend runs on http://localhost:8080

### Frontend Only

```bash
yarn client
```

Frontend runs on http://localhost:3000

### Docker Deployment

```bash
yarn docker:up
```
or
```bash
touch data.json
cd deploy && docker-compose up --build -d
```

Access the application at http://localhost:3000

## Features

- View available desks in real-time
- Book desks with date/time selection
- Manage reservations and check-in status
- Configure API authentication headers
- Auto-refresh data every 10 seconds

## Usage

1. **Available Desks**: View desk availability and status
2. **Book a Desk**: Select date, time, and desk to make reservations
3. **My Reservations**: Track your bookings and check-in status
4. **Settings**: Update API authentication tokens
