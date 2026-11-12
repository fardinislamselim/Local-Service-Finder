# Local Service Finder — Frontend API Integration Guide

> এই গাইডটি `Local_Service_Finder_API.postman_collection.json` থেকে তৈরি। এতে Postman collection-এ থাকা endpoint, method, request fields এবং frontend integration notes সাজানো হয়েছে।

## 1. Configuration

- **Base URL:** `http://127.0.0.1:8000/api/v1`
- **API prefix:** `/api/v1`
- **Backend:** Django REST Framework (collection description অনুযায়ী)
- **Authentication:** JWT Bearer token

`.env.local` উদাহরণ:
```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Production-এ production API URL ব্যবহার করুন; localhost URL production build-এ রাখবেন না।

## 2. Authentication

### Login flow
1. `POST /accounts/signin/`-এ email ও password পাঠান।
2. Collection login response থেকে `access_token` এবং `refresh_token` পায়।
3. Protected request-এ পাঠান: `Authorization: Bearer <access_token>`।
4. Logout: `POST /accounts/signout/`-এ `{ "refresh": "<refresh_token>" }` পাঠান।

### Signup roles
- `CUSTOMER`
- `SERVICE_PROVIDER`
- `ADMIN`

Service provider account-এর জন্য admin approval প্রয়োজন বলে collection-এ উল্লেখ আছে।

**সতর্কতা:** এই collection-এ refresh-token endpoint নেই। Token expiry, refresh/rotation contract এবং token storage strategy backend team-এর কাছ থেকে নিশ্চিত করুন।

## 3. Endpoint Reference

সব URL `BASE_URL` দিয়ে শুরু হবে। `:id` placeholder-এ বাস্তব ID বসাতে হবে। `Protected` endpoint-এ Bearer access token প্রয়োজন।

### 1. Authentication & Accounts

#### User Signup

- **Method:** `POST`
- **URL:** `BASE_URL/accounts/signup/`
- **Auth:** Public / auth inherited
- **Purpose:** User registration. Roles: `CUSTOMER`, `SERVICE_PROVIDER`, or `ADMIN`. Service providers need admin approval.

**Body (`application/json`):**
```json
{
  "first_name": "Salim",
  "last_name": "Raza",
  "email": "customer@example.com",
  "password": "Password123@",
  "role": "CUSTOMER"
}
```

#### User Signin (Login)

- **Method:** `POST`
- **URL:** `BASE_URL/accounts/signin/`
- **Auth:** Public / auth inherited
- **Purpose:** Authenticate user and get JWT access & refresh tokens. Automatically sets `access_token` and `refresh_token` variables.

**Body (`application/json`):**
```json
{
  "email": "customer@example.com",
  "password": "Password123@"
}
```

#### Change Password

- **Method:** `POST`
- **URL:** `BASE_URL/accounts/change_password/`
- **Auth:** Protected — Bearer token
- **Purpose:** Change password for the currently logged in user.

**Body (`application/json`):**
```json
{
  "old_password": "Password123@",
  "new_password": "NewPassword123@"
}
```

#### Send OTP (Forgot Password)

- **Method:** `POST`
- **URL:** `BASE_URL/accounts/send_otp/`
- **Auth:** Public / auth inherited
- **Purpose:** Send a 6-digit OTP to the registered email address for password reset.

**Body (`application/json`):**
```json
{
  "email": "customer@example.com"
}
```

#### Reset Password with OTP

- **Method:** `POST`
- **URL:** `BASE_URL/accounts/reset_password/`
- **Auth:** Public / auth inherited
- **Purpose:** Reset password using OTP received via email.

**Body (`application/json`):**
```json
{
  "email": "customer@example.com",
  "otp": "123456",
  "new_password": "NewPassword123@"
}
```

#### Signout (Logout)

- **Method:** `POST`
- **URL:** `BASE_URL/accounts/signout/`
- **Auth:** Protected — Bearer token
- **Purpose:** Logout and blacklist the refresh token.

**Body (`application/json`):**
```json
{
  "refresh": "{{refresh_token}}"
}
```

### 2. Categories

#### Get All Categories

- **Method:** `GET`
- **URL:** `BASE_URL/categories/all_category/`
- **Auth:** Public / auth inherited
- **Purpose:** Retrieve list of all service categories.

#### Create Category (Admin)

- **Method:** `POST`
- **URL:** `BASE_URL/categories/create_category/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin endpoint to create a new category.

