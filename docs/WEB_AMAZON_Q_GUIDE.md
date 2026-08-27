# HanapBuhay Web Admin — Amazon Q Guide
## Prompt-by-prompt guide for building the admin UI

---

## General Rules

1. One page or feature at a time.
   Never ask Amazon Q to build multiple pages in one prompt.

2. Always specify the tech stack at the top of every prompt:
   React 18, TypeScript, Vite, TanStack Router,
   shadcn/ui, Tailwind CSS, shadcn-admin template (satnaing).

3. Always specify that this is an ADMIN-ONLY panel.
   Workers and clients use the Flutter app, not this.

4. After Amazon Q generates code, always:
   - Run npm run dev to confirm no build errors
   - Check the page renders correctly in the browser
   - Check the browser console for errors
   before moving to the next prompt.

5. If Amazon Q's output drifts from the design system
   (wrong colors, wrong fonts, wrong radius), paste
   the relevant section of WEB_HANDOFF.md Section 4
   and ask it to correct.

6. Commit after each working feature.

---

## Standing Instructions — Paste This First

Paste this at the start of every new Amazon Q session:

---
Act as a senior React/TypeScript frontend developer.
For all code you generate in this session, follow these
standards strictly:

TECH STACK
- React 18 + TypeScript
- Vite (not Next.js, not CRA)
- TanStack Router for routing
- shadcn/ui components (Radix UI + Tailwind CSS)
- shadcn-admin template by satnaing as the base

CODE STYLE
- Functional components only, no class components
- Use TypeScript interfaces for all props and API response shapes
- Custom hooks for data fetching (useUsers, useVerifications, etc.)
- Keep components small — extract sub-components when a
  component exceeds ~80 lines
- No inline styles — Tailwind classes only

API CALLS
- All API calls go through src/lib/api.ts
- Use the VITE_API_URL environment variable for the base URL
- Always handle loading, error, and empty states
- Show a loading skeleton while data is fetching,
  not a blank screen

STATE MANAGEMENT
- Local state with useState for UI state (modals, filters)
- Custom hooks for server state (fetching + caching)
- No Redux — too heavy for this scope

ERROR HANDLING
- Every API call wrapped in try/catch
- Show a toast notification on success and on error
  (use the shadcn/ui Sonner toast component)
- Never let a JS error crash the whole page —
  use error boundaries on page-level components

