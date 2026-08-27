# HanapBuhay — Web Admin Panel Handoff
## Living project state document for the React web dev's Claude session.

---

## 1. Project Overview

Project:      HanapBuhay
Your role:    Web Developer — React Admin Panel
Backend:      Laravel 13 REST API (built separately by the PM/backend dev)
Your stack:   shadcn-admin template (satnaing) — Vite + React + TypeScript
              + TanStack Router + shadcn/ui + Tailwind CSS
Template URL: https://shadcn-admin.netlify.app/

The admin panel is the React web application used exclusively
by HanapBuhay administrators to manage the platform.
Workers and clients use the Flutter mobile app, not this panel.

---

## 2. Current Status

Phase:        Web Admin Panel — UI Development
Step:         Starting from scratch on top of shadcn-admin template
Environment:  Local dev (Vite dev server)
Mock API:     json-server (see Section 6)
Real API:     Not yet available — admin endpoints are not yet
              built on the Laravel side. All data is mocked.
Branch:       (your own repo — separate from hanapbuhay-api)

---

## 3. Tech Stack

| Layer        | Technology                          |
|---|---|
| Framework    | React 18 + TypeScript               |
| Build tool   | Vite                                |
| Routing      | TanStack Router (file-based)        |
| UI Library   | shadcn/ui (Radix UI + Tailwind CSS) |
| Icons        | Tabler Icons (already in template)  |
| Mock API     | json-server                         |
| Real API     | Laravel 13 (when ready)             |
| HTTP Client  | Axios (or fetch — your choice)      |
| State        | React Context or Zustand            |

---

## 4. Design System — Tarsi Verdant

Apply these values by replacing the shadcn-admin
template's default CSS variables and Tailwind config.

### Primary Colors
primary:            #006e11
primary-container:  #34a835  (use for hover states, active badges)
on-primary:         #ffffff
secondary:          #2a6b2c
on-secondary:       #ffffff
tertiary:           #835400  (harvest gold — use sparingly for accents)
error:              #ba1a1a

### Surface Colors (replace template's background vars)
background:         #f9f9f8
surface:            #f9f9f8
surface-container:  #edeeed
surface-container-low: #f3f4f3
on-surface:         #191c1c
on-surface-variant: #3f4a3b
outline:            #6e7b69
outline-variant:    #becab6

### Special
leaf-bright:        #4CAF50  (sidebar active state)
earth-brown:        #5D4037
surface-cream:      #FEFDFB  (card backgrounds)
charcoal-soft:      #2D312E  (dark text alternative)

### Card Shadows (green-tinted, soft)
box-shadow: 0 2px 12px rgba(52, 168, 53, 0.08)

### Typography — Plus Jakarta Sans (all levels)
Import from Google Fonts:
  https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap

Font scale:
  display-lg:   48px / 800 weight / -0.02em tracking
  headline-lg:  32px / 700 weight
  headline-md:  24px / 700 weight
  body-xl:      20px / 400 weight
  body-lg:      18px / 400 weight
  body-md:      16px / 400 weight
  label-lg:     14px / 600 weight / 0.01em tracking
  label-sm:     12px / 600 weight / 0.02em tracking

### Border Radius
sm:      0.25rem (4px)
default: 0.5rem  (8px)  — inputs, small components
md:      0.75rem (12px)
lg:      1rem    (16px) — cards, image containers
xl:      1.5rem  (24px) — section containers, banners
full:    9999px          — tags, chips, pill badges

### Spacing (4px baseline)
unit:             4px
gutter:           24px
margin-mobile:    16px
margin-desktop:   48px
container-max:    1280px

