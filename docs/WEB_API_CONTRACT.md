# HanapBuhay — Admin Panel API Contract
## Reference for the React web dev's Claude session and Amazon Q.

This document defines every API endpoint the admin panel
will consume, with exact request and response shapes.

During development: all endpoints are mocked via json-server.
When Laravel admin API is ready: swap VITE_API_URL to the
real Laravel base URL — all paths remain the same.

---

## Base URL

Development (json-server):
  http://localhost:3001

Production (Laravel — not yet available):
  http://hanapbuhay-api.test/api
  (or the Railway deployment URL when deployed)

---

## Auth Header (for real API — not needed for json-server mock)

Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json

---

## Admin Endpoints

---

### I1. Dashboard Stats

GET /dashboard

Response:
{
  "total_users": 284,
  "total_clients": 180,
  "total_workers": 104,
  "pending_verifications": 12,
  "active_bookings": 8,
  "open_disputes": 3,
  "completed_bookings_today": 15
}

---

### I2. Get All Verifications

GET /verifications
GET /verifications?verification_status=pending  (filter)

Response — array of:
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
    {
      "id": 1,
      "type": "government_id",
      "file_url": "https://...",
      "status": "pending"
    },
    {
      "id": 2,
      "type": "barangay_certificate",
      "file_url": "https://...",
      "status": "pending"
    },
    {
      "id": 3,
      "type": "selfie_with_id",
      "file_url": "https://...",
      "status": "pending"
    },
    {
      "id": 4,
      "type": "skill_certificate",
      "file_url": "https://...",
      "status": "pending"
    }
  ]
}

Document types: government_id, barangay_certificate,
                selfie_with_id, skill_certificate
Verification status values: pending, approved, rejected

---

### I3. Review Verification (Approve / Reject)

Real Laravel endpoint (not yet built):
POST /api/admin/verifications/{workerProfileId}/review

Mock equivalent (json-server):
PUT /verifications/:id
{
  "verification_status": "approved"
}

Request body (real API):
{
  "action": "approve",   // or "reject"
  "remarks": "Documents verified successfully."
  // remarks required if action = "reject"
}

Response:
{
  "success": true,
  "message": "Worker verification approved",
  "data": {
    "verification_status": "approved",
    "trust_tier": "verified"
  }
}

---

### I4. Get All Users

GET /users
GET /users?role=worker&is_active=true  (filters)

Response — array of:
{
  "id": 1,
  "name": "Juan dela Cruz",
  "email": "juan@email.com",
  "role": "client",
  "barangay": "Calanggaman",
  "is_active": true,
  "created_at": "2026-08-01T00:00:00Z"
}

Role values: client, worker, admin

---

### I5. Get Single User

GET /users/:id

Response (same shape as list item, may include
additional worker_profile fields when real API is ready):
{
  "id": 1,
  "name": "Juan dela Cruz",
  "email": "juan@email.com",
  "mobile_number": "09123456789",
  "role": "client",
  "barangay": "Calanggaman",
  "is_active": true,
  "is_google_account": false,
  "created_at": "2026-08-01T00:00:00Z"
}

---

### I6. Suspend / Reactivate User

Real Laravel endpoint (not yet built):
POST /api/admin/users/{userId}/toggle-status

Mock equivalent (json-server):
PATCH /users/:id
{ "is_active": false }

Request body (real API):
{
  "action": "suspend",    // or "reactivate"
  "reason": "Repeated policy violations"
}

Response:
{
  "success": true,
  "message": "User account suspended"
}

---

### I7. Get All Bookings

GET /bookings
GET /bookings?status=active  (filter)

Response — array of:
{
  "id": 1,
  "booking_code": "HB-2026-00001",
  "status": "completed",
  "client": "Juan dela Cruz",
  "worker": "Pedro Alonzo",
  "service_category": "Plumbing",
  "scheduled_at": "2026-09-15T09:00:00Z",
  "created_at": "2026-09-10T00:00:00Z"
}

Status values: pending, accepted, active,
               completed, cancelled, declined

