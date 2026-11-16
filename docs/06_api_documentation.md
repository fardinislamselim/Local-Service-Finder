# 📖 Comprehensive API Reference

> **Document ID:** `DOC-06-API`  
> **System Version:** 1.0.0  
> **Base URL:** `http://127.0.0.1:8000/api/v1/` (Production: `https://<your-domain>/api/v1/`)  
> **Interactive Docs:**  
> - Swagger UI: `/swagger/`  
> - ReDoc: `/redoc/`

---

## 1. Authentication & Headers

Unless an endpoint is marked **Public** (`AllowAny`), all requests must include a valid JWT access token:

```http
Authorization: Bearer <YOUR_ACCESS_TOKEN>
Content-Type: application/json
```

For endpoints that accept media files (e.g., service creation or profile picture upload), use:
```http
Content-Type: multipart/form-data
```

---

## 2. Accounts & Authentication (`/api/v1/accounts/`)

### 2.1 User Signup
- **Endpoint:** `POST /api/v1/accounts/signup/`
- **Access:** Public (`AllowAny`)
- **Request Body:**
  ```json
  {
    "first_name": "Salim",
    "last_name": "Raza",
    "email": "salim@example.com",
    "password": "StrongPassword123!",
    "role": "CUSTOMER",
    "division": 1,
    "district": 1,
    "upazila": 1,
    "area": "Block C"
  }
  ```
  *(Note: `role` can be `CUSTOMER` or `SERVICE_PROVIDER`. If `SERVICE_PROVIDER`, account is created with `is_approved=false` and returns no token until approved by Admin. Attempting to register as `ADMIN` is rejected with `400 Bad Request: {"role": ["You cannot register as admin."]}`).*
- **Responses:**
  - `201 Created`:
    ```json
    {
      "message": "signup successfully",
      "user": { "id": 10, "email": "salim@example.com", "role": "CUSTOMER" },
      "token": { "refresh": "...", "access": "..." }
    }
    ```
  - `400 Bad Request`: Validation errors (e.g., email already exists).

### 2.2 User Signin
- **Endpoint:** `POST /api/v1/accounts/signin/`
- **Access:** Public (`AllowAny`)
- **Request Body:**
  ```json
  {
    "email": "salim@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Responses:**
  - `200 OK`:
    ```json
    {
      "message": "Login Successfully .",
      "access_token": "eyJhbGciOi...",
      "refresh_token": "eyJhbGciOi..."
    }
    ```
  - `401 Unauthorized`: Invalid credentials.

### 2.3 User Signout (Token Blacklist)
- **Endpoint:** `POST /api/v1/accounts/signout/`
- **Access:** Authenticated (`IsAuthenticated`)
- **Request Body:**
  ```json
  {
    "refresh": "eyJhbGciOi..."
  }
  ```
- **Responses:**
  - `205 Reset Content`: `{"message": "Logout successful"}`
  - `400 Bad Request`: Missing refresh token.

### 2.4 Change Password
- **Endpoint:** `POST /api/v1/accounts/change_password/`
- **Access:** Authenticated (`IsAuthenticated`)
- **Request Body:**
  ```json
  {
    "old_password": "OldPassword123!",
    "new_password": "NewStrongPassword456!"
  }
  ```
- **Responses:**
  - `200 OK`: `{"message": "Change password successful."}`
  - `400 Bad Request`: Incorrect old password.

### 2.5 Request Password Reset OTP
- **Endpoint:** `POST /api/v1/accounts/send_otp/`
- **Access:** Public (`AllowAny`)
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Responses:**
  - `201 Created`: `{"status": "success", "message": "OTP Send Successfully to Your Gmail"}`
  - `400 Bad Request`: Email not registered.

### 2.6 Reset Password with OTP
- **Endpoint:** `POST /api/v1/accounts/reset_password/`
- **Access:** Public (`AllowAny`)
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "otp": "4521",
    "new_password": "BrandNewPassword789!"
  }
  ```
- **Responses:**
  - `200 OK`: `{"status": "success", "message": "password reset successful"}`
  - `400 Bad Request`: OTP expired or invalid.

---

## 3. Profiles Subsystem (`/api/v1/profiles/`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/profiles/get_all_profile/` | Public | Paginated list of user profiles (returns `{ "profile": [...] }` or array). |
| `GET` | `/api/v1/profiles/get_profile/` | Authenticated | Fetch authenticated caller's profile (returns `{ "profile": {...} }`). |
| `GET` | `/api/v1/profiles/get_user_profile/<int:id>/` | Public | Fetch specific profile by Profile ID. |
| `PATCH` | `/api/v1/profiles/modify_profile/` | Authenticated | Update bio, phone, coordinates, or photo (returns `{ "message": "...", "profile": {...} }`). |
| `DELETE` | `/api/v1/profiles/modify_profile/` | Authenticated | Delete profile instance (`204 No Content`). |
| `GET` | `/api/v1/profiles/search/?search=<query>` | Public | Search profiles across name, city, and area. |