DESIGN SYSTEM (Tarsi Verdant)
- Primary green: #006e11
- Primary container: #34a835
- Background: #f9f9f8
- Surface/cards: #FEFDFB
- Text: #191c1c
- Font: Plus Jakarta Sans (imported from Google Fonts)
- Card border radius: 16px (rounded-2xl in Tailwind)
- Input border radius: 8px (rounded-lg in Tailwind)
- Card shadow: 0 2px 12px rgba(52, 168, 53, 0.08)
- Primary button: bg-[#006e11] text-white hover:shadow-md
- Chip/badge: rounded-full bg-[#006e11]/10 text-[#006e11]

ADMIN PANEL RULES
- All routes protected by auth guard (redirect to /login if no token)
- Token stored in localStorage as hanapbuhay_admin_token
- Role check: only allow role === 'admin'
- Destructive actions (suspend, reject, force-cancel)
  MUST show a shadcn/ui AlertDialog confirmation before
  firing the API call

AFTER EACH FEATURE
- List what I should verify in the browser before moving on
- Flag any edge cases I should test

Confirm you understand before I give you the first task.
---

---

## Prompt Checklist (do in this order)

[ ] 1. Theme setup
[ ] 2. json-server mock setup
[ ] 3. Admin login page + auth guard
[ ] 4. Dashboard page
[ ] 5. Verification Queue — list page
[ ] 6. Verification detail + approve/reject
[ ] 7. User Management — list page
[ ] 8. User detail + suspend/reactivate
[ ] 9. Booking Oversight — list page
[ ] 10. Booking detail (read-only)
[ ] 11. Reports Queue — list page
[ ] 12. Report detail + resolve
[ ] 13. Audit Log page

---

## Prompt 1 — Theme Setup

Before writing any pages, apply the Tarsi Verdant design system.

---
In this project (shadcn-admin template by satnaing —
Vite + React + TypeScript + Tailwind + shadcn/ui),
do the following theme setup. Read all existing config
files before making any changes:

Files to read first:
- tailwind.config.ts (or tailwind.config.js)
- src/index.css (or globals.css — wherever CSS variables are defined)
- index.html (check if Google Fonts link exists)

Tasks:

1. Add Plus Jakarta Sans to index.html via Google Fonts:
   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">

2. In tailwind.config.ts, set the default font family:
   fontFamily: {
     sans: ['Plus Jakarta Sans', 'sans-serif'],
   }

3. In the CSS variables file, replace/add these color tokens
   (keep both light and dark mode vars if the template has them,
   only update the light mode values):

   --background: #f9f9f8
   --foreground: #191c1c
   --card: #FEFDFB
   --card-foreground: #191c1c
   --primary: #006e11
   --primary-foreground: #ffffff
   --secondary: #2a6b2c
   --secondary-foreground: #ffffff
   --muted: #edeeed
   --muted-foreground: #3f4a3b
   --border: #becab6
   --input: #becab6
   --ring: #006e11
   --radius: 0.5rem

4. In tailwind.config.ts, add these custom colors
   under theme.extend.colors:
   'primary-container': '#34a835',
   'surface-cream': '#FEFDFB',
   'surface-dim': '#d9dad9',
   'leaf-bright': '#4CAF50',
   'outline-variant': '#becab6',
   'charcoal-soft': '#2D312E',

5. Do NOT change any routing, page components, or
   layout files — theme only.

After making changes, tell me what files were modified
and what I should check in the browser to confirm the
font and colors are applied correctly.
---

---

## Prompt 2 — json-server Mock Setup

---
Set up json-server as the mock API for the HanapBuhay
admin panel. Read package.json first before making changes.

Tasks:
1. Install json-server as a dev dependency.

2. Create mock/db.json with this exact structure
   (this is the mock data for all admin endpoints):

{
  "dashboard": {
    "total_users": 284,
    "total_clients": 180,
    "total_workers": 104,
    "pending_verifications": 12,
    "active_bookings": 8,
    "open_disputes": 3,
    "completed_bookings_today": 15
  },
  "verifications": [
    {
      "id": 1,
      "worker_profile_id": 5,
      "user": {
        "id": 10,
        "name": "Liza Dimaano",
        "email": "liza@email.com",
        "barangay": "Poblacion"
      },
      "verification_status": "pending",
      "submitted_at": "2026-09-14T08:00:00Z",
      "documents": [
        { "id": 1, "type": "government_id", "file_url": "https://placehold.co/400x300", "status": "pending" },
        { "id": 2, "type": "barangay_certificate", "file_url": "https://placehold.co/400x300", "status": "pending" },
        { "id": 3, "type": "selfie_with_id", "file_url": "https://placehold.co/400x300", "status": "pending" }
      ]
    },
    {
      "id": 2,
      "worker_profile_id": 6,
      "user": {
        "id": 11,
        "name": "Marco Reyes",
        "email": "marco@email.com",
        "barangay": "Banlasan"
      },
      "verification_status": "pending",
      "submitted_at": "2026-09-13T10:00:00Z",
      "documents": [
        { "id": 4, "type": "government_id", "file_url": "https://placehold.co/400x300", "status": "pending" },
        { "id": 5, "type": "barangay_certificate", "file_url": "https://placehold.co/400x300", "status": "pending" },
        { "id": 6, "type": "selfie_with_id", "file_url": "https://placehold.co/400x300", "status": "pending" },
        { "id": 7, "type": "skill_certificate", "file_url": "https://placehold.co/400x300", "status": "pending" }
      ]
    }
  ],
  "users": [
    { "id": 1, "name": "Juan dela Cruz", "email": "juan@email.com", "role": "client", "barangay": "Calanggaman", "is_active": true, "created_at": "2026-08-01T00:00:00Z" },
    { "id": 2, "name": "Maria Santos", "email": "maria@email.com", "role": "worker", "barangay": "Poblacion", "is_active": true, "created_at": "2026-08-05T00:00:00Z" },
    { "id": 3, "name": "Pedro Alonzo", "email": "pedro@email.com", "role": "worker", "barangay": "Banlasan", "is_active": false, "created_at": "2026-08-10T00:00:00Z" }
  ],
  "bookings": [
    { "id": 1, "booking_code": "HB-2026-00001", "status": "completed", "client": "Juan dela Cruz", "worker": "Pedro Alonzo", "service_category": "Plumbing", "scheduled_at": "2026-09-15T09:00:00Z", "created_at": "2026-09-10T00:00:00Z" },
    { "id": 2, "booking_code": "HB-2026-00002", "status": "active", "client": "Ana Cruz", "worker": "Marco Reyes", "service_category": "Electrical Works", "scheduled_at": "2026-09-20T08:00:00Z", "created_at": "2026-09-15T00:00:00Z" }
  ],
  "reports": [
    { "id": 1, "booking_code": "HB-2026-00001", "reported_by": "Juan dela Cruz", "reported_user": "Pedro Alonzo", "reason": "no_show", "description": "Worker did not show up.", "status": "under_review", "evidence_urls": ["https://placehold.co/400x300"], "created_at": "2026-09-16T00:00:00Z" }
  ],
  "audit_logs": [
    { "id": 1, "admin_name": "Admin User", "action": "approved_worker_verification", "target_type": "WorkerProfile", "target_id": 5, "details": { "worker_name": "Liza Dimaano" }, "created_at": "2026-09-14T10:00:00Z" },
    { "id": 2, "admin_name": "Admin User", "action": "suspended_user", "target_type": "User", "target_id": 3, "details": { "user_name": "Pedro Alonzo", "reason": "Repeated violations" }, "created_at": "2026-09-15T11:00:00Z" }
  ]
}

3. Create src/lib/api.ts:
   import axios from 'axios';

   const API_BASE_URL = import.meta.env.VITE_API_URL
     || 'http://localhost:3001';

   export const api = axios.create({
     baseURL: API_BASE_URL,
     headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json',
     },
   });

   api.interceptors.request.use((config) => {
     const token = localStorage.getItem('hanapbuhay_admin_token');
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });

4. Create .env.local:
   VITE_API_URL=http://localhost:3001

5. Add to package.json scripts:
   "mock": "json-server --watch mock/db.json --port 3001"

Tell me what to run and how to verify json-server is working.
---

---

## Prompt 3 — Admin Login Page + Auth Guard

---
Build the admin login page and auth guard for the
HanapBuhay admin panel.

Read these files first before writing any code:
- src/routes/ (understand the existing route structure)
- src/lib/api.ts (the axios instance we created)
- Any existing auth-related files in the template

Requirements:

1. Login page at route /login
   - Email + password fields
   - Primary green submit button ("Sign In")
   - HanapBuhay logo/title at the top
   - Uses Plus Jakarta Sans font
   - Card centered on page with surface-cream background
   - On submit: POST to /api/auth/login
     { email, password }
   - On success:
     - Check response.data.user.role === 'admin'
     - If not admin: show error toast
       "Access denied. Admin accounts only."
     - If admin: store token in
       localStorage.hanapbuhay_admin_token
       then navigate to /
   - On error: show error toast with the message
     from the API response
   - Loading state on the button while request is pending

2. Auth guard
   - All routes except /login require a valid token
   - If no token in localStorage: redirect to /login
   - Implement using TanStack Router's beforeLoad
     in the _authenticated route group
   - On logout: clear localStorage, redirect to /login

3. During mock development:
   - Add a "Dev Login" button that sets a fake token
     and navigates to / without calling the API
   - This button should only appear when
     VITE_API_URL contains localhost

After building, tell me what to verify in the browser.
---

---

## Prompt 4 — Dashboard Page

---
Build the Dashboard page (route: /) for the HanapBuhay
admin panel.

Read these files first:
- src/lib/api.ts
- src/routes/_authenticated/ (existing route structure)
- Any existing dashboard page in the template
  (we will REPLACE its content, not add to it)

Data source: GET /dashboard (json-server)
Response shape:
{
  "total_users": 284,
  "total_clients": 180,
  "total_workers": 104,
  "pending_verifications": 12,
  "active_bookings": 8,
  "open_disputes": 3,
  "completed_bookings_today": 15
}

Requirements:

1. Stat cards (use shadcn/ui Card component):
   - Total Users (show total_users)
   - Total Clients (show total_clients)
   - Total Workers (show total_workers)
   - Pending Verifications (show pending_verifications)
     — highlight in primary green if > 0
   - Active Bookings (show active_bookings)
   - Open Disputes (show open_disputes)
     — highlight in error red if > 0
   - Completed Today (show completed_bookings_today)

2. Quick action buttons below the stat cards:
   - "Review Verifications" → navigate to /verifications
   - "View Reports" → navigate to /reports

3. Design rules:
   - Cards use surface-cream (#FEFDFB) background
   - Cards use 16px border radius
   - Card shadow: 0 2px 12px rgba(52, 168, 53, 0.08)
   - Stat number: headline-lg (32px, 700 weight)
   - Stat label: label-lg (14px, 600 weight)
   - Primary green accent on the card's left border
     for the "alert" stats (pending verifications,
     open disputes)
   - Grid: 4 columns on desktop, 2 on tablet, 1 on mobile

4. Loading state: show skeleton cards while fetching
5. Error state: show an error message if fetch fails

After building, tell me what to verify in the browser.
---

---

## Prompt 5 — Verification Queue List Page

---
Build the Verification Queue list page (route: /verifications)
for the HanapBuhay admin panel.

Read these files first:
- src/lib/api.ts
- src/routes/_authenticated/ (existing structure)
- mock/db.json (the verifications array structure)

Data source: GET /verifications (json-server)

Requirements:

1. Page title: "Verification Queue"
   Subtitle: "Review and approve worker verification submissions"

2. Table (use shadcn/ui Table component) with columns:
   - Worker Name
   - Email
   - Barangay
   - Submitted Date (formatted: "Sep 14, 2026")
   - Documents (show count, e.g. "3 docs" or "4 docs")
   - Status (badge chip: pending = amber, approved = green,
     rejected = red)
   - Action ("Review" button → navigate to /verifications/$id)

3. Filter bar above the table:
   - Status filter: All / Pending / Approved / Rejected
     (tab-style or select dropdown)

4. Empty state: "No pending verifications. All caught up!"
   with a green checkmark icon

5. Design rules:
   - "Review" button: primary green outline style
   - Status badges: pill-shaped chips
     pending → amber bg + text
     approved → green bg + text
     rejected → red bg + text
   - Table rows: hover state with surface-container-low bg

6. Loading state: skeleton rows while fetching
7. Error state: error message if fetch fails

After building, tell me what to verify in the browser.
---

---

## Prompt 6 — Verification Detail + Approve/Reject

---
Build the Verification Detail page
(route: /verifications/$id) for the HanapBuhay admin panel.

Read these files first:
- src/lib/api.ts
- src/routes/_authenticated/verifications/ (if exists)
- mock/db.json (single verification object structure)

Data source: GET /verifications/:id (json-server)
Action: POST /verifications/:id (mock approve/reject)

Requirements:

1. Page layout (two-column on desktop, stacked on mobile):
   LEFT COLUMN — Worker info card:
   - Name, email, barangay
   - Submitted date
   - Current status badge

   RIGHT COLUMN — Document viewer:
   - For each document in the documents array:
     - Document type label
       (government_id → "Government ID",
        barangay_certificate → "Barangay Certificate",
        selfie_with_id → "Selfie with ID",
        skill_certificate → "Skill Certificate")
     - Image preview (click to open full-size in a modal)
     - Individual document status badge

2. Action section (below both columns):
   - Remarks textarea (required for Reject, optional for Approve)
     Label: "Admin Remarks"
     Placeholder: "Add remarks for the worker..."
   - Two buttons side by side:
     "Approve" — primary green, solid
     "Reject" — destructive red, outline

3. Both buttons must show a shadcn/ui AlertDialog:
   Approve: "Are you sure you want to approve this worker?
             This will allow them to appear in search results."
   Reject:  "Are you sure you want to reject this worker?
             They will be notified with your remarks."

4. On confirm:
   - Call POST /verifications/:id with
     { action: 'approve' | 'reject', remarks }
   - Show success toast: "Worker approved." or "Worker rejected."
   - Navigate back to /verifications

5. Back button at the top: "← Back to Verification Queue"

6. Loading and error states required.

After building, tell me what to verify in the browser.
---

---

## Prompt 7 — User Management List Page

---
Build the User Management list page (route: /users)
for the HanapBuhay admin panel.

Read these files first:
- src/lib/api.ts
- mock/db.json (the users array structure)

Data source: GET /users (json-server)

Requirements:

1. Page title: "User Management"
   Subtitle: "Search, filter, and manage platform users"

2. Search bar at the top:
   - Text input: "Search by name or email..."
   - Filters: Role (All / Client / Worker / Admin),
     Status (All / Active / Suspended)

3. Table with columns:
   - Name
   - Email
   - Role (badge chip: client = blue, worker = green, admin = purple)
   - Barangay
   - Status (Active = green chip, Suspended = red chip)
   - Joined Date
   - Actions ("View" button → /users/$id)

4. Inline suspend/reactivate toggle on each row:
   - If is_active = true: show "Suspend" button (destructive outline)
   - If is_active = false: show "Reactivate" button (green outline)
   - Both require AlertDialog confirmation before firing

5. Empty state and loading skeleton required.

After building, tell me what to verify in the browser.
---

---

## Prompt 8 — User Detail Page

---
Build the User Detail page (route: /users/$id)
for the HanapBuhay admin panel.

Data source: GET /users/:id (json-server)

Requirements:

1. User info card:
   - Profile photo (placeholder avatar if none)
   - Name, email, mobile number, role, barangay
   - Account status badge
   - Google account indicator (if is_google_account = true)
   - Joined date

2. If role = worker: show worker profile section:
   - Verification status badge
   - Trust tier badge
   - Average rating, total reviews, completed jobs

3. Recent bookings table (last 5):
   - Booking code, service, status, date
   - "View" link per row → /bookings/$id

4. Suspend / Reactivate button with AlertDialog confirmation.
   Reason textarea required for suspend action.

5. Back button: "← Back to Users"

After building, tell me what to verify in the browser.
---

---

## Prompt 9 — Booking Oversight List Page

---
Build the Booking Oversight list page (route: /bookings)
for the HanapBuhay admin panel.

Data source: GET /bookings (json-server)

IMPORTANT: This is READ-ONLY oversight.
Admin cannot modify bookings from this list
(only force-cancel from the detail page).

Requirements:

1. Page title: "Booking Oversight"
   Subtitle: "Monitor all platform bookings"

2. Filter bar:
   - Status filter: All / Pending / Accepted / Active /
     Completed / Cancelled / Declined
   - Date range picker (from / to)

3. Table with columns:
   - Booking Code
   - Client Name
   - Worker Name
   - Service Category
   - Status badge
   - Scheduled Date
   - Action ("View" → /bookings/$id)

4. Status badge colors:
   pending → amber
   accepted → blue
   active → primary green
   completed → dark green
   cancelled → gray
   declined → red

5. Loading skeleton and empty state required.

After building, tell me what to verify in the browser.
---

---

## Prompt 10 — Booking Detail Page (Read-Only)

---
Build the Booking Detail page (route: /bookings/$id)
for the HanapBuhay admin panel.

Data source: GET /bookings/:id (json-server)

Requirements:

1. Booking info card:
   - Booking code (large, headline style)
   - Status badge
   - Service category
   - Scheduled date/time
   - Notes

2. Parties section (two cards side by side):
   - Client card: name, barangay
   - Worker card: name, barangay, verification status

3. Timeline section showing booking status history
   (created → accepted → active → completed/cancelled)
   as a vertical step indicator.
   Use mock data — show statuses as completed up to
   the current status.

4. Force Cancel button (destructive, bottom of page):
   - Only show if status is pending, accepted, or active
   - AlertDialog: "Are you sure you want to force-cancel
     this booking? Both parties will be notified."
   - Reason textarea required
   - On confirm: call POST /bookings/:id/cancel
     { reason }
   - Show success toast and navigate back to /bookings

5. Back button: "← Back to Bookings"

After building, tell me what to verify in the browser.
---

---

## Prompt 11 — Reports Queue List Page

---
Build the Reports Queue list page (route: /reports)
for the HanapBuhay admin panel.

Data source: GET /reports (json-server)

Requirements:

1. Page title: "Reports & Disputes"
   Subtitle: "Review and resolve user reports"

2. Filter bar:
   - Status: All / Under Review / Resolved / Dismissed

3. Table with columns:
   - Booking Code (or "No booking" if null)
   - Reported By
   - Reported User
   - Reason (formatted label:
     no_show → "No Show",
     unsatisfactory_work → "Unsatisfactory Work",
     misconduct → "Misconduct",
     non_payment → "Non-Payment",
     unsafe_environment → "Unsafe Environment",
     abusive_behavior → "Abusive Behavior",
     false_information → "False Information",
     other → "Other")
   - Status badge (under_review = amber, resolved = green,
     dismissed = gray)
   - Filed Date
   - Action ("Review" → /reports/$id)

4. "under_review" rows should have a subtle amber
   left border to draw attention.

5. Loading skeleton and empty state required.

After building, tell me what to verify in the browser.
---

---

## Prompt 12 — Report Detail + Resolve

---
Build the Report Detail page (route: /reports/$id)
for the HanapBuhay admin panel.

Data source: GET /reports/:id (json-server)
Action: POST /reports/:id/resolve (mock)

Requirements:

1. Report info card:
   - Reason label, description, filed date
   - Status badge

2. Parties section:
   - "Reported By" user card (name, role)
   - "Reported User" card (name, role)
   - Linked booking card if booking_code is present
     (with link to /bookings/$id)

3. Evidence photos section:
   - Grid of evidence photos
   - Click to open full-size in modal
   - "No evidence photos provided" if empty

4. Resolution section (only show if status = under_review):
   - Resolution action dropdown:
     warning_issued → "Issue Warning"
     account_suspended → "Suspend Account"
     verification_revoked → "Revoke Verification"
     no_action → "No Action Required"
   - Admin remarks textarea (required)
   - "Resolve Report" button (primary green)
   - AlertDialog confirmation before submitting

5. If status = resolved or dismissed:
   - Show read-only resolution details
   - Admin remarks
   - Resolved date

6. Back button: "← Back to Reports"

After building, tell me what to verify in the browser.
---

---

## Prompt 13 — Audit Log Page

---
Build the Audit Log page (route: /audit-logs)
for the HanapBuhay admin panel.

Data source: GET /audit_logs (json-server)

IMPORTANT: This is fully READ-ONLY.
No actions, no buttons, no mutations.

Requirements:

1. Page title: "Audit Log"
   Subtitle: "Record of all admin actions on the platform"

2. Filter bar:
   - Search by admin name
   - Action type filter (dropdown)
   - Date range picker

3. Table with columns:
   - Date/Time (formatted: "Sep 14, 2026 · 10:00 AM")
   - Admin Name
   - Action (formatted label:
     approved_worker_verification → "Approved Verification"
     rejected_worker_verification → "Rejected Verification"
     suspended_user → "Suspended User"
     reactivated_user → "Reactivated User"
     resolved_report → "Resolved Report"
     force_cancelled_booking → "Force Cancelled Booking"
     updated_trust_tier → "Updated Trust Tier")
   - Target (e.g. "WorkerProfile #5")
   - Details (show details object as readable text,
     e.g. "Worker: Liza Dimaano")

4. No pagination needed for mock — show all rows.
   Add pagination when real API is connected.

5. Rows are not clickable — no detail page for audit logs.

6. Loading skeleton and empty state required.

After building, tell me what to verify in the browser.
---

---

## Common Amazon Q Gotchas (React/shadcn)

1. Amazon Q may use Next.js syntax (useRouter from next/navigation,
   getServerSideProps, etc.) — always specify "Vite + TanStack Router,
   NOT Next.js" in every prompt.

2. Amazon Q may use React Router instead of TanStack Router —
   specify TanStack Router explicitly and paste the existing
   route file structure if it drifts.

3. Amazon Q may forget Tailwind class names for custom colors —
   always use bracket notation for custom values:
   bg-[#006e11], text-[#006e11], shadow-[rgba(52,168,53,0.08)]

4. Amazon Q may use <form> with onSubmit — this is fine in React
   (unlike the backend restriction). Allow it.

5. Amazon Q may import shadcn components from the wrong path —
   the correct import pattern for shadcn-admin is:
   import { Button } from '@/components/ui/button'
   Verify the actual path exists in the template before using.

6. Amazon Q may generate Redux or Zustand boilerplate unprompted —
   redirect it to simple useState + custom hooks unless complexity
   actually requires more.

7. If Amazon Q generates a component that doesn't match the
   Tarsi Verdant design, paste Section 4 of WEB_HANDOFF.md
   and say "Regenerate following this design system."