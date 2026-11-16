# Known Issues & Architectural Constraints

> **Document ID:** `DOC-KNOWN-ISSUES`  
> **Last Updated:** 2026-11-16  
> **Status:** Active Tracking

This document outlines known operational boundaries, backend constraints, and design deviations identified during the full project audit and live API testing.

---

## 1. Backend Constraints & Discrepancies

### 1.1 Review List Endpoint Authentication Requirement
- **Documented:** `GET /api/v1/review/get_review/<int:service_id>/` documented as Public (`AllowAny`).
- **Actual Reality:** The backend view enforces `@permission_classes([IsAuthenticated])`. Requests without a Bearer token receive `HTTP 401 Unauthorized`.
- **Frontend Mitigation:** The frontend `reviewsService.getReviewsForService` catches 401 errors gracefully and returns an empty list `[]` for guest visitors while sending the token when available.

### 1.2 Strict Enum Casing
- **Gender Field:** DRF serializer strictly enforces uppercase choices (`MALE`, `FEMALE`, `OTHER`). Submitting `Male` fails with validation error `{"gender": ["\"Male\" is not a valid choice."]}`.
  - **Resolution:** Form controls and frontend services automatically normalize gender to uppercase (`input.gender.toUpperCase()`).
- **Final Payment Method:** DRF serializer strictly enforces lowercase choices (`online`, `cash`). Submitting `ONLINE` fails with `{"final_payment_method": ["\"ONLINE\" is not a valid choice."]}`.
  - **Resolution:** Frontend service automatically normalizes to lowercase (`input.final_payment_method.toLowerCase()`).

### 1.3 Phone Number Length Limit
- **Constraint:** The backend `UserProfile` model and serializer define `phone` with `max_length=15`.
- **Issue:** Submitting phone numbers with international prefixes and spaces (e.g., `+880 1700 000000`, 17 chars) triggers `HTTP 400 Bad Request` (`phone: Ensure this field has no more than 15 characters.`).
- **Resolution:** Frontend profile form strips all whitespace and clamps to a maximum of 15 characters before mutation.

### 1.4 Location Serializer Omits IDs
- **Observation:** `GET /api/v1/location/divisions/division_list/` returns `{"division": [{"name": "dhaka"}]}` omitting database primary keys (`id`).
- **Resolution:** Frontend location pages and selectors fall back to using name/index identifiers (`key={div.id || div.name || idx}`) to ensure stable rendering.

### 1.5 Service Catalog Pagination Wrapper
- **Observation:** `GET /api/v1/service/all_service/` and `GET /api/v1/service/search_service/` return `{ meta: { page, limit, total, total_pages, next, previous }, results: [...] }`.
- **Resolution:** Frontend `unwrapServicesList` unwraps `wrapper.results` cleanly.

### 1.6 Profile Update Response Drops User Metadata
- **Observation:** `PATCH /api/v1/profiles/modify_profile/` returns `{ message: "...", profile: { image, gender, city, area, phone, bio, experience } }` without `id`, `user`, `role`, `email`, or name.
- **Resolution:** `profilesService.updateMyProfile` preserves cached identity attributes (`id`, `user`, `role`, `email`, `first_name`, `last_name`) after updating.

---

## 2. Authentication & Security Boundaries

### 2.1 Cross-Origin Token Handling
- **Observation:** Remote backend running on Render does not transmit `Set-Cookie` headers or `Access-Control-Allow-Credentials: true`.
- **Resolution:** Tokens are received in JSON payload (`access_token`, `refresh_token`), then stored via Next.js Route Handler (`/api/auth/cookies`) and browser cookie storage with future expiration. `credentials: "include"` must remain disabled on direct cross-origin ofetch requests to prevent CORS fetch failures.

### 2.2 Provider Approval Gating
- **Security Invariant:** New service provider registrations begin with `is_approved=false` and `is_active=false`. Attempting to log in prior to Admin approval returns `HTTP 401 Invalid Email OR Password`.
- **Resolution:** Frontend displays the pending verification notice and routes providers to activation waiting state.

### 2.3 Direct Admin Registration Prohibition
- **Security Invariant:** Public registration with `role: "ADMIN"` is blocked with `HTTP 400 ("You cannot register as admin.")`. Admin accounts must be provisioned internally.

---

## 3. External Integrations & Performance

### 3.1 Render Free Tier Spin-Down Latency
- **Observation:** Remote backend on Render experiences cold-start spin-down delays of 30-50 seconds when inactive.
- **Frontend Mitigation:** Centralized ofetch client and React Query configure 15-second retry and loading skeleton states to keep the UX smooth.

### 3.2 Transactional Email Notification Delay
- **Observation:** When creating bookings (`POST /booking/service_book/`) or resetting passwords, synchronous SMTP email dispatch adds a 25-30 second latency to the response.
- **Frontend Mitigation:** Async mutations show spinner indicators ("Creating your booking...", "Sending reset instructions...") to prevent user double-submissions.

---

## 4. Root Cause Classification Matrix

| Issue | Classification | Detailed Cause | Resolution Implemented |
|---|---|---|---|
| **Online Payment Button Not Showing** | **FRONTEND** | Strict uppercase string checks (`b.status === "ACCEPTED"`, `b.final_payment_method === "ONLINE"`) and checking non-existent booleans (`b.is_advance_paid`, `b.is_final_paid`) resulted in the button never rendering. | Normalized status and payment methods to lowercase. Evaluated actual payment state from `paid_amount`, `advance_amount`, and `payment_status`. |
| **Early Payment Failure (HTTP 400)** | **BACKEND / INVARIANT** | Backend `/payments/payments/advance/initiate/` strictly enforces `booking.status == "accepted"`. Triggering advance payment on a `pending` booking fails with `"Provider must accept the booking first."`. | Frontend enforces two-stage UX: customers see "Awaiting provider acceptance" while pending; payment button is exposed only once accepted. |
| **Service Catalog Pagination Missing** | **FRONTEND** | UI fetched without page navigation and lacked previous/next controls, windowed page indicators, or page reset on filter changes. | Integrated live API `meta` pagination (`page`, `limit`, `total`, `total_pages`), windowed number pagination, and 350ms input debounce. |
| **Review 401 Unauthorized for Guests** | **BOTH** | Backend enforces `@permission_classes([IsAuthenticated])` on `GET /review/get_review/<id>/`. Frontend lacked defensive guest fallback. | Frontend service catches 401 errors gracefully for unauthenticated visitors and returns `[]`. |
| **Profile Update 400 Bad Request** | **FRONTEND / CONFIGURATION** | Backend expects uppercase choice `MALE`/`FEMALE`/`OTHER` and `max_length=15` on `phone`. Frontend passed lowercase/mixed-case choices and unsanitized phone strings. | Frontend form normalizes `gender` to uppercase and strips whitespace while enforcing max 15 characters. |
| **Booking Creation 20s+ Latency** | **BACKEND / EXTERNAL** | Backend sends confirmation email synchronously via Google SMTP during `POST /booking/service_book/`. | Added loading feedback and debounced actions to prevent duplicate submission during SMTP dispatch. |
| **Render Cold Start Spin-Down (30-50s)** | **EXTERNAL** | Render free-tier web services spin down after 15 minutes of inactivity. | Configured resilient retry logic in ofetch client and informative skeleton states. |