**Body (`application/json`):**
```json
{
  "name": "Home Appliance Repair"
}
```

#### Update Category (Admin)

- **Method:** `PATCH`
- **URL:** `BASE_URL/categories/category_modify/:category_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin endpoint to update category by ID.

**Body (`application/json`):**
```json
{
  "name": "Home & Kitchen Appliance Repair"
}
```

#### Delete Category (Admin)

- **Method:** `DELETE`
- **URL:** `BASE_URL/categories/category_modify/:category_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin endpoint to delete a category by ID.

#### Search Categories

- **Method:** `GET`
- **URL:** `BASE_URL/categories/category_search/?search=Appliance`
- **Auth:** Public / auth inherited
- **Purpose:** Search categories by name.

**Query parameters:**
- `search`: `Appliance` — Category search keyword

### 3. Services

#### Get All Services (Public)

- **Method:** `GET`
- **URL:** `BASE_URL/service/all_service/`
- **Auth:** Public / auth inherited
- **Purpose:** Fetch all available services across all providers.

#### Get Provider Services (My Services)

- **Method:** `GET`
- **URL:** `BASE_URL/service/services/`
- **Auth:** Protected — Bearer token
- **Purpose:** Fetch all services created by the authenticated service provider.

#### Create Service (Service Provider)

- **Method:** `POST`
- **URL:** `BASE_URL/service/services/`
- **Auth:** Protected — Bearer token
- **Purpose:** Create a new service offering (Multipart/form-data with image).

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `name` | `text` | Air Conditioner Master Cleaning — Service Title |
| `category` | `text` | {{category_id}} — Category ID |
| `description` | `text` | Complete indoor and outdoor master cleaning with chemical wash. — Description |
| `pricing_type` | `text` | FIXED — FIXED or HOURLY |
| `base_price` | `text` | 1200.00 — Base price for fixed pricing |
| `hour_base_price` | `text` | 0.00 — Hourly price if HOURLY |
| `is_active` | `text` | true — Status |
| `image` | `file` | File upload |

#### Update Service (Admin / Provider)

- **Method:** `PATCH`
- **URL:** `BASE_URL/service/service_modify/:service_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Update service details by ID.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `name` | `text` | Air Conditioner Deep Master Cleaning — Updated Service Title |
| `description` | `text` | Updated service description with warranty. — Description |
| `hour_base_price` | `text` | 1500.00 — Updated price |
| `image` | `file` | File upload |

#### Delete Service (Admin / Provider)

- **Method:** `DELETE`
- **URL:** `BASE_URL/service/service_modify/:service_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Delete service by ID.

#### Search Services by Location & Query

- **Method:** `GET`
- **URL:** `BASE_URL/service/search_service/?search=AC&area=Dhanmondi&upazila=Dhanmondi`
- **Auth:** Public / auth inherited
- **Purpose:** Search services by query with mandatory location filters (upazila, area).

**Query parameters:**
- `search`: `AC` — Search query (name, description, or category)
- `area`: `Dhanmondi` — Provider area
- `upazila`: `Dhanmondi` — Provider upazila

### 4. Profiles

#### Get All Profiles (Public)

- **Method:** `GET`
- **URL:** `BASE_URL/profiles/get_all_profile/`
- **Auth:** Public / auth inherited
- **Purpose:** Paginated list of all user profiles.

#### Get My Profile

- **Method:** `GET`
- **URL:** `BASE_URL/profiles/get_profile/`
- **Auth:** Protected — Bearer token
- **Purpose:** Get currently authenticated user's profile.

#### Get Profile by ID (Public)