---

### I8. Get Single Booking

GET /bookings/:id

Response (same as list plus additional detail):
{
  "id": 1,
  "booking_code": "HB-2026-00001",
  "status": "completed",
  "client": "Juan dela Cruz",
  "worker": "Pedro Alonzo",
  "service_category": "Plumbing",
  "scheduled_at": "2026-09-15T09:00:00Z",
  "notes": "Leaking pipe under kitchen sink",
  "created_at": "2026-09-10T00:00:00Z"
}

---

### I9. Force Cancel Booking

Real Laravel endpoint (not yet built):
POST /api/admin/bookings/{bookingId}/cancel

Mock equivalent (json-server):
PATCH /bookings/:id
{ "status": "cancelled" }

Request body (real API):
{
  "reason": "Fraudulent booking detected"
}

Response:
{
  "success": true,
  "message": "Booking force cancelled"
}

---

### I10. Get All Reports

GET /reports
GET /reports?status=under_review  (filter)

Response — array of:
{
  "id": 1,
  "booking_code": "HB-2026-00001",
  "reported_by": "Juan dela Cruz",
  "reported_user": "Pedro Alonzo",
  "reason": "no_show",
  "description": "Worker did not show up.",
  "status": "under_review",
  "evidence_urls": ["https://..."],
  "created_at": "2026-09-16T00:00:00Z"
}

Reason values: no_show, unsatisfactory_work, misconduct,
               non_payment, unsafe_environment,
               abusive_behavior, false_information, other

Status values: under_review, resolved, dismissed

---

### I11. Get Single Report

GET /reports/:id

Response (same as list):
{
  "id": 1,
  "booking_code": "HB-2026-00001",
  "reported_by": "Juan dela Cruz",
  "reported_user": "Pedro Alonzo",
  "reason": "no_show",
  "description": "Worker did not show up.",
  "status": "under_review",
  "evidence_urls": ["https://..."],
  "created_at": "2026-09-16T00:00:00Z"
}

---

### I12. Resolve Report

Real Laravel endpoint (not yet built):
POST /api/admin/reports/{reportId}/resolve

Mock equivalent (json-server):
PATCH /reports/:id
{ "status": "resolved" }

Request body (real API):
{
  "resolution_action": "warning_issued",
  "admin_remarks": "First offense. Warning issued to worker."
}

Resolution action values:
  warning_issued
  account_suspended
  verification_revoked
  no_action

Response:
{
  "success": true,
  "message": "Report resolved"
}

---

### I13. Get Audit Logs

GET /audit_logs

Response — array of:
{
  "id": 1,
  "admin_name": "Admin User",
  "action": "approved_worker_verification",
  "target_type": "WorkerProfile",
  "target_id": 5,
  "details": {
    "worker_name": "Liza Dimaano"
  },
  "created_at": "2026-09-14T10:00:00Z"
}

Action values:
  approved_worker_verification
  rejected_worker_verification
  suspended_user
  reactivated_user
  resolved_report
  force_cancelled_booking
  updated_trust_tier

---

## Important Notes for Web Dev

1. All /api/admin/* routes DO NOT YET EXIST on the Laravel backend.
   Use json-server mock exclusively until the PM confirms
   the admin API is ready.

2. When the real API is ready, you only need to change
   VITE_API_URL in .env.local from http://localhost:3001
   to the real Laravel API URL.
   All endpoint paths in your code stay the same EXCEPT:
   json-server uses simple paths (/verifications, /users)
   while the real API uses /api/admin/verifications,
   /api/admin/users, etc.
   Plan for this by using a helper in src/lib/api.ts
   that prepends /api/admin/ when the real API is active.

3. The token from login (hanapbuhay_admin_token) must be
   sent as Bearer token on every real API call.
   json-server ignores this header — it works without it.

4. Response shapes for mock (json-server) are simpler
   than the real API. The real API wraps everything in:
   { "success": true, "message": "...", "data": { ... } }
   Plan your API response handler to unwrap .data when
   switching to the real API.