### Validation & Field Constraints
- **`gender`**: Strictly uppercase choices: `MALE`, `FEMALE`, `OTHER`. Lowercase or title case (e.g. `Male`) is rejected with `{"gender": ["\"Male\" is not a valid choice."]}`.
- **`phone`**: Maximum length 15 characters (e.g. `+8801700000000`). Internal whitespace must be stripped. Exceeding 15 characters returns `phone: Ensure this field has no more than 15 characters.`.
- **`experience`**: Integer years of experience.
- **Media Upload**: Use `multipart/form-data` with key `image` for avatar uploads to Cloudinary.

---

## 4. Location Hierarchy Subsystem (`/api/v1/location/`)

### 4.1 Divisions (`/api/v1/location/divisions/`)
- `GET division_list/`: Public list of all Divisions.
- `POST create_division/`: `IsAdmin`. Body: `{"name": "Dhaka"}`.
- `PATCH update_division/<pk>/`: `IsAdmin`. Partial update.
- `DELETE delete_division/<pk>/`: `IsAdmin`. Delete Division.

### 4.2 Districts (`/api/v1/location/districts/`)
- `GET district_list/`: Public list of all Districts.
- `POST create_district/`: `IsAdmin`. Body: `{"name": "Gazipur", "division": 1}`.
- `PATCH update_district/<pk>/`: `IsAdmin`. Partial update.
- `DELETE delete_district/<pk>/`: `IsAdmin`. Delete District.

### 4.3 Upazilas (`/api/v1/location/upazilas/`)
- `GET upazila_list/`: Public list of all Upazilas.
- `POST create_upazila/`: `IsAdmin`. Body: `{"name": "Mirpur", "district": 1}`.
- `PATCH update_upazila/<pk>/`: `IsAdmin`. Partial update.
- `DELETE delete_upazila/<pk>/`: `IsAdmin`. Delete Upazila.

---

## 5. Categories & Services Subsystem

### 5.1 Categories (`/api/v1/categories/`)
- `GET /api/v1/categories/all_category/`: Public list of all categories.
- `POST /api/v1/categories/create_category/`: `IsAdmin`. Body: `{"name": "Electrician"}`.
- `PATCH / DELETE /api/v1/categories/category_modify/<int:id>/`: `IsAdmin`. Update or delete category.
- `GET /api/v1/categories/category_search/?search=<term>`: Public search.

### 5.2 Services (`/api/v1/service/`)
- `GET /api/v1/service/all_service/`: Public paginated catalog. Returns `{ "meta": { "page": 1, "limit": 12, "total": 27, "total_pages": 3, "next": "...", "previous": null }, "results": [...] }`.
- `GET /api/v1/service/services/`: Provider only. Retrieves services owned by caller.
- `POST /api/v1/service/services/`: Provider only (`MultiPartParser`).
  - **Form Fields:** `name`, `category`, `pricing_type` (`fixed`, `hourly`, `quotation`), `base_price`, `hour_base_price`, `description`, `image` (file).
- `PATCH / DELETE /api/v1/service/service_modify/<int:id>/`: Provider (self-owned) or Admin.
- `GET /api/v1/service/search_service/`:
  - **Query Parameters:** `search`, `area` (optional), `upazila` (optional). Returns `{ "meta": {...}, "results": [...] }`.
  - Searches active services offered by providers matching the specified query, upazila, and area.

---

## 6. Booking Subsystem (`/api/v1/booking/`)

### 6.1 Create Booking
- **Endpoint:** `POST /api/v1/booking/service_book/`
- **Access:** Customer (`IsCustomer`)
- **Parsers:** `MultiPartParser`, `FormParser`
- **Form Data Fields:**
  - `service`: Integer ID of the target Service.
  - `booking_date`: Date string (`YYYY-MM-DD`).
  - `booking_time`: Time string (`HH:MM`).
  - `final_payment_method`: Strictly lowercase choice: `online` or `cash`. Uppercase `ONLINE` or `CASH` returns HTTP 400.
  - `note`: (Optional) Special client instructions.
- **Responses:**
  - `201 Created`:
    ```json
    {
      "message": "Service booking successful.",
      "data": {
        "id": 42,
        "service": 5,
        "price_at_booking": "1500.00",
        "advance_amount": "300.00",
        "paid_amount": "0.00",
        "status": "pending",
        "payment_status": "unpaid",
        "final_payment_method": "online"
      }
    }
    ```
  - `400 Bad Request`: Service inactive or pricing type is hourly/quotation.

### 6.2 Update / Cancel Booking
- `PATCH /api/v1/booking/booking_update/<int:pk>/`: Customer only. Can only update date, time, or note while booking is in `pending` status.
- `POST /api/v1/booking/cancel_booking/<int:pk>/`: Customer only. Cancels a `pending` booking. Request body can include `{"cancellation_reason": "string"}`.

### 6.3 Query Bookings
- `GET /api/v1/booking/my_bookings/`: Customer views all self-booked reservations.
- `GET /api/v1/booking/get_all_booking/`: Provider views all bookings booked against their services.

---

## 7. Payments Subsystem (`/api/v1/payments/`)