- **Method:** `GET`
- **URL:** `BASE_URL/profiles/get_user_profile/:user_id/`
- **Auth:** Public / auth inherited
- **Purpose:** Get profile details of a specific user ID.

#### Update My Profile

- **Method:** `PATCH`
- **URL:** `BASE_URL/profiles/modify_profile/`
- **Auth:** Protected — Bearer token
- **Purpose:** Update profile information of the authenticated user.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `gender` | `text` | Male — Male / Female / Other |
| `phone` | `text` | +8801700000000 — Contact phone number |
| `city` | `text` | Dhaka — City |
| `area` | `text` | Dhanmondi — Area |
| `bio` | `text` | Experienced electrical technician with 5+ years experience. — Bio description |
| `experience` | `text` | 5 — Years of experience |
| `image` | `file` | File upload |

#### Delete My Profile

- **Method:** `DELETE`
- **URL:** `BASE_URL/profiles/modify_profile/`
- **Auth:** Protected — Bearer token
- **Purpose:** Delete the authenticated user's profile.

#### Search Profiles

- **Method:** `GET`
- **URL:** `BASE_URL/profiles/search/?search=Salim`
- **Auth:** Public / auth inherited
- **Purpose:** Search user profiles by name, city, or area.

**Query parameters:**
- `search`: `Salim` — Search by user name, city, or area

### 5. Bookings

#### Book a Service (Customer)

- **Method:** `POST`
- **URL:** `BASE_URL/booking/service_book/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer books a service. Automatically calculates 20% advance amount.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `service` | `text` | {{service_id}} — Service ID to book |
| `booking_date` | `text` | 2026-11-20 — Booking Date (YYYY-MM-DD) |
| `booking_time` | `text` | 14:30 — Booking Time (HH:MM) |
| `final_payment_method` | `text` | ONLINE — ONLINE or CASH |
| `note` | `text` | Please bring ladder and chemical cleaning liquid. — Special instructions |

#### Get My Bookings (Customer)

- **Method:** `GET`
- **URL:** `BASE_URL/booking/my_bookings/`
- **Auth:** Protected — Bearer token
- **Purpose:** List all bookings made by the current customer, including payment status and amounts.

#### Get All Bookings (Service Provider)

- **Method:** `GET`
- **URL:** `BASE_URL/booking/get_all_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** List all customer bookings for services provided by the authenticated provider.

#### Update Booking (Customer)

- **Method:** `PATCH`
- **URL:** `BASE_URL/booking/booking_update/:booking_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer updates a pending booking date/time/note.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `booking_date` | `text` | 2026-11-22 — Rescheduled Date |
| `booking_time` | `text` | 16:00 — Rescheduled Time |
| `note` | `text` | Updated note: please arrive before 4:30 PM. — Updated note |

#### Cancel Booking (Customer)

- **Method:** `POST`
- **URL:** `BASE_URL/booking/cancel_booking/:booking_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Cancel a pending booking.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `cancellation_reason` | `text` | Scheduling conflict / plans changed — Reason for cancellation |

### 6. Reviews & Ratings

#### Create Review & Rating (Customer)

- **Method:** `POST`
- **URL:** `BASE_URL/review/review/?booking_id=:booking_id&service_id=:service_id`
- **Auth:** Protected — Bearer token
- **Purpose:** Submit a review and rating for a COMPLETED booking.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `rating` | `text` | 5 — Rating score (1 to 5) |
| `review` | `text` | Excellent service! Very professional and on-time. — Review text |

**Query parameters:**
- `booking_id`: `{{booking_id}}` — Completed booking ID
- `service_id`: `{{service_id}}` — Service ID

#### Update Review & Rating (Customer)

- **Method:** `PATCH`
- **URL:** `BASE_URL/review/update_review/:review_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer updates their own review.

**Body (`multipart/form-data`):**

| Field | Type | Example / meaning |
|---|---|---|
| `rating` | `text` | 4 — Updated rating |
| `review` | `text` | Overall great service, but arrived 10 minutes late. — Updated review |

#### Delete Review & Rating (Customer)

- **Method:** `DELETE`
- **URL:** `BASE_URL/review/delete_review/:review_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer deletes their own review.

