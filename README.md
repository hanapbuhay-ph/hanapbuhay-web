# HanapBuhay — Web Admin Panel

A web-based admin panel for **HanapBuhay**, a barangay-verified community marketplace for local skilled workers. Built with React, TypeScript, Vite, TanStack Router, and shadcn/ui.

---

## Features

- Admin authentication with role-based access guard
- Dashboard with platform-wide statistics
- Worker verification queue (approve / reject / request resubmission)
- User account management (suspend, reactivate, deletion requests)
- Booking oversight with force-cancel capability
- Reports & dispute management with resolution history
- Chat log viewer for dispute investigation
- Ratings & reviews moderation (flag, remove, restore)
- Platform settings (service categories, report reasons, notification templates, announcements)
- Audit log of all admin actions
- Admin account management (profile, security, login activity)
- Light / dark mode
- Responsive layout

---

## Tech Stack

| Layer         | Technology                                                                |
| ------------- | ------------------------------------------------------------------------- |
| UI Components | [shadcn/ui](https://ui.shadcn.com) (Radix UI + Tailwind CSS v4)           |
| Build Tool    | [Vite](https://vitejs.dev/)                                               |
| Routing       | [TanStack Router](https://tanstack.com/router/latest)                     |
| Server State  | [TanStack Query](https://tanstack.com/query/latest)                       |
| Forms         | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| HTTP Client   | [Axios](https://axios-http.com/)                                          |
| Mock API      | [json-server](https://github.com/typicode/json-server)                    |
| Language      | [TypeScript](https://www.typescriptlang.org/)                             |
| Linting       | [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)          |
| Icons         | [Lucide React](https://lucide.dev/)                                       |

---

## Prerequisites

Make sure you have these installed before running the project:

- [Node.js](https://nodejs.org/) v18 or higher
- [pnpm](https://pnpm.io/) v8 or higher

Install pnpm if you don't have it:

```bash
npm install -g pnpm
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <repo-folder>
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

Copy the example env file and fill in the values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

```env
VITE_API_URL=http://localhost:3001
```

> `VITE_API_URL` points to the mock API server (json-server). Keep it as `http://localhost:3001` for local development.

### 4. Start the mock API

The project uses json-server as a local mock backend. Run it in a separate terminal:

```bash
pnpm mock
```

This starts json-server at `http://localhost:3001` using the data in `mock/db.json`.

### 5. Start the development server

In another terminal:

```bash
pnpm dev
```

Open your browser at `http://localhost:5173`.

---

## Logging In (Local Development)

The login page includes a **Dev Login** button that bypasses authentication and sets a mock token automatically. This button is only visible when `VITE_API_URL` points to localhost.

To use the full login flow, the mock API would need a `/api/auth/login` endpoint. For local development, the Dev Login button is the intended path.

---

## Available Scripts

| Script         | Description                             |
| -------------- | --------------------------------------- |
| `pnpm dev`     | Start the Vite development server       |
| `pnpm mock`    | Start json-server mock API on port 3001 |
| `pnpm build`   | Type-check and build for production     |
| `pnpm preview` | Preview the production build locally    |
| `pnpm lint`    | Run ESLint                              |
| `pnpm format`  | Format all files with Prettier          |
| `pnpm test`    | Run tests headlessly                    |

---

## Project Structure

```
src/
├── assets/          # SVG icons and brand assets
├── components/      # Shared UI components and layout
├── context/         # React context providers (theme, layout, search)
├── features/        # Feature modules (one folder per section)
├── hooks/           # Shared custom hooks
├── lib/             # Utilities (api.ts, auth.ts, utils.ts)
├── routes/          # TanStack Router file-based route files
├── stores/          # Zustand stores
└── styles/          # Global CSS and theme variables

mock/
└── db.json          # json-server mock database
```

---

## Environment Variables

| Variable       | Required | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| `VITE_API_URL` | Yes      | Base URL for the API. Use `http://localhost:3001` for local mock. |

---

## Notes

- All routes under `/_authenticated` are protected by an auth guard. Navigating to them without a token redirects to `/login`.
- The token is stored in `localStorage` under the key `hanapbuhay_admin_token`.
- `mock/db.json` is the single source of truth for all mock data. Edits to it are picked up by json-server automatically (it watches the file).
- Route files are auto-generated into `src/routeTree.gen.ts` by the TanStack Router Vite plugin on every `pnpm dev` or `pnpm build` run. Do not edit this file manually.
