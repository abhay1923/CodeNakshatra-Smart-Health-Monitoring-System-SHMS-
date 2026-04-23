# Smart Health Monitoring System (SHMS)

A role-based smart health monitoring web application with a 3D frontend, Supabase authentication, and an Express backend that verifies JWTs and enforces access by role.

Created by **Abhay Kaushik** and **Ayushi Bendal**.

## Overview

This project currently includes:

- A React + TypeScript + Vite frontend
- A 3D immersive dashboard UI
- Supabase authentication
- Role-based access control for:
  - `citizen`
  - `doctor`
  - `admin`
- An Express backend that verifies Supabase JWTs
- Protected backend APIs for role-specific data and actions

## Roles and Access

### Citizen
- Sign in and access personal health records
- Upload health-related documents
- Manage consent settings
- Submit reviews and feedback

### Doctor
- Access patient roster
- View urgent triage queue
- Run triage actions through protected backend APIs
- Review care workflow data

### Admin
- View partner feed health
- Access audit and governance data
- Monitor operational activity

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Three.js
- **Backend:** Node.js, Express, TypeScript
- **Auth:** Supabase Auth
- **JWT Verification:** `jose`
- **Styling:** Tailwind CSS + custom CSS

## Project Structure

```text
A-comprehensive-smart-health-monitoring-system/
├── backend/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   └── patient-portal/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── lib/
│       ├── package.json
│       ├── .env.example
│       └── vite.config.ts
├── package.json
└── README.md
```

## Prerequisites

Install these before running the app:

- Node.js `18+`
- npm `9+`

## Supabase Setup

This app uses Supabase for authentication.

### Frontend environment

Create:

`frontend/patient-portal/.env.local`

with:

```env
VITE_SUPABASE_URL=https://ssleaezheghgxrnoqjkp.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:3001
```

### Backend environment

Create:

`backend/.env`

with:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://shms_user:shms_password@localhost:5432/shms_db?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:3000
SUPABASE_URL=https://ssleaezheghgxrnoqjkp.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

Note:
- The backend currently verifies Supabase JWTs for protected API access.
- `DATABASE_URL` and `REDIS_URL` are present for future expansion, but the current running auth flow does not require local Postgres or Redis to sign in and use the RBAC demo.

## Install Dependencies

From the project root:

```bash
npm install
```

If needed, also install workspace dependencies explicitly:

```bash
cd backend
npm install

cd ../frontend/patient-portal
npm install
```

## Run the Application

Open two terminals.

### 1. Start the backend

```bash
cd backend
npm run dev
```

Backend runs at:

[http://localhost:3001](http://localhost:3001)

Health check:

[http://localhost:3001/health](http://localhost:3001/health)

### 2. Start the frontend

```bash
cd frontend/patient-portal
npm run dev
```

Frontend runs at:

[http://localhost:3000](http://localhost:3000)

## Build for Production

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend/patient-portal
npm run build
```

## Authentication Notes

### Sign up

You can create a new account from the frontend login screen.

During sign-up, the selected role is stored in Supabase user metadata:

- `citizen`
- `doctor`
- `admin`

### If login says "email not confirmed"

Your Supabase project has email confirmation enabled.

You can either:

1. Confirm the signup email from your inbox
2. Or disable email confirmation in Supabase:
   - `Authentication`
   - `Providers`
   - `Email`
   - turn off required email confirmation

## Protected Backend API Routes

The backend exposes role-aware endpoints such as:

- `GET /health`
- `GET /api/v1`
- `GET /api/v1/auth/session`
- `GET /api/v1/dashboard`
- `GET /api/v1/citizen/records`
- `POST /api/v1/citizen/consents/:id`
- `GET /api/v1/doctor/patients`
- `POST /api/v1/doctor/triage`
- `GET /api/v1/admin/feeds`
- `GET /api/v1/admin/audit`

All protected routes require a valid Supabase bearer token.

## Current App Behavior

The current version is focused on:

- working login/signup flow
- role-based interface rendering
- backend JWT verification
- protected API access by role
- 3D frontend dashboard experience

Some data is still demo-backed for presentation purposes, but the auth and access-control flow is real.

## Troubleshooting

### Frontend says backend is offline

Make sure the backend is running:

```bash
cd backend
npm run dev
```

Then test:

```bash
http://localhost:3001/health
```

### Site says `ERR_CONNECTION_REFUSED`

Usually that means the dev server stopped. Restart both:

```bash
cd backend
npm run dev
```

```bash
cd frontend/patient-portal
npm run dev
```

### Supabase is connected but login fails

Check:

- the correct project URL is in `.env.local`
- the anon key is valid
- the user has confirmed email if confirmation is enabled

## Credits

This project was created by:

- **Abhay Kaushik**
- **Ayushi Bendal**

## License

This project is licensed under the [MIT License](LICENSE).