#### Get Reviews for a Service

- **Method:** `GET`
- **URL:** `BASE_URL/review/get_review/:service_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Fetch all customer reviews for a given service ID.

#### Get Average Rating for a Service

- **Method:** `GET`
- **URL:** `BASE_URL/review/get_average_review_rating/:service_id/`
- **Auth:** Public / auth inherited
- **Purpose:** Public endpoint to calculate and get average rating score for a service.

### 7. Dashboard

#### Admin Dashboard / Admin Dashboard Welcome

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/admin/admin/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin overview endpoint.

#### Admin Dashboard / Activate Pending Account (Admin)

- **Method:** `PATCH`
- **URL:** `BASE_URL/dashboard/admin/account_activate/:user_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Approve and activate a pending service provider account.

#### Admin Dashboard / Get Pending Accounts List (Admin)

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/admin/pending_account/`
- **Auth:** Protected — Bearer token
- **Purpose:** List all unapproved/pending service provider accounts.

#### Admin Dashboard / Total Active Account Count (Admin)

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/admin/total_activate_account_count/`
- **Auth:** Protected — Bearer token
- **Purpose:** Count of all active approved accounts.

#### Admin Dashboard / Total Pending Account Count (Admin)

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/admin/total_activate_pending_count/`
- **Auth:** Protected — Bearer token
- **Purpose:** Count of all pending provider accounts awaiting approval.

#### Customer Dashboard / Customer Dashboard Welcome

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/customer/customer/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer dashboard overview.

#### Customer Dashboard / Total Order List

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/customer/total_oder_list/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer's total order list.

#### Customer Dashboard / Completed Bookings List

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/customer/completed_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** All completed bookings of the customer.

#### Customer Dashboard / Pending Bookings List

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/customer/pending_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** All pending bookings of the customer.

#### Service Provider Dashboard / Provider Dashboard Welcome

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/service_provider/service_provide/`
- **Auth:** Protected — Bearer token
- **Purpose:** Service provider dashboard overview.

#### Service Provider Dashboard / Get Pending Bookings

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/service_provider/get_pending_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** Bookings waiting for provider's acceptance.

#### Service Provider Dashboard / Get Accepted Bookings

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/service_provider/get_accept_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** Bookings accepted by provider, ready for advance payment / service execution.

#### Service Provider Dashboard / Accept Booking

- **Method:** `POST`
- **URL:** `BASE_URL/dashboard/service_provider/accept_booking/:booking_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Provider accepts a customer booking. Notifies customer via email to pay 20% advance.

#### Service Provider Dashboard / Reject Booking

- **Method:** `POST`
- **URL:** `BASE_URL/dashboard/service_provider/reject_booking/:booking_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Provider rejects a booking.

#### Service Provider Dashboard / Complete Booking

- **Method:** `POST`
- **URL:** `BASE_URL/dashboard/service_provider/complete_booking/:booking_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Provider marks service as completed. Enables final payment.

#### Service Provider Dashboard / Total Accepted Booking Count

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/service_provider/total_accept_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** Total count of accepted bookings.

#### Service Provider Dashboard / Total Completed Booking Count

- **Method:** `GET`
- **URL:** `BASE_URL/dashboard/service_provider/total_completed_booking/`
- **Auth:** Protected — Bearer token
- **Purpose:** Total count of completed bookings.

### 8. Locations

#### Divisions / Get Division List

- **Method:** `GET`
- **URL:** `BASE_URL/location/divisions/division_list/`
- **Auth:** Public / auth inherited
- **Purpose:** List all divisions.

#### Divisions / Create Division (Admin)

- **Method:** `POST`
- **URL:** `BASE_URL/location/divisions/create_division/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin creates a division.

**Body (`application/json`):**
```json
{
  "name": "Dhaka"
}
```

#### Divisions / Update Division (Admin)