### Component Rules
Buttons:
  Primary — vibrant green (#006e11) bg, white text
  Hover — slight shadow lift
  Press — 1px downward shift
  Secondary — deep green (#2a6b2c) outline

Cards:
  Background: #FEFDFB (surface-cream)
  Border radius: 16px (rounded-lg)
  Padding: 24px
  Shadow: 0 2px 12px rgba(52, 168, 53, 0.08)

Inputs:
  Default border: soft gray (#becab6)
  Focus border: 2px solid #006e11
  Labels always visible (never placeholder-only)

Chips / Tags:
  Pill-shaped (border-radius: 9999px)
  Background: rgba(0, 110, 17, 0.10)
  Text: #006e11

Navigation / Sidebar:
  Sticky
  Active item: #4CAF50 (leaf-bright) left border accent
  Background: white at 90% opacity with blur

---

## 5. Admin Panel Sections

All 6 sections must be built. Current status:

[ ] Theme setup (colors + fonts applied to template)
[ ] json-server mock API running
[ ] Admin login page
[ ] Dashboard (stats overview)
[ ] Verification Queue (review + approve/reject workers)
[ ] User Management (search, filter, suspend/reactivate)
[ ] Booking Oversight (read-only, filterable)
[ ] Reports Queue (review + resolve disputes)
[ ] Audit Log (read-only, filterable)

---

## 6. Mock API Setup (json-server)

Since the Laravel admin API endpoints are not yet built,
all data is served by json-server locally.

Install:
  npm install -D json-server

Create file: mock/db.json
  (see WEB_API_CONTRACT.md for the full mock data structure)

Add to package.json scripts:
  "mock": "json-server --watch mock/db.json --port 3001"

Run alongside the Vite dev server:
  Terminal 1: npm run dev      (Vite — port 5173)
  Terminal 2: npm run mock     (json-server — port 3001)

Base URL for API calls during development:
  http://localhost:3001

When the real Laravel API is ready, swap the base URL
to the Laravel API URL — all endpoint paths stay the same.

Create src/lib/api.ts:
  export const API_BASE_URL = import.meta.env.VITE_API_URL
    || 'http://localhost:3001';

Create .env.local:
  VITE_API_URL=http://localhost:3001

---

## 7. Admin Authentication

The admin user logs in using:
  POST /api/auth/login  (same endpoint as mobile users)
  email + password
  Returns a Sanctum Bearer token

The React app must:
  - Store the token in localStorage as hanapbuhay_admin_token
  - Attach it to every API request:
    Authorization: Bearer {token}
  - Check that the returned user.role === 'admin'
  - If role !== 'admin': show error, do not allow entry
  - Protect all routes with an auth guard
    (redirect to /login if no token)

During mock/development:
  Use a hardcoded mock token — skip real auth
  and go straight to the dashboard.
  Replace with real auth when Laravel API is ready.

---

## 8. Route Structure (TanStack Router)

Use the existing template's _authenticated route group.
Add HanapBuhay-specific pages inside it.

Target route map:
  /login                      — Admin login
  /                           — Dashboard (stats)
  /verifications              — Verification Queue list
  /verifications/$id          — Verification detail + review
  /users                      — User Management
  /users/$id                  — User detail + history
  /bookings                   — Booking Oversight
  /bookings/$id               — Booking detail (read-only)
  /reports                    — Reports Queue
  /reports/$id                — Report detail + resolve
  /audit-logs                 — Audit Log

---

## 9. Files Modified

None yet — starting fresh on top of the template.
Update this section as files are created/modified.

Created:
  (none yet)

Modified:
  (none yet)

---

## 10. Bugs and Fixes

None yet.

---

## 11. Decisions

- Mock API: json-server on port 3001
- Real API: swap VITE_API_URL env var when Laravel is ready
- Auth token storage: localStorage key hanapbuhay_admin_token
- Role check: only allow role === 'admin' past login
- Font: Plus Jakarta Sans from Google Fonts
- Template: shadcn-admin (satnaing) — already cloned and running

---

## 12. Known Conflicts

- Laravel admin API endpoints (Section I of API contract)
  are NOT yet built. All /api/admin/* routes will 404
  against the real Laravel backend until the PM builds them.
  Use json-server mock until further notice.

---

## 13. Unfinished Tasks

All of the following are unfinished:

[ ] Apply Tarsi Verdant theme (colors + fonts)
[ ] Setup json-server mock
[ ] Admin login page + auth guard
[ ] Dashboard page with stat cards
[ ] Verification Queue — list + detail + approve/reject
[ ] User Management — list + search/filter + suspend
[ ] Booking Oversight — read-only list + filters
[ ] Reports Queue — list + detail + resolve
[ ] Audit Log — read-only table + filters

---

## 14. Important Constraints

1. Never access MySQL directly — all data via API only.
2. Admin role check is mandatory on login.
   Do not allow non-admin users into the panel.
3. No payment, no real-time tracking, no chat UI
   in the admin panel — those are mobile-only features.
4. Booking Oversight is READ-ONLY.
   Admin cannot modify bookings (except force-cancel).
5. Match response shapes from WEB_API_CONTRACT.md exactly.
   Do not invent or rename fields.
6. All admin actions (approve, reject, suspend, resolve)
   must show a confirmation dialog before firing the API call.
7. Evidence files (verification docs, report photos) are
   displayed as images — admin clicks to view full size.

---

## 15. Exact Next Step

FIRST TASK:
Apply the Tarsi Verdant design system to the shadcn-admin
template — colors, fonts, border radius, card styles.
Do NOT build any pages yet. Just the theme.

See WEB_AMAZON_Q_GUIDE.md Section 1 for the exact
Amazon Q prompt to use.

---

## 16. Continuation Instructions

This file is the living state document for this project.
At the start of every Claude session, attach this file.
At the end of every working session or when Claude detects
context pressure, update this file with:
  - what was completed
  - files created/modified
  - bugs found/fixed
  - decisions made
  - new exact next step

Another Claude instance must be able to read this file
and continue the project without seeing previous conversations.