# OpsFlow Frontend

React + Vite frontend for the OpsFlow ERP/CRM dashboard.

## Features

- Reusable enterprise app shell
- Responsive desktop/tablet/mobile sidebar behavior
- Dashboard KPI cards, bar chart, donut chart, low-stock table, and recent activity feed
- Role-aware navigation using the stored user role
- Dashboard data hook with real backend integration
- Clean development fallback when no auth token is present or `VITE_DASHBOARD_USE_MOCK=true`
- Loading skeletons, inline retry state, and empty states

## Environment

Create a `.env` file from `.env.example`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_DASHBOARD_USE_MOCK=false
```

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Backend Endpoints Used

- `GET /api/dashboard`
- `GET /api/dashboard/low-stock`

When a valid token is present in local storage under `token`, `authToken`, or `accessToken`, requests include:

```http
Authorization: Bearer <token>
```

## Local Storage Session Support

The dashboard reads the user from the first available key:

- `user`
- `authUser`
- `currentUser`

If no session exists, the frontend uses a clearly separated development preview mode with demo user data and mock dashboard content.

## Current Route Structure

- `/dashboard`
- `/reports`
- `/customers`
- `/products`
- `/inventory`
- `/challans`
- `/system`
- `/settings`

Only the dashboard page is fully implemented in this pass. The rest already use the shared shell and navigation so future pages can be added without redesigning the layout.