- **Method:** `PATCH`
- **URL:** `BASE_URL/location/divisions/update_division/:division_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin updates a division.

**Body (`application/json`):**
```json
{
  "name": "Dhaka Division"
}
```

#### Divisions / Delete Division (Admin)

- **Method:** `DELETE`
- **URL:** `BASE_URL/location/divisions/delete_division/:division_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin deletes a division.

#### Districts / Get District List

- **Method:** `GET`
- **URL:** `BASE_URL/location/districts/district_list/`
- **Auth:** Public / auth inherited
- **Purpose:** List all districts.

#### Districts / Create District (Admin)

- **Method:** `POST`
- **URL:** `BASE_URL/location/districts/create_district/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin creates a district.

**Body (`application/json`):**
```json
{
  "name": "Dhaka",
  "division": "{{division_id}}"
}
```

#### Districts / Update District (Admin)

- **Method:** `PATCH`
- **URL:** `BASE_URL/location/districts/update_district/:district_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin updates a district.

**Body (`application/json`):**
```json
{
  "name": "Dhaka Metro",
  "division": "{{division_id}}"
}
```

#### Districts / Delete District (Admin)

- **Method:** `DELETE`
- **URL:** `BASE_URL/location/districts/delete_district/:district_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin deletes a district.

#### Upazilas / Get Upazila List

- **Method:** `GET`
- **URL:** `BASE_URL/location/upazilas/upazila_list/`
- **Auth:** Public / auth inherited
- **Purpose:** List all upazilas/thanas.

#### Upazilas / Create Upazila (Admin)

- **Method:** `POST`
- **URL:** `BASE_URL/location/upazilas/create_upazila/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin creates an upazila.

**Body (`application/json`):**
```json
{
  "name": "Dhanmondi",
  "district": "{{district_id}}"
}
```

#### Upazilas / Update Upazila (Admin)

- **Method:** `PATCH`
- **URL:** `BASE_URL/location/upazilas/update_upazila/:upazila_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin updates an upazila.

**Body (`application/json`):**
```json
{
  "name": "Dhanmondi Thana",
  "district": "{{district_id}}"
}
```

#### Upazilas / Delete Upazila (Admin)

- **Method:** `DELETE`
- **URL:** `BASE_URL/location/upazilas/delete_upazila/:upazila_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Admin deletes an upazila.

### 9. Payments

#### Initiate Advance Payment (20%) [Customer]

- **Method:** `POST`
- **URL:** `BASE_URL/payments/payments/advance/initiate/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer initiates SSLCommerz gateway session for 20% advance payment after provider accepts the booking.

**Body (`application/json`):**
```json
{
  "booking_id": "{{booking_id}}"
}
```

#### Initiate Final Payment (Online) [Customer]

- **Method:** `POST`
- **URL:** `BASE_URL/payments/payments/final/initiate/`
- **Auth:** Protected — Bearer token
- **Purpose:** Customer pays remaining balance online after service completion.

**Body (`application/json`):**
```json
{
  "booking_id": "{{booking_id}}"
}
```

#### Confirm Cash Payment [Service Provider]

- **Method:** `POST`
- **URL:** `BASE_URL/payments/payments/cash/:booking_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Service provider confirms cash payment received directly from customer after completion.

#### Check Payment Status

- **Method:** `GET`
- **URL:** `BASE_URL/payments/status/:payment_id/`
- **Auth:** Protected — Bearer token
- **Purpose:** Check real-time payment status by payment ID.

#### SSLCommerz Payment Success Callback

- **Method:** `POST`
- **URL:** `BASE_URL/payments/success/`
- **Auth:** Public / auth inherited
- **Purpose:** SSLCommerz success redirect callback that validates and marks payment as SUCCESS.

**Body (`application/x-www-form-urlencoded`):**

| Field | Example |
|---|---|
| `tran_id` | `TRAN-XXXXXXXX` |
| `val_id` | `VAL-XXXXXXXX` |

#### SSLCommerz IPN (Webhook)