### 7.1 Initiate 20% Advance Payment
- **Endpoint:** `POST /api/v1/payments/payments/advance/initiate/`
- **Access:** Customer (`IsCustomer`)
- **Preconditions:** `booking.status == "accepted"` AND `booking.paid_amount == 0`.
- **Request Body:**
  ```json
  {
    "booking_id": 42
  }
  ```
- **Responses:**
  - `201 Created`:
    ```json
    {
      "payment_id": 105,
      "transaction_id": "8f3e2b1c-...",
      "purpose": "advance",
      "amount": "300.00",
      "gateway_url": "https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=...",
      "booking_total": "1500.00",
      "booking_advance_amount": "300.00",
      "booking_paid_amount": "0.00",
      "booking_remaining_amount": "1500.00"
    }
    ```
  - `400 Bad Request`: Booking not accepted or advance already recorded.
  - `409 Conflict`: Prior payment attempt already pending.
  - `502 Bad Gateway`: SSLCommerz connection failure.

### 7.2 Initiate Final Online Payment
- **Endpoint:** `POST /api/v1/payments/payments/final/initiate/`
- **Access:** Customer (`IsCustomer`)
- **Preconditions:** `booking.status == "completed"` AND `booking.final_payment_method == "online"`.
- **Request Body:**
  ```json
  {
    "booking_id": 42
  }
  ```
- **Responses:**
  - `201 Created`: Returns `gateway_url` for remaining balance (e.g., `1200.00 BDT`).

### 7.3 Confirm Cash Payment
- **Endpoint:** `POST /api/v1/payments/payments/cash/<int:booking_id>/`
- **Access:** Service Provider (`IsServiceProvider`)
- **Preconditions:** `booking.status == "completed"` AND `booking.final_payment_method == "cash"`.
- **Responses:**
  - `200 OK`:
    ```json
    {
      "message": "Cash payment confirmed.",
      "paid_amount": "1500.00",
      "remaining_amount": "0.00",
      "payment_status": "paid",
      "is_paid": true
    }
    ```

### 7.4 Gateway Callbacks & Webhooks
- `POST /api/v1/payments/success/`: Public webhook. Receives `tran_id` and `val_id`, verifies against SSLCommerz Order Validation API, and atomically persists balance updates.
- `POST /api/v1/payments/ipn/`: Instant Payment Notification handler with HMAC-MD5 signature verification.
- `POST /api/v1/payments/fail/` & `/cancel/`: Callback endpoints handling unfulfilled payment redirects.
- `GET /api/v1/payments/status/<int:payment_id>/`: Customer detail check on payment attempt and remaining balance.

---

## 8. Reviews & Ratings Subsystem (`/api/v1/review/`)

| Method | Endpoint | Access | Parameters / Payload | Description |
|---|---|---|---|---|
| `POST` | `/api/v1/review/review/` | Customer | `{"booking": 42, "service": 5, "rating": 5, "review": "Great!"}` | Submit review for completed booking. |
| `PATCH` | `/api/v1/review/update_review/<int:pk>/` | Customer | `{"rating": 4, "review": "Updated feedback"}` | Edit existing review. |
| `DELETE` | `/api/v1/review/delete_review/<int:pk>/` | Customer | Path `pk` | Remove review. |
| `GET` | `/api/v1/review/get_review/<int:service_id>/` | Authenticated | Path `service_id` | List reviews for a service. *Note: Enforces `IsAuthenticated` on backend; returns 401 if unauthenticated.* |
| `GET` | `/api/v1/review/get_average_review_rating/<int:service_id>/` | Public | Path `service_id` | Returns `{"average_rating": number \| null}`. |

---

## 9. Role Dashboards (`/api/v1/dashboard/`)

### 9.1 Admin Dashboard (`/api/v1/dashboard/admin/`)
- `GET admin/`: Admin root status.
- `GET pending_account/`: List of unapproved service providers awaiting vetting.
- `PATCH account_activate/<int:pk>/`: Sets `is_approved=True` and `is_active=True` for provider `pk`.
- `GET total_activate_account_count/`: Count of active platform users.
- `GET total_activate_pending_count/`: Count of pending provider applications.

### 9.2 Service Provider Dashboard (`/api/v1/dashboard/service_provider/`)
- `GET service_provide/`: Provider root status.
- `GET get_pending_booking/`: List of bookings waiting for acceptance.
- `POST accept_booking/<int:pk>/`: Provider accepts booking; triggers advance payment eligibility.
- `POST reject_booking/<int:pk>/`: Provider rejects booking; sends email notification.
- `POST complete_booking/<int:pk>/`: Marks accepted booking as `COMPLETED`.
- `GET get_accept_booking/`: List of currently accepted/ongoing bookings.
- `GET total_accept_booking/`: Total accepted count metric.
- `GET total_completed_booking/`: Total completed count metric.

### 9.3 Customer Dashboard (`/api/v1/dashboard/customer/`)
- `GET customer/`: Customer root status.
- `GET total_oder_list/`: Full history of all bookings.
- `GET pending_booking/`: List of pending bookings.
- `GET completed_booking/`: List of completed bookings.
