# 📐 Engineering & Code Standards

> **Document ID:** `DOC-05-STANDARDS`  
> **System Version:** 1.0.0  
> **Applies to:** Python 3.12+, Django 6.0+, Django REST Framework 3.17+

---

## 1. Architectural Philosophy & Code Organization

The **Local Service Finder System** adheres to a domain-driven, modular monolithic structure. Each capability is isolated into a dedicated Django application within `src/`:

```text
src/
├── accounts/         # Identity, RBAC, Authentication, OTP
├── booking/          # Booking engine, state machine, lifecycle
├── categories/       # Category classification taxonomy
├── dashboard/        # Role-based aggregate views (Admin, Provider, Customer)
├── locations/        # Geo-hierarchy (Division, District, Upazila)
├── payments/         # SSLCommerz gateway integration, IPN, cash settlements
├── profiles/         # User profile extensions, GPS coordinates, signals
├── reviews/          # Verified booking ratings and feedback
├── service/          # Service catalog, pricing models, search engine
└── src/              # Project settings, root URL router, WSGI/ASGI
```

### Modular Application Rules
1. **Single Responsibility Principle:** Each app owns its models, views, serializers, tests, and URL routes.
2. **Cross-App Foreign Keys:** Explicitly define `related_name` on all relationships (e.g., `related_name="bookings"`).
3. **Decoupled Settings:** All environment-dependent parameters (secrets, credentials, hostnames, ports) must be resolved via `python-decouple.config()`. Never hardcode secrets.

---

## 2. API Design & View Standards

### 2.1 Function-Based Views (FBV) with Decorators
The platform standardizes on explicit, decorated Function-Based Views (`@api_view`) to maintain fine-grained control over HTTP methods, authentication schemes, parsers, and Swagger schemas.

#### Mandatory View Decorator Order
Every API endpoint must follow this decorator hierarchy:

```python
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from accounts.permission import IsCustomer

@swagger_auto_schema(
    method='POST',
    request_body=MySerializer,
    responses={201: MySerializer(), 400: 'Bad Request'},
    operation_description="Action summary and detailed description"
)
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsCustomer])
@parser_classes([MultiPartParser, FormParser])  # When accepting binary file/form uploads
def my_custom_endpoint(request):
    serializer = MySerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    instance = serializer.save()
    return Response(
        {"status": "success", "data": serializer.data},
        status=status.HTTP_201_CREATED
    )
```

### 2.2 Swagger / OpenAPI Documentation Standards
- Every endpoint must be decorated with `@swagger_auto_schema`.
- Path parameters, query parameters, and form fields must be explicitly typed using `openapi.Parameter(..., openapi.IN_PATH | IN_QUERY | IN_FORM)`.
- Request bodies and response schemas must reference their corresponding DRF Serializers.

---

## 3. Serializer & Validation Conventions

1. **Explicit Fields:** Always specify `fields = [...]` or declare fields explicitly on `ModelSerializer`. Never use `fields = '__all__'` on models containing sensitive or internal attributes.
2. **Validation Exceptions:** Always use `serializer.is_valid(raise_exception=True)`. This ensures DRF standardizes validation failure responses into an HTTP 400 JSON payload.
3. **Partial Updates:** For `PATCH` endpoints, pass `partial=True` to the serializer instance:
   ```python
   serializer = MySerializer(instance, data=request.data, partial=True)
   serializer.is_valid(raise_exception=True)
   serializer.save()
   ```

---

## 4. Financial Calculations & Concurrency Safety

### 4.1 Strict Decimal Arithmetic (Zero Floating-Point Math)
Due to binary representation issues inherent to IEEE 754 floating-point numbers, floating-point math (`float`) is strictly prohibited in monetary calculations.

```python
from decimal import Decimal, ROUND_HALF_UP

MONEY = Decimal("0.01")

def _as_money(value):
    """Safely converts input into a 2-decimal place Decimal."""
    return Decimal(str(value)).quantize(MONEY, rounding=ROUND_HALF_UP)
```