- **Method:** `POST`
- **URL:** `BASE_URL/payments/ipn/`
- **Auth:** Public / auth inherited
- **Purpose:** Instant Payment Notification (IPN) webhook called by SSLCommerz.

**Body (`application/x-www-form-urlencoded`):**

| Field | Example |
|---|---|
| `tran_id` | `TRAN-XXXXXXXX` |
| `val_id` | `VAL-XXXXXXXX` |
| `verify_sign` | `SIGNATURE` |

#### SSLCommerz Payment Fail Callback

- **Method:** `POST`
- **URL:** `BASE_URL/payments/fail/`
- **Auth:** Public / auth inherited
- **Purpose:** SSLCommerz failure callback that marks payment as FAILED.

**Body (`application/x-www-form-urlencoded`):**

| Field | Example |
|---|---|
| `tran_id` | `TRAN-XXXXXXXX` |

#### SSLCommerz Payment Cancel Callback

- **Method:** `POST`
- **URL:** `BASE_URL/payments/cancel/`
- **Auth:** Public / auth inherited
- **Purpose:** SSLCommerz cancel callback that marks payment as CANCELLED.

**Body (`application/x-www-form-urlencoded`):**

| Field | Example |
|---|---|
| `tran_id` | `TRAN-XXXXXXXX` |

## 4. Frontend Feature Mapping

| Frontend feature | API endpoints |
|---|---|
| Signup / Login / Forgot password | `accounts/signup`, `accounts/signin`, `accounts/send_otp`, `accounts/reset_password` |
| Change password / Logout | `accounts/change_password`, `accounts/signout` |
| Categories | `categories/all_category`, `categories/category_search` |
| Public service listing & search | `service/all_service`, `service/search_service` |
| Provider service management | `service/services` (GET/POST), `service/service_modify/:service_id` (PATCH/DELETE) |
| Public profiles | `profiles/get_all_profile`, `profiles/get_user_profile/:user_id`, `profiles/search` |
| My profile | `profiles/get_profile`, `profiles/modify_profile` (PATCH/DELETE) |
| Customer bookings | `booking/service_book`, `booking/my_bookings`, `booking/booking_update/:booking_id`, `booking/cancel_booking/:booking_id` |
| Provider booking management | `booking/get_all_booking` and provider dashboard booking endpoints |
| Reviews & ratings | `review/review`, `review/update_review/:review_id`, `review/delete_review/:review_id`, `review/get_review/:service_id`, `review/get_average_review_rating/:service_id` |
| Admin dashboard | `dashboard/admin/*` |
| Customer dashboard | `dashboard/customer/*` |
| Provider dashboard | `dashboard/service_provider/*` |
| Location dropdowns | division, district, upazila list endpoints |
| Admin location management | create/update/delete division, district, upazila endpoints |
| Payments | advance/final initiate, cash confirmation, payment status endpoints |

## 5. Suggested API Client Structure

```text
src/
  lib/api-client.ts
  services/
    auth.api.ts
    category.api.ts
    service.api.ts
    profile.api.ts
    booking.api.ts
    review.api.ts
    dashboard.api.ts
    location.api.ts
    payment.api.ts
  types/api.types.ts
```

