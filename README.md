# GreenPack Sustainability Tracker

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `.env` (see `.env.example`)
3. Start development server: `npm run dev`

## Local Database
The application uses a local SQLite database only. The database file is created automatically at:

`./db/greenpact.sqlite`

Persistent local files:
- `./db` stores the SQLite database
- `./reports` stores generated PDF files

## Non-Docker Deployment
1. Create `.env` from `.env.example`
2. Build the frontend: `npm run build`
3. Start the server: `npm start`

In production mode, the Express server serves the built frontend from `dist`.

## Protected Data Page
- Route: `/data`
- Login is verified against the local SQLite `admin_users` table
- The seeded default account is controlled by `DATA_ADMIN_USERNAME` and `DATA_ADMIN_PASSWORD`
- The password is stored hashed in SQLite, not in plaintext
- Set a strong `DATA_AUTH_SECRET` before production
- The database export downloads an Excel workbook where each SQLite table is a separate sheet

## Docker
1. Copy `.env.example` to `.env`
2. Start services: `docker-compose up -d --build`

The app service mounts:
- `./db:/app/db`
- `./reports:/app/reports`

`VITE_API_BASE_URL` is optional.
- Leave it empty when the frontend and API run on the same origin, including the default Docker setup in this repo.
- Set it only when the frontend is hosted separately or behind a different origin.
- The app also reads a runtime `/config.js` file, so the API base can be changed without rebuilding the frontend image.

## Architecture
- **Frontend**: React + Tailwind + i18next
- **Backend**: Express + SQLite
- **Database**: `better-sqlite3`
- **Excel export**: `xlsx`
- **Logic**: Versioned ruleset in `src/shared/ruleset.ts`
- **PDF**: Server-side PDF generation
- **Validation**: Zod schemas shared between client and server