### 4.2 Database Transaction Boundaries & Row Locking
All multi-table mutations (especially payment verification, advance deduction, and cash confirmation) must be wrapped in atomic database blocks with row-level locks:

```python
from django.db import transaction
from django.shortcuts import get_object_or_404
from booking.models import Booking

@transaction.atomic
def process_settlement(booking_id):
    # Lock the target row to prevent concurrent race conditions
    booking = get_object_or_404(
        Booking.objects.select_for_update(),
        id=booking_id
    )
    
    # Execute financial updates
    booking.paid_amount = _as_money(booking.paid_amount) + remaining
    booking.save(update_fields=["paid_amount", "payment_status", "is_paid", "updated_at"])
```

---

## 5. Security & Authentication Standards

| Component | Standard Specification | Implementation Reference |
|---|---|---|
| **User Identifier** | Email is primary identifier (`USERNAME_FIELD = "email"`). Username is disabled. | `accounts.models.CustomUser` |
| **Passwords** | Django PBKDF2 with SHA-256 algorithm. Minimum length 8. | `settings.AUTH_PASSWORD_VALIDATORS` |
| **Access Tokens** | SimpleJWT HMAC-SHA256 (`HS256`). Lifetime: 60 minutes. | `settings.SIMPLE_JWT` |
| **Refresh Tokens** | Lifetime: 60 days. Explicit blacklisting on signout. | `token.blacklist()` in `accounts.views.signout` |
| **OTP Generation** | 4-digit cryptographically generated integer between $2222$ and $9999$. | `random.randint(2222, 9999)` in `accounts.views.send_otp` |
| **OTP Expiration** | Enforced 5-minute time decay window. Stored in DB with UTC timestamps. | `OTP.is_expire()` in `accounts.models.OTP` |
| **Gateway IPN** | MD5 signature check with store password hashing before recording status. | `_valid_ipn_signature()` in `payments.views` |

---

## 6. HTTP Status Code Conventions

The backend enforces strict semantic HTTP status codes across all responses:

- `200 OK`: Successful read (`GET`) or mutation (`PATCH`, `POST` returning modified resource).
- `201 CREATED`: Successful resource creation (`POST /signup/`, `POST /service_book/`, etc.).
- `204 NO CONTENT`: Successful deletion without response body (`DELETE`).
- `205 RESET CONTENT`: Successful session logout / token invalidation.
- `400 BAD REQUEST`: Validation errors, malformed payload, or invalid operational state (e.g., trying to cancel an already-accepted booking).
- `401 UNAUTHORIZED`: Authentication credentials missing or invalid.
- `403 FORBIDDEN`: Caller lacks required role permissions (`IsAdmin`, `IsServiceProvider`, `IsCustomer`).
- `404 NOT FOUND`: Requested resource or location does not exist.
- `409 CONFLICT`: Duplicate action prevented (e.g., initiating payment when a payment is already pending).
- `502 BAD GATEWAY`: External gateway service unavailable (SSLCommerz handshake timeout).

---

## 7. Python Coding Style & Linting Guidelines

1. **PEP 8 Compliance:** Adhere to 4-space indentation, snake_case function/variable names, PascalCase class names, and UPPER_CASE constants.
2. **Explicit Imports:** Avoid wildcard imports (`from module import *`) in new code; import exact classes to maintain traceability.
3. **Database Nullability:** Text fields (`CharField`, `TextField`) should generally set `blank=True, null=True` if optional. Foreign keys must explicitly define `on_delete` (`CASCADE`, `SET_NULL`, or `PROTECT`).
4. **Resilient Third-Party Integrations:** Wrap external network dependencies (Email SMTP, Cloudinary API, SSLCommerz calls) in defensive `try...except` blocks with meaningful fallbacks or sanitized client errors.