Axios instance-এর উদাহরণ:
```ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = /* read access token from your auth strategy */;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

File upload request-এ `FormData` ব্যবহার করুন। Browser/Axios-কে multipart boundary সেট করতে দিন; manually multipart `Content-Type` বসানোর প্রয়োজন নেই।

## 6. Important Integration Rules

- Service provider signup-এর পর admin approval প্রয়োজন হতে পারে।
- Service create/update এবং profile update-এ file upload আছে; `FormData` ব্যবহার করুন।
- Service `pricing_type`: `FIXED` অথবা `HOURLY`; collection-এ `base_price` ও `hour_base_price` field আছে।
- Service search-এ `search`, `area`, `upazila` query parameter আছে। Collection description অনুযায়ী `area` ও `upazila` location filters গুরুত্বপূর্ণ/mandatory।
- Booking date format: `YYYY-MM-DD`; time format: `HH:MM`।
- `final_payment_method`: `ONLINE` অথবা `CASH`।
- Booking create endpoint description অনুযায়ী ২০% advance amount calculate করে।
- Booking update endpoint pending booking-এর date/time/note update করে; cancel endpoint pending booking cancel করে।
- Review submit করতে booking `COMPLETED` হতে হবে; rating range 1–5।
- Provider accept করলে customer-কে ২০% advance payment-এর email notification পাঠানো হয় বলে collection-এ উল্লেখ আছে।
- Provider complete করলে final payment enable হয়।
- Location hierarchy: Division → District → Upazila। District-এর body-তে `division`, Upazila-এর body-তে `district` পাঠাতে হয়।
- SSLCommerz success/fail/cancel/IPN endpoint gateway callback হিসেবে বিবেচনা করুন; এগুলো সাধারণ UI data-fetch endpoint নয়।

## 7. Backend Team-এর কাছ থেকে Confirm করতে হবে

Postman collection-এ response example/schema দেওয়া নেই। তাই নিচের বিষয়গুলো অনুমান না করে backend team-এর কাছ থেকে নিশ্চিত করুন:

1. Success/error response envelope এবং প্রত্যেক endpoint-এর response fields।
2. List pagination format, page/limit parameters, sorting/filtering support।
3. Login response-এ user object, role, profile status এবং provider approval status-এর field names।
4. Access token expiry, refresh endpoint/rotation এবং refresh response contract।
5. Validation error structure এবং HTTP status code conventions।
6. Service search-এ `area` ও `upazila` সত্যিই mandatory কি না।
7. Reviews endpoint `get_review/:service_id/` collection-এ Bearer-protected; public service details-এ reviews দেখানোর জন্য public access দরকার কি না।
8. Payment initiate response-এ SSLCommerz redirect URL কোন property-তে আসে এবং frontend কীভাবে redirect করবে।
9. Payment status values ও advance/final payment state transitions।
10. Callback URL configuration এবং IPN signature verification backend-এ কীভাবে হচ্ছে।
11. Profile fields-এর customer/provider-specific required rules।
12. Delete operation hard delete নাকি soft delete এবং response shape কী।
13. Production API URL, CORS allowed origins এবং media/image URL format।

## 8. Recommended Integration Order

1. Environment config + shared API client
2. Signup/login/logout + auth state + protected routes
3. Categories + division/district/upazila selectors
4. Public services + search + service details
5. Public provider profiles + profile details
6. My profile read/update
7. Customer booking create/list/update/cancel
8. Provider service CRUD + booking actions
9. Reviews and ratings
10. Role-based dashboards
11. Advance/final/cash payment integration + status handling

## 9. Postman Variables

| Variable | Purpose |
|---|---|
| `base_url` | Default API base URL |
| `access_token` | Login access token |
| `refresh_token` | Login refresh token |
| `category_id` | Category ID placeholder |
| `service_id` | Service ID placeholder |
| `booking_id` | Booking ID placeholder |
| `review_id` | Review ID placeholder |
| `division_id` | Division ID placeholder |
| `district_id` | District ID placeholder |
| `upazila_id` | Upazila ID placeholder |
| `user_id` | User ID placeholder |
| `payment_id` | Payment ID placeholder |

## 10. Integration Checklist

- [ ] Configure correct API base URL.
- [ ] Verify CORS from frontend origin.
- [ ] Build centralized API client and error handling.
- [ ] Attach Bearer token only where required.
- [ ] Handle 401/403 and expired sessions safely.
- [ ] Use `FormData` for multipart endpoints.
- [ ] Add loading, empty, success and error UI states.
- [ ] Validate forms on frontend and handle backend validation errors.
- [ ] Confirm response schemas before writing strict TypeScript interfaces.
- [ ] Test all role-based flows with separate CUSTOMER, SERVICE_PROVIDER and ADMIN accounts.

---

**Source:** `Local_Service_Finder_API.postman_collection.json` (Postman Collection v2.1).
