# Local Service Finder System — Frontend API Integration Documentation

> **Generated from actual source code analysis. Every endpoint, field, and workflow documented here is verified against the real backend code.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Base URL & API Configuration](#2-base-url--api-configuration)
3. [Authentication Workflow](#3-authentication-workflow)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Complete API Documentation](#5-complete-api-documentation)
6. [Complete Business Workflows](#6-complete-business-workflows)
7. [Database Relationships & Business Logic](#7-database-relationships--business-logic)
8. [API Sequence Diagrams](#8-api-sequence-diagrams)
9. [Frontend Integration Guide](#9-frontend-integration-guide)
10. [API Reference Table](#10-api-reference-table)
11. [Important Notes & Known Limitations](#11-important-notes--known-limitations)

---

## 1. Project Overview

### Description
**Local Service Finder System** is a location-based service marketplace built with Django REST Framework. It connects **Customers** who need home/local services with **Service Providers** (plumbers, electricians, cleaners, etc.) in the same geographical area.

### Main Features
- Role-based user registration (Customer / Service Provider)
- Admin-controlled Service Provider approval system
- Location-based service search (Division → District → Upazila → Area)
- Service creation and management by providers
- Complete booking lifecycle (create → accept/reject → complete)
- Two payment methods: **Cash** or **Online (SSLCommerz)**
- Mandatory 20% advance payment, remaining on completion
- Review and rating system (after booking completion)
- JWT authentication with token blacklist support

### Technologies Used
| Technology | Purpose |
|---|---|
| Python / Django | Backend framework |
| Django REST Framework | API layer |
| SimpleJWT | JWT authentication |
| drf-yasg | Swagger UI documentation |
| SSLCommerz | Online payment gateway (Bangladesh) |
| Cloudinary | Image hosting (profile & service images) |
| Neon PostgreSQL | Production database |
| CORS Headers | Cross-origin request handling |

### Overall System Workflow
```
Customer searches service by location → Finds provider → Creates booking →
Provider accepts → Customer pays 20% advance online →
Provider completes service → Customer pays remaining (cash or online) →
Customer submits review
```

---

## 2. Base URL & API Configuration

### Base URLs
```
Local Development:  http://127.0.0.1:8000/api/v1
Production:         https://local-service-finder-system.onrender.com/api/v1
```

> **Note:** The production backend URL in `.env` is configured as `BACKEND_URL=https://local-service-finder-system.vercel.app/api/v1`. All SSLCommerz callback URLs are built dynamically from this value.

### Swagger UI
```
http://127.0.0.1:8000/swagger/        → Interactive API docs
http://127.0.0.1:8000/redoc/          → ReDoc documentation
```

### Content-Type
- **Most endpoints:** `multipart/form-data` (because views use `MultiPartParser` and `FormParser`)
- **Payment endpoints:** `application/json`
- **Login/Register:** `application/json`

> ⚠️ **Important:** Booking, service, and profile endpoints use `multipart/form-data`, NOT `application/json`. Always send these as `FormData` in the frontend.

### Request Format
```http
POST /api/v1/accounts/signup/
Content-Type: application/json
Authorization: Bearer <access_token>   (only for protected endpoints)
```

### Standard Response Format
All API responses follow this pattern:
```json
{
  "message": "Human-readable status message",
  "data": { ... }   // or array [...], or directly the object
}
```

Error responses:
```json
{
  "error": "Error description"
}
```
or
```json
{
  "field_name": ["Validation error detail"]
}
```

---

## 3. Authentication Workflow

The system uses **JWT (JSON Web Tokens)** with SimpleJWT.

### Token Configuration
| Setting | Value |
|---|---|
| Access Token Lifetime | **60 minutes** |
| Refresh Token Lifetime | **60 days** |
| Token Type | Bearer |
| Algorithm | HS256 |
| Rotate Refresh Tokens | False |

### 3.1 User Registration

**POST** `/api/v1/accounts/signup/`

No authentication required.

**Request Body (JSON):**
```json
{
  "first_name": "Reza",
  "last_name": "Ahmed",
  "email": "reza@example.com",
  "password": "SecurePass123",
  "role": "CUSTOMER"
}
```

**Role values:** `"CUSTOMER"` or `"SERVICE_PROVIDER"` (case-insensitive; `"ADMIN"` is rejected)

**Response for CUSTOMER (201):**
```json
{
  "message": "signup successfully",
  "user": {
    "id": "uuid-string",
    "first_name": "Reza",
    "last_name": "Ahmed",
    "role": "CUSTOMER",
    "email": "reza@example.com",
    "name": "Reza Ahmed",
    "create_at": "2026-11-22T10:00:00Z",
    "last_login": null,
    "is_approved": true,
    "is_superuser": false,
    "is_active": true
  },
  "token": {
    "refresh": "eyJ...",
    "access": "eyJ..."
  }
}
```

**Response for SERVICE_PROVIDER (201):**
```json
{
  "message": "service provider request sent to admin",
  "user": {
    "id": "uuid-string",
    "role": "SERVICE_PROVIDER",
    "is_approved": false,
    "is_active": false,
    ...
  },
  "token": null
}
```

> ⚠️ **Service Providers cannot log in until admin approves their account.** `token` is `null` on registration.

**Error Responses:**
- `400` — Validation errors (email already exists, invalid role, missing fields)

---

### 3.2 User Login (Signin)

**POST** `/api/v1/accounts/signin/`

No authentication required.

**Request Body (JSON):**
```json
{
  "email": "reza@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "message": "Login Successfully .",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Responses:**
- `401` — `{"message": "Invalid Email OR Password."}`

> ⚠️ **Note the response keys:** `access_token` and `refresh_token` (NOT `access` and `refresh` as SimpleJWT default).

---

### 3.3 How to Send Authorization Headers

For all protected endpoints, include the access token:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**JavaScript / Axios example:**
```javascript
const response = await axios.get('/api/v1/profiles/get_profile/', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  }
});
```

---

### 3.4 Token Refresh

> ⚠️ **There is no dedicated `/token/refresh/` endpoint exposed in the URL configuration.** SimpleJWT's built-in token refresh URL is NOT added to the project's `urlpatterns`. 
>
> **Workaround:** When you receive a `401`, the user must re-login via `/api/v1/accounts/signin/`.

---

### 3.5 Logout

> ⚠️ **There is no logout endpoint in the API.** Token blacklisting is installed (`rest_framework_simplejwt.token_blacklist`) but no logout view is wired up.
>
> **Frontend handling:** Delete the tokens from storage on the client side. The access token will expire automatically after 60 minutes.

---

### 3.6 Password Change (Authenticated)

**POST** `/api/v1/accounts/change_password/`

Authentication: Required (any authenticated user)

**Request Body (JSON):**
```json
{
  "old_password": "OldPass123",
  "new_password": "NewPass456"
}
```

**Success Response (200):**
```json
{"message": "Change password successful."}
```

**Error (400):**
```json
{"message": "Wrong Old Password."}
```

---

### 3.7 Password Reset via OTP

**Step 1 — Send OTP:**

**POST** `/api/v1/accounts/send_otp/`

No authentication required.

```json
{"email": "reza@example.com"}
```

**Success (201):**
```json
{
  "status": "success",
  "message": "OTP Send Successfully to Your Gmail"
}
```

OTP is valid for **5 minutes**.

---

**Step 2 — Reset Password:**

**POST** `/api/v1/accounts/reset_password/`

No authentication required.

```json
{
  "email": "reza@example.com",
  "otp": "482931",
  "new_password": "NewSecurePass123"
}
```

**Success (200):**
```json
{
  "status": "success",
  "message": "password reset successful"
}
```

**Error responses:**
- `{"status": "error", "message": "otp time expired"}`
- `{"status": "failed", "message": "wrong otp"}`
- `{"status": "failed", "message": "email does not exists."}`

---

## 4. User Roles & Permissions

### Role Summary

| Role | Registration | Login | Approval Required |
|---|---|---|---|
| `CUSTOMER` | Self-register | Immediate | No |
| `SERVICE_PROVIDER` | Self-register | Only after admin approval | **Yes** |
| `ADMIN` | Cannot self-register (must use `createsuperuser`) | Yes | No |

### Permission Classes

| Permission Class | Checks |
|---|---|
| `AllowAny` | No authentication or role check |
| `IsAuthenticated` | Must be logged in (any role) |
| `IsCustomer` | Must be authenticated + `role == "CUSTOMER"` |
| `IsServiceProvider` | Must be authenticated + `role == "SERVICE_PROVIDER"` |
| `IsAdmin` | Must be authenticated + `role == "ADMIN"` |
| `IsAdminORServiceProvider` | Must be authenticated + role in `["ADMIN", "SERVICE_PROVIDER"]` |

### Access by Role

**CUSTOMER can:**
- Register, login, change/reset password
- View all services, categories, profiles (public)
- Search services by location
- Create, update, cancel (pending only) bookings
- Pay advance online (after provider accepts)
- Pay remaining balance (online or cash)
- Submit, update, delete reviews (after completed booking)
- View their own profile and booking list

**SERVICE_PROVIDER can:**
- Same public access as customer for read-only
- Create, update, delete their own services
- View and manage bookings for their services (accept/reject/complete)
- Confirm cash payment for completed bookings
- View their own profile

**ADMIN can:**
- Approve service provider accounts
- Create, update, delete categories
- Create, update, delete locations (divisions, districts, upazilas)
- Delete any service (including other providers')
- View pending provider list and counts
- All service provider read capabilities

---

## 5. Complete API Documentation

---

### 5.1 Authentication APIs

#### Signup
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/accounts/signup/` |
| **Auth** | None |
| **Role** | Any |

#### Signin
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/accounts/signin/` |
| **Auth** | None |
| **Role** | Any |

#### Change Password
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/accounts/change_password/` |
| **Auth** | JWT Required |
| **Role** | Any authenticated user |

#### Send OTP
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/accounts/send_otp/` |
| **Auth** | None |

#### Reset Password
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/accounts/reset_password/` |
| **Auth** | None |

---

### 5.2 Category APIs

#### List All Categories
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/categories/all_category/` |
| **Auth** | None |
| **Role** | Public |

**Response (200):**
```json
[
  {
    "id": "uuid-string",
    "user": "uuid-string",
    "image": "https://cloudinary.com/...",
    "name": "Electrician",
    "is_active": true,
    "create_at": "2026-11-01T10:00:00Z",
    "update_at": "2026-11-01T10:00:00Z"
  }
]
```

#### Create Category
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/categories/create_category/` |
| **Auth** | JWT Required |
| **Role** | ADMIN only |

**Request (JSON):**
```json
{
  "name": "Plumber",
  "image": "<file upload>",
  "is_active": true
}
```

#### Update / Delete Category
| Field | Value |
|---|---|
| **Method** | `PATCH` / `DELETE` |
| **URL** | `/api/v1/categories/category_modify/{id}/` |
| **Auth** | JWT Required |
| **Role** | ADMIN only |
| **Path Param** | `id` — Category UUID |

#### Search Category
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/categories/category_search/` |
| **Auth** | None |
| **Query Param** | `search` (required) — keyword |

**Response (200):**
```json
{
  "category": [
    {"id": "uuid", "name": "Electrician", ...}
  ]
}
```

---

### 5.3 Service APIs

#### List All Services (Public, Paginated)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/service/all_service/` |
| **Auth** | None |
| **Role** | Public |
| **Query Params** | `page` (optional) |

**Response (200) — Paginated:**
```json
{
  "count": 50,
  "next": "http://.../api/v1/service/all_service/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid-string",
      "provider": "uuid-string",
      "name": "Home Electrical Repair",
      "image": "https://cloudinary.com/...",
      "shot_description": "Quick electrical fixes",
      "description": "<p>Full service electrical...</p>",
      "category": "uuid-string",
      "pricing_type": "fixed",
      "hour_base_price": null,
      "base_price": "500.00",
      "is_active": true,
      "create_at": "2026-11-01T10:00:00Z",
      "update_at": "2026-11-01T10:00:00Z"
    }
  ]
}
```

**Pricing Type values:**
- `"fixed"` — Uses `base_price` field
- `"hourly"` — Uses `hour_base_price` field
- `"quotation"` — Cannot be booked directly (requires manual arrangement)

#### Get My Services (Provider)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/service/services/` |
| **Auth** | JWT Required |
| **Role** | SERVICE_PROVIDER |

#### Create Service (Provider)
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/service/services/` |
| **Auth** | JWT Required |
| **Role** | SERVICE_PROVIDER |
| **Content-Type** | `multipart/form-data` |

**Request Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | ✅ | Max 200 chars |
| `category` | UUID | ✅ | Category ID |
| `pricing_type` | string | ✅ | `fixed`, `hourly`, or `quotation` |
| `base_price` | decimal | Conditional | Required if `pricing_type=fixed` |
| `hour_base_price` | decimal | Conditional | Required if `pricing_type=hourly` |
| `image` | file | ❌ | Uploaded to Cloudinary |
| `shot_description` | string | ❌ | Max 255 chars |
| `description` | string | ❌ | HTML allowed; sanitized via bleach |
| `is_active` | boolean | ❌ | Default: `true` |

> ⚠️ **Description HTML:** Only these tags are allowed: `p`, `br`, `strong`, `b`, `i`, `em`, `u`, `ul`, `ol`, `li`, `h2`, `h3`, `blockquote`. Attributes are stripped. Send content through a rich text editor that restricts to these tags.

**Response (201):**
```json
{
  "status": "success",
  "service": {
    "id": "uuid-string",
    "provider": "uuid-string",
    "name": "Home Plumbing",
    "image": "https://cloudinary.com/...",
    "pricing_type": "fixed",
    "base_price": "800.00",
    ...
  }
}
```

#### Update Service (Provider / Admin)
| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/v1/service/service_modify/{id}/` |
| **Auth** | JWT Required |
| **Role** | SERVICE_PROVIDER (own services only) or ADMIN (any service) |
| **Content-Type** | `multipart/form-data` |

**Updatable fields:** `name`, `description`, `hour_base_price`, `image`

> ⚠️ **Note:** `ServiceUpdateSerializers` only allows updating `name`, `description`, `hour_base_price`, `image`. Other fields like `pricing_type` and `base_price` cannot be changed via this endpoint.

#### Delete Service
| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/service/service_modify/{id}/` |
| **Auth** | JWT Required |
| **Role** | SERVICE_PROVIDER (own only) or ADMIN (any) |

**Response (200):**
```json
{"message": " service delete successfully"}
```

#### Search Service by Location
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/service/search_service/` |
| **Auth** | None |
| **Role** | Public |

**Query Parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `upazila` | integer | ✅ | Upazila ID (from location API) |
| `search` | string | ✅ | Keyword (service name, description, or category name) |
| `area` | string | ❌ | Exact area name (case-insensitive) |

**Example request:**
```
GET /api/v1/service/search_service/?upazila=5&search=electrician&area=Gulshan
```

**How it works:**
1. Filters services where the **provider's upazila ID** matches `upazila` param
2. Optionally filters by provider's `area` (case-insensitive exact match)
3. Then searches across service `name`, `description`, and `category.name`

**Response (200) — Paginated:**
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [ { ...service objects... } ]
}
```

**Error (400):**
```json
{"detail": "Upazila and Search query are required"}
```

#### Filter Services by Category
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/service/filter_service_by_category/{pk}/` |
| **Auth** | None |
| **Role** | Public |
| **Path Param** | `pk` — Category UUID |

Returns all **active** services in that category (not paginated).

#### Filter Services by Pricing Type
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/service/filter_service_by_pricingType/` |
| **Auth** | None |
| **Role** | Public |
| **Query Param** | `pricing_type` — `fixed`, `hourly`, or `quotation` (optional) |

Returns paginated list. If `pricing_type` is omitted, returns all services.

---

### 5.4 Profile APIs

#### Get All Profiles (Public)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/profiles/get_all_profile/` |
| **Auth** | None |
| **Role** | Public |

**Response (200):**
```json
{
  "profile": [
    {
      "id": 1,
      "user": "uuid-string",
      "image": "https://cloudinary.com/...",
      "gender": "MALE",
      "city": "Dhaka",
      "area": "Gulshan",
      "phone": "01700000000",
      "bio": "Experienced electrician",
      "experience": 5,
      "is_verified": false,
      "is_available": true,
      "latitude": null,
      "longitude": null
    }
  ]
}
```

**Profile fields (read-only):** `id`, `user`, `is_verified`, `is_available`, `latitude`, `longitude`

#### Get Own Profile (Authenticated)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/profiles/get_profile/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER, SERVICE_PROVIDER, or ADMIN |

**Response (200):**
```json
{
  "profile": { ...profile object... }
}
```

#### Get Profile by ID (Public)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/profiles/get_user_profile/{id}/` |
| **Auth** | None |
| **Role** | Public |
| **Path Param** | `id` — Profile integer ID |

> ⚠️ **Note:** This uses the Profile's **integer `id`**, not the User's UUID.

#### Update Profile
| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/v1/profiles/modify_profile/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER, SERVICE_PROVIDER, or ADMIN |
| **Content-Type** | `multipart/form-data` |

**Updatable fields:**
| Field | Type | Notes |
|---|---|---|
| `image` | file | Uploaded to Cloudinary |
| `gender` | string | `MALE`, `FEMALE`, or `OTHER` |
| `city` | string | Max 400 chars |
| `area` | string | Max 400 chars |
| `phone` | string | Max 15 chars |
| `bio` | text | Free text |
| `experience` | integer | Years of experience |

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "profile": { ...updated profile fields... }
}
```

#### Delete Profile
| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/profiles/modify_profile/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER, SERVICE_PROVIDER, or ADMIN |

**Response (204):**
```json
{"message": "Profile deleted successfully"}
```

#### Search Profile (Public)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/profiles/search/` |
| **Auth** | None |
| **Role** | Public |
| **Query Param** | `search` — keyword (searches first_name, last_name, city, area) |

---

### 5.5 Booking APIs

#### Create Booking (Customer)
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/booking/service_book/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Content-Type** | `multipart/form-data` |

**Request Fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `service` | UUID | ✅ | Service ID |
| `booking_date` | date | ✅ | Format: `YYYY-MM-DD` |
| `booking_time` | time | ✅ | Format: `HH:MM` (24-hour) |
| `final_payment_method` | string | ✅ | `"cash"` or `"online"` |
| `note` | text | ❌ | Optional note to provider |
| `duration` | duration | Conditional | Required if service `pricing_type=hourly` |

**Duration format for hourly bookings:**
```
"PT2H30M" → 2 hours 30 minutes (ISO 8601 duration format)
```

**How price is calculated:**
- **Fixed pricing:** `price = service.base_price`
- **Hourly pricing:** `price = service.hour_base_price × (duration in hours)`
- **Quotation:** Booking is **rejected** — cannot be booked directly

**Advance amount:** Automatically calculated as `price × 20%`

**Booking slot validation:** A service cannot be booked within **2 hours** of an existing pending/accepted/in-progress booking.

**Success Response (201):**
```json
{
  "message": "Service booking successful.",
  "data": {
    "id": "uuid-string",
    "user": "uuid-string",
    "service": "uuid-string",
    "note": null,
    "price_at_booking": "800.00",
    "status": "pending",
    "payment_status": "unpaid",
    "final_payment_method": "cash",
    "advance_amount": "160.00",
    "paid_amount": "0.00",
    "booking_date": "2026-12-01",
    "booking_time": "14:30:00",
    "duration": null,
    "completed_time": null,
    "cancellation_reason": null,
    "cancelled_by": null,
    "cancelled_at": null,
    "is_paid": false,
    "created_at": "2026-11-22T10:00:00Z",
    "updated_at": "2026-11-22T10:00:00Z",
    "remaining_amount": "800.00"
  }
}
```

**Error responses:**
- `400` — Service not active, pricing not configured, slot conflict (2-hour rule), quotation service

#### Get My Bookings (Customer)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/booking/my_bookings/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |

Returns all bookings for the logged-in customer, ordered newest first.

**Response (200):**
```json
{
  "message": "My bookings",
  "data": [ { ...booking objects... } ]
}
```

#### Get All Bookings (Provider)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/booking/get_all_booking/` |
| **Auth** | JWT Required |
| **Role** | SERVICE_PROVIDER only |

Returns all bookings for services owned by the logged-in provider.

#### Update Booking (Customer)
| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/v1/booking/booking_update/{pk}/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Path Param** | `pk` — Booking UUID |
| **Content-Type** | `multipart/form-data` |

> ⚠️ **Only PENDING bookings can be updated.** Accepted/rejected/completed bookings cannot be modified.

**Updatable fields:** `note`, `booking_time`, `booking_date`

#### Cancel Booking (Customer)
| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/booking/cancel_booking/{pk}/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Path Param** | `pk` — Booking UUID |
| **Content-Type** | `multipart/form-data` |

> ⚠️ **Only PENDING bookings can be cancelled.**

**Request:**
```
cancellation_reason=Customer changed plans (optional form field)
```

**Success Response (200):**
```json
{"message": "booking cancelled"}
```

**Error (400):**
```json
{"message": "only pending service cancelled"}
```

---

### 5.6 Booking Status Values

| Status | Meaning |
|---|---|
| `pending` | Customer booked, awaiting provider response |
| `accepted` | Provider accepted the booking |
| `rejected` | Provider rejected the booking |
| `in_progress` | Service currently in progress (not currently set via API) |
| `completed` | Provider marked the service as done |
| `cancelled` | Customer cancelled the booking |

### Payment Status Values

| Status | Meaning |
|---|---|
| `unpaid` | No payment made yet |
| `pending` | Payment initiated but not confirmed |
| `partially_paid` | Advance paid; final remaining |
| `paid` | Fully paid |
| `failed` | Payment failed |
| `refunded` | Payment refunded (not implemented in backend) |

---

### 5.7 Dashboard APIs

#### Admin Dashboard

**GET** `/api/v1/dashboard/admin/admin/` — Welcome message  
**GET** `/api/v1/dashboard/admin/pending_account/` — List providers awaiting approval  
**PATCH** `/api/v1/dashboard/admin/account_activate/{pk}/` — Approve a provider account  
**GET** `/api/v1/dashboard/admin/total_activate_account_count/` — Count of approved providers  
**GET** `/api/v1/dashboard/admin/total_activate_pending_count/` — Count of pending providers  

All require: JWT + ADMIN role.

**Approve Provider (PATCH):**
```
PATCH /api/v1/dashboard/admin/account_activate/{uuid}/
```
Path param: Provider's user UUID.

**Response (200):**
```json
{
  "message": "account activate",
  "data": { ...user object... }
}
```

---

#### Service Provider Dashboard

All require: JWT + SERVICE_PROVIDER role.

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/dashboard/service_provider/service_provide/` | GET | Welcome message |
| `/api/v1/dashboard/service_provider/get_pending_booking/` | GET | Pending bookings |
| `/api/v1/dashboard/service_provider/get_accept_booking/` | GET | Accepted bookings |
| `/api/v1/dashboard/service_provider/accept_booking/{pk}/` | POST | Accept a booking |
| `/api/v1/dashboard/service_provider/reject_booking/{pk}/` | POST | Reject a booking |
| `/api/v1/dashboard/service_provider/complete_booking/{pk}/` | POST | Mark booking complete |
| `/api/v1/dashboard/service_provider/total_accept_booking/` | GET | Count of accepted bookings |
| `/api/v1/dashboard/service_provider/total_completed_booking/` | GET | Count of completed bookings |

**Accept Booking (POST):**
```
POST /api/v1/dashboard/service_provider/accept_booking/{booking-uuid}/
```
- Only works on `pending` bookings
- Sends email notification to customer (best effort)

**Response (200):**
```json
{
  "message": "Booking accepted",
  "data": { ...booking object... }
}
```

**Reject Booking (POST):**
- Only works on `pending` bookings
- Response: `{"message": "booking reject successfully", "data": {...}}`

**Complete Booking (POST):**
- Only works on `accepted` bookings
- Cannot complete before the scheduled `booking_date` + `booking_time`
- Sets `completed_time` to current time

**Get Pending/Accepted Bookings Response:**
```json
{
  "message": "pending booking",
  "data": [ { ...booking objects... } ]
}
```

---

#### Customer Dashboard

All require: JWT + CUSTOMER role.

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/dashboard/customer/customer/` | GET | Welcome message |
| `/api/v1/dashboard/customer/total_oder_list/` | GET | All bookings |
| `/api/v1/dashboard/customer/completed_booking/` | GET | Completed bookings only |
| `/api/v1/dashboard/customer/pending_booking/` | GET | Pending bookings only |

---

### 5.8 Payment APIs

#### Initiate Advance Payment (Customer)

After provider accepts the booking, customer pays **20% advance online**.

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/payments/payments/advance/initiate/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Content-Type** | `application/json` |

**Prerequisites:**
- Booking status must be `accepted`
- Booking `paid_amount` must be `0` (not already paid)

**Request Body:**
```json
{
  "booking_id": "uuid-of-the-booking"
}
```

**Success Response (201):**
```json
{
  "payment_id": "uuid-string",
  "transaction_id": "uuid-string",
  "purpose": "advance",
  "amount": "160.00",
  "gateway_url": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "booking_total": "800.00",
  "booking_advance_amount": "160.00",
  "booking_paid_amount": "0.00",
  "booking_remaining_amount": "800.00"
}
```

> 🔑 **Frontend must redirect the user to `gateway_url`.** This is the SSLCommerz payment page.

**Error responses:**
- `400` — Provider hasn't accepted yet, or advance already paid
- `409` — A payment attempt is already pending
- `502` — SSLCommerz is unavailable

---

#### Initiate Final Payment (Customer)

After service is completed, customer pays the **remaining balance** online.

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/payments/payments/final/initiate/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Content-Type** | `application/json` |

**Prerequisites:**
- Booking status must be `completed`
- Booking `final_payment_method` must be `"online"`
- Remaining amount must be greater than 0

**Request Body:**
```json
{
  "booking_id": "uuid-of-the-booking"
}
```

**Response:** Same structure as advance payment initiation.

---

#### Confirm Cash Payment (Service Provider)

After completing a cash-based service, the provider confirms they received the cash.

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/payments/payments/cash/{booking_id}/` |
| **Auth** | JWT Required |
| **Role** | SERVICE_PROVIDER only |
| **Path Param** | `booking_id` — Booking UUID |

**Prerequisites:**
- Booking status must be `completed`
- Booking `final_payment_method` must be `"cash"`

**Response (200):**
```json
{
  "message": "Cash payment confirmed.",
  "paid_amount": "800.00",
  "remaining_amount": "0.00",
  "payment_status": "paid",
  "is_paid": true
}
```

---

#### Check Payment Status (Customer)

| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/payments/status/{payment_id}/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Path Param** | `payment_id` — Payment UUID |

**Response (200):**
```json
{
  "payment_id": "uuid-string",
  "transaction_id": "uuid-string",
  "purpose": "advance",
  "payment_attempt_status": "success",
  "payment_amount": "160.00",
  "booking_payment_status": "partially_paid",
  "booking_paid_amount": "160.00",
  "booking_remaining_amount": "640.00",
  "booking_is_paid": false
}
```

**`payment_attempt_status` values:** `pending`, `success`, `failed`, `refunded`

---

#### SSLCommerz Callback Endpoints (Backend Only)

> ⚠️ **These endpoints are called by SSLCommerz, NOT by the frontend.** Do not call these directly.

| Endpoint | Purpose |
|---|---|
| `POST /api/v1/payments/success/` | SSLCommerz success callback — verifies payment and redirects to frontend |
| `POST /api/v1/payments/fail/` | SSLCommerz failure callback |
| `POST /api/v1/payments/cancel/` | SSLCommerz cancel callback |
| `POST /api/v1/payments/ipn/` | Instant Payment Notification (server-to-server) |

**After `payment_success` verifies the payment:**
- **On success:** Redirects to `{FRONTEND_URL}/payment/success/?tran_id={transaction_id}`
- **On failure:** Redirects to `{FRONTEND_URL}/payment/failed/`

**Frontend must implement:**
- `/payment/success/` page — reads `tran_id` query param and calls payment status API
- `/payment/failed/` page — shows failure message

---

### 5.9 Review & Rating APIs

#### Create Review (Customer)

| Field | Value |
|---|---|
| **Method** | `POST` |
| **URL** | `/api/v1/review/review/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Content-Type** | `multipart/form-data` |
| **Query Param** | `booking_id` — UUID of the **completed** booking |

**Prerequisites:**
- Booking must be `completed`
- Booking must belong to the logged-in customer
- No existing review for this booking (one review per booking)

**Request Body (form-data):**
| Field | Type | Required | Notes |
|---|---|---|---|
| `rating` | integer | ✅ | 1 to 5 (inclusive) |
| `review` | text | ❌ | Max 1000 chars |
| `service` | UUID | ✅ | Service UUID |
| `booking` | UUID | ✅ | Booking UUID (same as query param) |

> ⚠️ **Both `service` and `booking` must be provided in the request body, AND `booking_id` as a query parameter.**

**Example:**
```
POST /api/v1/review/review/?booking_id=abc-123
Content-Type: multipart/form-data

rating=5
review=Excellent service!
service=service-uuid
booking=abc-123
```

**Success Response (201):**
```json
{
  "id": 1,
  "booking": "uuid-string",
  "service": "uuid-string",
  "user": "uuid-string",
  "rating": 5,
  "review": "Excellent service!",
  "created_at": "2026-11-22T15:00:00Z",
  "updated_at": "2026-11-22T15:00:00Z"
}
```

**Error (400):**
- `{"error": "booking_id is required"}`
- `{"error": "completed booking not found"}`
- `{"error": "review already exists"}`

#### Update Review
| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/v1/review/update_review/{pk}/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Path Param** | `pk` — Review **integer** ID |

#### Delete Review
| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **URL** | `/api/v1/review/delete_review/{pk}/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Path Param** | `pk` — Review **integer** ID |

**Response (200):** `{"details": "review delete successfully"}`

#### Get Reviews for a Service (Customer)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/review/get_review/{service_id}/` |
| **Auth** | JWT Required |
| **Role** | CUSTOMER only |
| **Path Param** | `service_id` — Service **UUID** |

#### Get Average Rating for a Service (Public)
| Field | Value |
|---|---|
| **Method** | `GET` |
| **URL** | `/api/v1/review/get_average_review_rating/{service_id}/` |
| **Auth** | None |
| **Role** | Public |
| **Path Param** | `service_id` — Service **UUID** |

**Response (200):**
```json
{"average_rating": 4.3}
```

Returns `null` if no reviews exist.

---

### 5.10 Location APIs

#### Divisions

| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/location/divisions/division_list/` | GET | None | Public | List all divisions |
| `/api/v1/location/divisions/create_division/` | POST | JWT | ADMIN | Create division |
| `/api/v1/location/divisions/update_division/{pk}/` | PATCH | JWT | ADMIN | Update division |
| `/api/v1/location/divisions/delete_division/{pk}/` | DELETE | JWT | ADMIN | Delete division |

**List Divisions Response:**
```json
{
  "division": [
    {"id": 1, "name": "Dhaka"},
    {"id": 2, "name": "Chittagong"}
  ]
}
```

#### Districts

| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/location/districts/district_list/` | GET | None | Public | List all districts |
| `/api/v1/location/districts/create_district/` | POST | JWT | ADMIN | Create district |
| `/api/v1/location/districts/update_district/{pk}/` | PATCH | JWT | ADMIN | Update district |
| `/api/v1/location/districts/delete_district/{pk}/` | DELETE | JWT | ADMIN | Delete district |

**List Districts Response:**
```json
{
  "district": [
    {"id": 1, "name": "Dhaka", "division": 1},
    {"id": 2, "name": "Gazipur", "division": 1}
  ]
}
```

#### Upazilas

| Endpoint | Method | Auth | Role | Description |
|---|---|---|---|---|
| `/api/v1/location/upazilas/upazila_list/` | GET | None | Public | List all upazilas |
| `/api/v1/location/upazilas/create_upazila/` | POST | JWT | ADMIN | Create upazila |
| `/api/v1/location/upazilas/update_upazila/{pk}/` | PATCH | JWT | ADMIN | Update upazila |
| `/api/v1/location/upazilas/delete_upazila/{pk}/` | DELETE | JWT | ADMIN | Delete upazila |

**List Upazilas Response:**
```json
{
  "upazila": [
    {"id": 1, "name": "Gulshan", "district": 1},
    {"id": 2, "name": "Banani", "district": 1}
  ]
}
```

> 🔑 **Service Search** requires the upazila **integer `id`** (not name). Call the upazila list first to get IDs.

---

## 6. Complete Business Workflows

### A. Customer Registration & Login

```
1. POST /api/v1/accounts/signup/
   Body: {first_name, last_name, email, password, role: "CUSTOMER"}
   
2. Response contains access_token and refresh_token → store both

3. Use access_token in Authorization header for all subsequent requests
```

---

### B. Service Provider Registration & Approval

```
1. POST /api/v1/accounts/signup/
   Body: {first_name, last_name, email, password, role: "SERVICE_PROVIDER"}
   Response: token is null, is_approved: false

2. Admin logs in and calls:
   GET /api/v1/dashboard/admin/pending_account/
   → Sees list of pending providers with their UUIDs

3. Admin approves:
   PATCH /api/v1/dashboard/admin/account_activate/{provider-uuid}/
   → Provider's is_active and is_approved become true

4. Provider can now login:
   POST /api/v1/accounts/signin/
   → Gets access_token and refresh_token
```

---

### C. Service Management (Provider)

```
1. Provider logs in

2. Create service:
   POST /api/v1/service/services/  (multipart/form-data)
   Body: {name, category, pricing_type, base_price, image, description, ...}

3. View own services:
   GET /api/v1/service/services/

4. Update service:
   PATCH /api/v1/service/service_modify/{service-uuid}/  (multipart/form-data)
   Body: {name, description, hour_base_price, image}  (any subset)

5. Delete service:
   DELETE /api/v1/service/service_modify/{service-uuid}/
```

---

### D. Service Search (Customer)

```
1. Load location data:
   GET /api/v1/location/upazilas/upazila_list/
   → User selects their upazila, get its integer id

2. Search services:
   GET /api/v1/service/search_service/?upazila=5&search=electrician
   
   Optional: add &area=Gulshan for more precise results

3. Browse by category:
   GET /api/v1/categories/all_category/
   → Get category UUID
   GET /api/v1/service/filter_service_by_category/{category-uuid}/

4. Filter by pricing type:
   GET /api/v1/service/filter_service_by_pricingType/?pricing_type=fixed
```

---

### E. Complete Booking Workflow

```
Step 1 — Customer creates booking:
  POST /api/v1/booking/service_book/   (multipart/form-data)
  Body: {service, booking_date, booking_time, final_payment_method, [note], [duration]}
  → Status: PENDING, payment_status: UNPAID

Step 2 — Provider reviews pending bookings:
  GET /api/v1/dashboard/service_provider/get_pending_booking/

Step 3 — Provider accepts:
  POST /api/v1/dashboard/service_provider/accept_booking/{booking-uuid}/
  → Status: ACCEPTED
  → Email sent to customer

   OR Provider rejects:
  POST /api/v1/dashboard/service_provider/reject_booking/{booking-uuid}/
  → Status: REJECTED
  → Email sent to customer

Step 4 — If ACCEPTED, customer pays 20% advance online:
  POST /api/v1/payments/payments/advance/initiate/
  Body: {"booking_id": "uuid"}
  → Frontend redirects to gateway_url (SSLCommerz page)
  
  SSLCommerz → Backend success callback → Backend redirects to:
    Frontend: /payment/success/?tran_id=...
  
  Frontend reads tran_id, calls:
  GET /api/v1/payments/status/{payment_id}/
  → Confirm payment_attempt_status is "success"
  → booking payment_status becomes "partially_paid"

Step 5 — Provider completes the service (after scheduled time):
  POST /api/v1/dashboard/service_provider/complete_booking/{booking-uuid}/
  → Status: COMPLETED, completed_time recorded

Step 6a — Cash final payment:
  Provider confirms:
  POST /api/v1/payments/payments/cash/{booking-uuid}/
  → payment_status: PAID, is_paid: true

Step 6b — Online final payment:
  Customer initiates:
  POST /api/v1/payments/payments/final/initiate/
  Body: {"booking_id": "uuid"}
  → Redirect to gateway_url → SSLCommerz → Backend → Frontend

Step 7 — Customer submits review:
  POST /api/v1/review/review/?booking_id={uuid}
  Body: {rating, review, service, booking}
  → Review created (only after COMPLETED booking)
```

---

### F. Booking Cancellation

```
Rules:
- Only customers can cancel their own bookings
- Only PENDING bookings can be cancelled
- Accepted, completed, or rejected bookings cannot be cancelled

API:
POST /api/v1/booking/cancel_booking/{booking-uuid}/
Body (form-data): cancellation_reason=<optional text>

→ Status becomes: CANCELLED
→ cancelled_by, cancelled_at, cancellation_reason are recorded
```

---

### G. Payment Workflow — Detailed

```
                    ┌─────────────────────────────────────────┐
                    │         ADVANCE PAYMENT FLOW             │
                    └─────────────────────────────────────────┘

Frontend                    Backend                      SSLCommerz
   │                           │                              │
   │  POST advance/initiate     │                              │
   │──────────────────────────>│                              │
   │                           │  Creates Payment record      │
   │                           │  Calls SSLCOMMERZ API        │
   │                           │─────────────────────────────>│
   │                           │  Returns gateway_url         │
   │                           │<─────────────────────────────│
   │  {gateway_url: "https://"} │                              │
   │<──────────────────────────│                              │
   │                           │                              │
   │  window.location = gateway_url (redirect user)           │
   │─────────────────────────────────────────────────────────>│
   │                           │                              │
   │                           │  User pays on SSLCommerz     │
   │                           │                              │
   │                           │  POST /payments/success/     │
   │                           │<─────────────────────────────│
   │                           │  Verifies with SSLCommerz    │
   │                           │  Updates Payment: SUCCESS    │
   │                           │  Updates Booking: partially_paid
   │                           │  Redirects to frontend       │
   │<──────────────────────────│                              │
   │  /payment/success/?tran_id=...                           │
   │                           │                              │
   │  GET /payments/status/{id}│                              │
   │──────────────────────────>│                              │
   │  {payment_attempt_status: "success", ...}                │
   │<──────────────────────────│                              │
```

**SSLCommerz callback URLs (auto-generated by backend):**
```
success_url:  https://local-service-finder-system.vercel.app/api/v1/payments/success/
fail_url:     https://local-service-finder-system.vercel.app/api/v1/payments/fail/
cancel_url:   https://local-service-finder-system.vercel.app/api/v1/payments/cancel/
ipn_url:      https://local-service-finder-system.vercel.app/api/v1/payments/ipn/
```

**Frontend redirect pages needed:**
```
/payment/success/    → Read ?tran_id param → show success + call status API
/payment/failed/     → Show failure message
```

---

### H. Review & Rating Workflow

```
1. Booking must be COMPLETED before review can be submitted
2. Each booking can have exactly ONE review (one-to-one relationship)
3. Customer can update their own review later
4. Customer can delete their own review

POST /api/v1/review/review/?booking_id={uuid}
Body (form-data):
  rating=5
  review=Great service!
  service={service-uuid}
  booking={booking-uuid}

→ Review linked to both booking and service
→ Duplicate attempt returns: {"error": "review already exists"}
```

---

## 7. Database Relationships & Business Logic

### Entity Relationships

```
CustomUser (1) ──────── (1) Profile
CustomUser (1) ──────── (∞) Service [as provider]
CustomUser (1) ──────── (∞) Booking [as customer]

Category  (1) ──────── (∞) Service
Service   (1) ──────── (∞) Booking
Service   (1) ──────── (∞) ReviewAndRating

Booking   (1) ──────── (∞) Payment
Booking   (1) ──────── (1) ReviewAndRating [OneToOne]

Division  (1) ──────── (∞) District
District  (1) ──────── (∞) Upazila
CustomUser belongs to one Upazila (for providers: service search scope)
```

### Key Business Rules

1. **Service Provider Approval:** Provider accounts are created with `is_active=False`. They cannot log in until admin sets both `is_active=True` and `is_approved=True`.

2. **Profile Auto-Creation:** A `Profile` record is auto-created for every new user via Django signals (`profiles/signals.py`).

3. **Pricing Logic:**
   - `fixed` pricing → customer pays `base_price`
   - `hourly` pricing → customer provides duration → price = `hour_base_price × hours`
   - `quotation` pricing → cannot be booked through API

4. **Advance Payment:** Always **20%** of `price_at_booking`, automatically calculated at booking creation time.

5. **Booking Slot Conflict:** A service cannot be booked if there is an existing active booking (pending/accepted/in_progress) within a **2-hour window** of the requested time.

6. **Completion Restriction:** Provider cannot mark a booking `completed` before the scheduled `booking_date` + `booking_time` has passed.

7. **Payment Idempotency:** SSLCommerz may send multiple IPN/success callbacks. The backend handles this safely — a `SUCCESS` payment is never double-counted.

8. **Cash vs Online Final Payment:** Set at booking creation via `final_payment_method`. This determines whether the final payment uses the online SSLCommerz flow or the cash confirmation flow.

---

## 8. API Sequence Diagrams

### Authentication Flow

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant BE as Backend
    participant DB as Database

    FE->>BE: POST /accounts/signup/ {email, password, role}
    BE->>DB: Create CustomUser
    DB-->>BE: User created
    
    alt role == CUSTOMER
        BE->>DB: Set is_active=True, is_approved=True
        BE-->>FE: 201 {user, token: {access, refresh}}
    else role == SERVICE_PROVIDER
        BE->>DB: Set is_active=False, is_approved=False
        BE-->>FE: 201 {user, token: null}
    end

    FE->>BE: POST /accounts/signin/ {email, password}
    BE->>DB: Authenticate user
    BE-->>FE: 200 {access_token, refresh_token}
```

### Service Provider Approval Flow

```mermaid
sequenceDiagram
    participant P as Provider
    participant A as Admin
    participant BE as Backend

    P->>BE: POST /accounts/signup/ {role: "SERVICE_PROVIDER"}
    BE-->>P: 201 {token: null, is_active: false}

    A->>BE: GET /dashboard/admin/pending_account/
    BE-->>A: [List of pending providers]

    A->>BE: PATCH /dashboard/admin/account_activate/{uuid}/
    BE-->>A: 200 {message: "account activate"}

    P->>BE: POST /accounts/signin/ {email, password}
    BE-->>P: 200 {access_token, refresh_token}
```

### Booking Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant P as Provider
    participant BE as Backend

    C->>BE: POST /booking/service_book/ {service, date, time, payment_method}
    BE-->>C: 201 {status: pending, advance_amount: 160}

    P->>BE: GET /dashboard/service_provider/get_pending_booking/
    BE-->>P: [pending bookings list]

    P->>BE: POST /dashboard/service_provider/accept_booking/{uuid}/
    BE-->>P: 200 {status: accepted}
    BE-->>C: Email notification sent

    C->>BE: POST /payments/payments/advance/initiate/ {booking_id}
    BE-->>C: 201 {gateway_url: "https://..."}
    C->>C: Redirect to gateway_url (SSLCommerz)
    
    Note over C, BE: User pays on SSLCommerz
    
    BE->>BE: POST /payments/success/ (SSLCommerz callback)
    BE-->>C: Redirect to /payment/success/?tran_id=...

    P->>BE: POST /dashboard/service_provider/complete_booking/{uuid}/
    BE-->>P: 200 {status: completed}

    C->>BE: POST /review/review/?booking_id={uuid} {rating, review}
    BE-->>C: 201 {review created}
```

### Payment Flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant BE as Backend
    participant SSL as SSLCommerz

    C->>BE: POST /payments/advance/initiate/ {booking_id}
    BE->>BE: Validate booking (accepted, not paid)
    BE->>BE: Create Payment record (pending)
    BE->>SSL: Create payment session
    SSL-->>BE: gateway_url
    BE-->>C: 201 {gateway_url, payment_id, amount}

    C->>SSL: Redirect to gateway_url
    Note over C, SSL: User fills card details & pays

    SSL->>BE: POST /payments/success/ {tran_id, val_id}
    BE->>SSL: Validate transaction
    SSL-->>BE: Validation result
    BE->>BE: Update Payment → SUCCESS
    BE->>BE: Update Booking → partially_paid
    BE-->>SSL: 200 OK
    BE->>C: Redirect to FRONTEND_URL/payment/success/?tran_id=...

    C->>BE: GET /payments/status/{payment_id}/
    BE-->>C: {payment_attempt_status: success, booking_payment_status: partially_paid}
```

---

## 9. Frontend Integration Guide

### Token Storage

```javascript
// Store tokens after login
localStorage.setItem('access_token', response.data.access_token);
localStorage.setItem('refresh_token', response.data.refresh_token);

// Get access token
const token = localStorage.getItem('access_token');
```

> ⚠️ Note: There is no `/token/refresh/` endpoint. When the access token expires (60 min), the user must login again.

### Authorization Header Setup (Axios)

```javascript
// Set up axios interceptor
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://local-service-finder-system.onrender.com/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Handling 401 and 403

```javascript
// 401 Unauthorized → User not logged in or token expired → Redirect to login
// 403 Forbidden → User is logged in but doesn't have the right role
//                 Show "Access Denied" message; don't redirect to login

if (error.response.status === 401) {
  // Logout user, clear storage, redirect to login
}
if (error.response.status === 403) {
  // Show permission error message
  alert('You do not have permission to perform this action.');
}
```

### FormData for Booking, Service & Profile

```javascript
// WRONG — will not work for booking/service/profile endpoints
await api.post('/booking/service_book/', JSON.stringify(data), {
  headers: { 'Content-Type': 'application/json' }
});

// CORRECT — use FormData
const formData = new FormData();
formData.append('service', serviceId);
formData.append('booking_date', '2026-12-01');
formData.append('booking_time', '14:30');
formData.append('final_payment_method', 'cash');

await api.post('/booking/service_book/', formData);
// Do NOT set Content-Type header; browser sets multipart/form-data automatically
```

### Image Uploads

```javascript
// Profile image update
const formData = new FormData();
formData.append('image', fileInputRef.current.files[0]);
formData.append('gender', 'MALE');

await api.patch('/profiles/modify_profile/', formData);

// Response includes Cloudinary URL
// data.profile.image = "https://res.cloudinary.com/..."
```

### Payment Redirection

```javascript
// Step 1: Initiate payment (application/json)
const response = await api.post('/payments/payments/advance/initiate/', {
  booking_id: bookingId
});

// Step 2: Redirect to SSLCommerz
const { gateway_url, payment_id } = response.data;
localStorage.setItem('pending_payment_id', payment_id);
window.location.href = gateway_url;  // Full page redirect

// --- User pays on SSLCommerz ---
// --- SSLCommerz → Backend → Redirects back to Frontend ---

// Step 3: On /payment/success/ page
const urlParams = new URLSearchParams(window.location.search);
const tranId = urlParams.get('tran_id');
const paymentId = localStorage.getItem('pending_payment_id');

// Step 4: Verify payment status
const statusResponse = await api.get(`/payments/status/${paymentId}/`);
const { payment_attempt_status, booking_payment_status } = statusResponse.data;

if (payment_attempt_status === 'success') {
  // Show success message
} else {
  // Show failure message
}
```

### Booking Status Display Logic

```javascript
const getBookingStatusColor = (status) => {
  const colors = {
    pending: 'yellow',
    accepted: 'blue',
    rejected: 'red',
    in_progress: 'orange',
    completed: 'green',
    cancelled: 'gray',
  };
  return colors[status] || 'gray';
};

const getPaymentStatusLabel = (paymentStatus) => {
  const labels = {
    unpaid: 'Not Paid',
    pending: 'Payment Processing',
    partially_paid: 'Advance Paid',
    paid: 'Fully Paid',
    failed: 'Payment Failed',
    refunded: 'Refunded',
  };
  return labels[paymentStatus] || paymentStatus;
};
```

### Error Handling Pattern

```javascript
const createBooking = async (bookingData) => {
  try {
    setLoading(true);
    const formData = new FormData();
    Object.entries(bookingData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
    
    const response = await api.post('/booking/service_book/', formData);
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 400) {
      // Validation errors
      const errors = error.response.data;
      if (errors.booking_time) {
        alert(errors.booking_time[0]);  // "2-hour gap required"
      } else if (errors.error) {
        alert(errors.error);            // "Service not active"
      }
    } else if (error.response?.status === 401) {
      // Handle auth error
    }
    throw error;
  } finally {
    setLoading(false);
  }
};
```

### Pagination Handling

```javascript
// All paginated endpoints return this structure:
{
  count: 50,          // Total items
  next: "url...",     // Next page URL (null if last page)
  previous: null,     // Previous page URL
  results: [...]      // Items on this page
}

// Load next page
if (data.next) {
  const nextPage = await api.get(data.next);
  setItems(prev => [...prev, ...nextPage.data.results]);
}
```

---

## 10. API Reference Table

| Feature | Method | Endpoint | Auth | Role | Purpose |
|---|---|---|---|---|---|
| **ACCOUNTS** |||||
| Register | POST | `/api/v1/accounts/signup/` | No | Any | Register customer or provider |
| Login | POST | `/api/v1/accounts/signin/` | No | Any | Get JWT tokens |
| Change Password | POST | `/api/v1/accounts/change_password/` | JWT | Any | Change own password |
| Send OTP | POST | `/api/v1/accounts/send_otp/` | No | Any | Request password reset OTP |
| Reset Password | POST | `/api/v1/accounts/reset_password/` | No | Any | Reset password with OTP |
| **CATEGORIES** |||||
| List Categories | GET | `/api/v1/categories/all_category/` | No | Public | List all categories |
| Create Category | POST | `/api/v1/categories/create_category/` | JWT | ADMIN | Create a new category |
| Update Category | PATCH | `/api/v1/categories/category_modify/{id}/` | JWT | ADMIN | Update a category |
| Delete Category | DELETE | `/api/v1/categories/category_modify/{id}/` | JWT | ADMIN | Delete a category |
| Search Category | GET | `/api/v1/categories/category_search/` | No | Public | Search by name |
| **SERVICES** |||||
| All Services | GET | `/api/v1/service/all_service/` | No | Public | List all services (paginated) |
| My Services | GET | `/api/v1/service/services/` | JWT | PROVIDER | Provider's own services |
| Create Service | POST | `/api/v1/service/services/` | JWT | PROVIDER | Create service |
| Update Service | PATCH | `/api/v1/service/service_modify/{id}/` | JWT | PROVIDER/ADMIN | Update service |
| Delete Service | DELETE | `/api/v1/service/service_modify/{id}/` | JWT | PROVIDER/ADMIN | Delete service |
| Search Service | GET | `/api/v1/service/search_service/` | No | Public | Location-based search |
| Filter by Category | GET | `/api/v1/service/filter_service_by_category/{pk}/` | No | Public | Filter by category |
| Filter by Pricing | GET | `/api/v1/service/filter_service_by_pricingType/` | No | Public | Filter by pricing type |
| **PROFILES** |||||
| All Profiles | GET | `/api/v1/profiles/get_all_profile/` | No | Public | List all profiles |
| My Profile | GET | `/api/v1/profiles/get_profile/` | JWT | Any | Get own profile |
| Profile by ID | GET | `/api/v1/profiles/get_user_profile/{id}/` | No | Public | Get profile by integer ID |
| Update Profile | PATCH | `/api/v1/profiles/modify_profile/` | JWT | Any | Update own profile |
| Delete Profile | DELETE | `/api/v1/profiles/modify_profile/` | JWT | Any | Delete own profile |
| Search Profile | GET | `/api/v1/profiles/search/` | No | Public | Search profiles |
| **BOOKINGS** |||||
| Create Booking | POST | `/api/v1/booking/service_book/` | JWT | CUSTOMER | Book a service |
| My Bookings | GET | `/api/v1/booking/my_bookings/` | JWT | CUSTOMER | Customer's bookings |
| All Bookings | GET | `/api/v1/booking/get_all_booking/` | JWT | PROVIDER | Provider's service bookings |
| Update Booking | PATCH | `/api/v1/booking/booking_update/{pk}/` | JWT | CUSTOMER | Update pending booking |
| Cancel Booking | POST | `/api/v1/booking/cancel_booking/{pk}/` | JWT | CUSTOMER | Cancel pending booking |
| **DASHBOARD — ADMIN** |||||
| Admin Panel | GET | `/api/v1/dashboard/admin/admin/` | JWT | ADMIN | Welcome |
| Pending Accounts | GET | `/api/v1/dashboard/admin/pending_account/` | JWT | ADMIN | Pending providers |
| Approve Account | PATCH | `/api/v1/dashboard/admin/account_activate/{pk}/` | JWT | ADMIN | Approve provider |
| Active Count | GET | `/api/v1/dashboard/admin/total_activate_account_count/` | JWT | ADMIN | Active providers count |
| Pending Count | GET | `/api/v1/dashboard/admin/total_activate_pending_count/` | JWT | ADMIN | Pending providers count |
| **DASHBOARD — PROVIDER** |||||
| Provider Panel | GET | `/api/v1/dashboard/service_provider/service_provide/` | JWT | PROVIDER | Welcome |
| Pending Bookings | GET | `/api/v1/dashboard/service_provider/get_pending_booking/` | JWT | PROVIDER | Pending bookings |
| Accepted Bookings | GET | `/api/v1/dashboard/service_provider/get_accept_booking/` | JWT | PROVIDER | Accepted bookings |
| Accept Booking | POST | `/api/v1/dashboard/service_provider/accept_booking/{pk}/` | JWT | PROVIDER | Accept booking |
| Reject Booking | POST | `/api/v1/dashboard/service_provider/reject_booking/{pk}/` | JWT | PROVIDER | Reject booking |
| Complete Booking | POST | `/api/v1/dashboard/service_provider/complete_booking/{pk}/` | JWT | PROVIDER | Mark completed |
| Accept Count | GET | `/api/v1/dashboard/service_provider/total_accept_booking/` | JWT | PROVIDER | Accepted bookings count |
| Complete Count | GET | `/api/v1/dashboard/service_provider/total_completed_booking/` | JWT | PROVIDER | Completed bookings count |
| **DASHBOARD — CUSTOMER** |||||
| Customer Panel | GET | `/api/v1/dashboard/customer/customer/` | JWT | CUSTOMER | Welcome |
| All Orders | GET | `/api/v1/dashboard/customer/total_oder_list/` | JWT | CUSTOMER | All bookings |
| Completed Bookings | GET | `/api/v1/dashboard/customer/completed_booking/` | JWT | CUSTOMER | Completed only |
| Pending Bookings | GET | `/api/v1/dashboard/customer/pending_booking/` | JWT | CUSTOMER | Pending only |
| **PAYMENTS** |||||
| Advance Payment | POST | `/api/v1/payments/payments/advance/initiate/` | JWT | CUSTOMER | Initiate 20% advance |
| Final Payment | POST | `/api/v1/payments/payments/final/initiate/` | JWT | CUSTOMER | Initiate remaining |
| Cash Confirm | POST | `/api/v1/payments/payments/cash/{booking_id}/` | JWT | PROVIDER | Confirm cash receipt |
| Payment Status | GET | `/api/v1/payments/status/{payment_id}/` | JWT | CUSTOMER | Check payment status |
| SSL Success | POST | `/api/v1/payments/success/` | No | SSLCommerz | Callback (backend only) |
| SSL Fail/Cancel | POST | `/api/v1/payments/fail/` | No | SSLCommerz | Callback (backend only) |
| SSL IPN | POST | `/api/v1/payments/ipn/` | No | SSLCommerz | Server notification |
| **REVIEWS** |||||
| Create Review | POST | `/api/v1/review/review/` | JWT | CUSTOMER | Submit review |
| Update Review | PATCH | `/api/v1/review/update_review/{pk}/` | JWT | CUSTOMER | Edit review |
| Delete Review | DELETE | `/api/v1/review/delete_review/{pk}/` | JWT | CUSTOMER | Delete review |
| Get Reviews | GET | `/api/v1/review/get_review/{service_id}/` | JWT | CUSTOMER | Reviews for service |
| Average Rating | GET | `/api/v1/review/get_average_review_rating/{service_id}/` | No | Public | Avg rating |
| **LOCATIONS** |||||
| Division List | GET | `/api/v1/location/divisions/division_list/` | No | Public | All divisions |
| Create Division | POST | `/api/v1/location/divisions/create_division/` | JWT | ADMIN | Create division |
| Update Division | PATCH | `/api/v1/location/divisions/update_division/{pk}/` | JWT | ADMIN | Update division |
| Delete Division | DELETE | `/api/v1/location/divisions/delete_division/{pk}/` | JWT | ADMIN | Delete division |
| District List | GET | `/api/v1/location/districts/district_list/` | No | Public | All districts |
| Create District | POST | `/api/v1/location/districts/create_district/` | JWT | ADMIN | Create district |
| Update District | PATCH | `/api/v1/location/districts/update_district/{pk}/` | JWT | ADMIN | Update district |
| Delete District | DELETE | `/api/v1/location/districts/delete_district/{pk}/` | JWT | ADMIN | Delete district |
| Upazila List | GET | `/api/v1/location/upazilas/upazila_list/` | No | Public | All upazilas |
| Create Upazila | POST | `/api/v1/location/upazilas/create_upazila/` | JWT | ADMIN | Create upazila |
| Update Upazila | PATCH | `/api/v1/location/upazilas/update_upazila/{pk}/` | JWT | ADMIN | Update upazila |
| Delete Upazila | DELETE | `/api/v1/location/upazilas/delete_upazila/{pk}/` | JWT | ADMIN | Delete upazila |

---

## 11. Important Notes & Known Limitations

### ⚠️ Missing Features (Not Implemented in Backend)

| Feature | Status |
|---|---|
| Token Refresh endpoint (`/api/v1/token/refresh/`) | **Not wired** — SimpleJWT installed but not exposed |
| Logout endpoint | **Not implemented** — no view to blacklist tokens |
| Booking cancellation by provider | **Not available** — only customers can cancel |
| `in_progress` booking status | **Defined** in model but not set by any view |
| Payment refund endpoint | **Not implemented** — `refunded` status defined but no view |
| Webhook notification to frontend | **No WebSocket or push notification** system |
| Pagination on many list endpoints | **Missing** on some endpoints (e.g., category list, service by category) |

### ⚠️ Validation Rules Frontend Must Enforce

1. **Role selection on signup:** Only `CUSTOMER` or `SERVICE_PROVIDER`. Submitting `ADMIN` returns a validation error.

2. **Booking time gap:** At least **2 hours** between bookings for the same service. Backend enforces this.

3. **Review rating:** Must be integer between **1 and 5** (inclusive).

4. **Review description:** Max **1000 characters**.

5. **Service description HTML:** Only specific tags allowed. Use a controlled rich text editor.

6. **Quotation services cannot be booked** — backend returns an error. Frontend should disable the Book button for `pricing_type === "quotation"`.

7. **Hourly bookings require `duration`** — if the service is `hourly`, the booking form must collect duration in ISO 8601 format (`PT2H30M`).

### ⚠️ Common Integration Mistakes

1. **Sending JSON for booking/service/profile endpoints instead of FormData** — these views use `MultiPartParser` and will fail silently or return 400 if JSON is sent.

2. **Using the wrong base URL for SSLCommerz callbacks** — do NOT redirect users to `/payments/success/` yourself. Only SSLCommerz calls this endpoint.

3. **Storing payment_id before redirect** — save `payment_id` in localStorage before redirecting to `gateway_url`, so you can call the status API after coming back.

4. **Using the wrong ID type:** Services use **UUID**; Profiles use **integer**; Reviews use **integer**; Locations use **integer**. Do not mix them up.

5. **Calling `/api/v1/review/get_review/{service_id}/` as a public endpoint** — it requires JWT + CUSTOMER role. Only authenticated customers can list reviews.

6. **Service provider cannot login immediately after registration** — `token` is `null` on registration. Wait for admin approval.

7. **Calling complete_booking before scheduled time** — the backend rejects it. Frontend should ideally hide or disable the button before the scheduled `booking_date + booking_time`.

### ⚠️ CORS Configuration

Allowed origins in production:
- `http://localhost:5173` (Vite dev)
- `http://localhost:3000` (CRA dev)
- `https://local-service-finder-seven.vercel.app` (Production frontend)

If you deploy to a different domain, you must update the backend `CORS_ALLOWED_ORIGINS` setting.

### ⚠️ SSLCommerz Environment

Currently configured as **sandbox/test mode** (`SSLCOMMERZ_IS_SANDBOX=True`). For real payments, the backend needs production store credentials and `SSLCOMMERZ_IS_SANDBOX=False`.

### ⚠️ Image URLs

All images are served via **Cloudinary**. The image field in responses is a full Cloudinary URL (`https://res.cloudinary.com/...`). Do not prepend the backend base URL to image paths.

---

*Documentation generated from source code analysis of Local Service Finder System — Django REST Framework backend.*  
*All endpoints verified against actual URL configurations, views, serializers, and models.*
