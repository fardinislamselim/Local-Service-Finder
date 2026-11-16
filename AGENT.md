# AGENT.md --- Local Service Finder System

> **Status:** Working instructions (initial draft)\
> **Project:** Local Service Finder System\
> **Primary region:** Bangladesh\
> **Backend:** Python 3.12+ · Django 6.x · Django REST Framework 3.17+\
> **API prefix:** `/api/v1/`

This file gives AI coding agents the rules to follow while working in
this repository. The six project documents currently supplied are
working references, not a declaration that the documentation set is
final. Do not rewrite, finalize, or silently reconcile those documents
unless explicitly asked.

------------------------------------------------------------------------

## 1. Mission and working approach

Build and maintain the Local Service Finder System: an API-first
platform connecting customers with locally available service providers
in Bangladesh.

The system supports:

-   Customer, Service Provider, and Admin roles.
-   Location-aware discovery using Division → District → Upazila → Local
    Area.
-   Service categories and service listings with fixed, hourly, or
    quotation pricing.
-   Booking lifecycle management.
-   Two-stage payments: 20% online advance after provider acceptance,
    then the remaining balance after completion through online payment
    or verified cash.
-   Provider approval, email notifications, OTP password recovery,
    Cloudinary media, and booking-verified reviews.
-   Role-specific dashboards and analytics.

Work incrementally. Before changing code, inspect the repository and the
relevant implementation. Prefer small, coherent changes over broad
rewrites.

## 2. Documentation and source-of-truth rules

Read the relevant project documents before implementing a feature:

  -----------------------------------------------------------------------
  Document                            Use
  ----------------------------------- -----------------------------------
  `01_project_overview.md`            Product purpose, roles, high-level
                                      workflows, stack

  `02_project_context.md`             Business rules, domain invariants,
                                      security boundaries

  `03_project_features.md`            Functional feature specifications

  `04_frontend_ai_workflow.md`        Frontend integration, auth flow,
                                      screens, UX

  `05_code_standards.md`              Backend architecture, API
                                      conventions, coding standards

  `06_api_documentation.md`           Endpoint paths, access rules,
                                      request and response contracts
  -----------------------------------------------------------------------

Rules:

1.  Treat these documents as the current project references, but
    remember they are still subject to later review and finalization.
2.  Inspect the actual code before assuming a documented endpoint,
    model, field, or behavior is implemented exactly as described.
3.  When code and documentation disagree, do not silently choose one.
    Report the discrepancy, inspect the relevant implementation and
    tests, and ask for direction if the intended behavior cannot be
    established safely.
4.  Do not invent API endpoints, request fields, response properties,
    model relations, environment variables, or business rules.
5.  Preserve existing working behavior unless the task explicitly
    requires changing it.
6.  If a task changes an API contract or business rule, identify the
    affected backend, frontend, tests, and documentation. Update
    documentation only when requested or clearly included in the task.
7.  Do not claim that all documentation is complete or final.

## 3. Mandatory investigation workflow

For every task:

1.  Read this file and the relevant project documentation.
2.  Inspect the repository structure and current Git status. Do not
    overwrite unrelated user changes.
3.  Trace the complete feature flow where applicable: URL → view →
    serializer → model/service logic → permissions → integrations →
    frontend consumer.
4.  Check existing patterns and reuse them when they are sound.
5.  Identify validation, authorization, ownership, state-transition,
    concurrency, and failure cases before coding.
6.  Implement the smallest complete solution.
7.  Run relevant tests, checks, migrations, or build commands that are
    available. Do not claim a check passed unless it was actually run.
8.  Summarize changed files, behavior, verification performed, and any
    remaining risks.

Do not perform destructive operations (database resets, data deletion,
force pushes, dropping tables, or overwriting user work) without
explicit authorization.

## 4. Architecture and code organization

The backend follows a modular monolithic Django structure. Keep each app
responsible for its own domain:

``` text
src/
├── accounts/       # Custom user, authentication, RBAC, OTP
├── booking/        # Booking model and lifecycle
├── categories/     # Service category taxonomy
├── dashboard/      # Admin, provider, and customer dashboards
├── locations/      # Division, District, Upazila
├── payments/       # SSLCommerz, IPN, online and cash settlement
├── profiles/       # User profile, signals, location metadata
├── reviews/        # Booking-verified ratings and feedback
├── service/        # Service catalog, pricing, search
└── src/            # Django settings and root routing
```

-   Follow single-responsibility boundaries.
-   Keep models, serializers, views, URLs, and tests in the owning app.
-   Define explicit `related_name` values for cross-app foreign keys.
-   Use explicit imports; avoid wildcard imports.
-   Read configuration from environment variables / `python-decouple`;
    never hardcode secrets.
-   Do not introduce a new architecture, dependency, or abstraction
    without a concrete need.

## 5. Backend implementation standards

### Django REST Framework

-   Follow the repository's established Function-Based View
    (`@api_view`) conventions unless the existing codebase or task
    explicitly establishes another pattern.
-   Follow the documented decorator order and use the appropriate
    authentication, permission, and parser decorators.
-   Add `@swagger_auto_schema` to API endpoints and document
    path/query/form parameters and request/response schemas.
-   Use explicit serializer fields. Do not use `fields = "__all__"` for
    models with sensitive or internal fields.
-   Validate with `serializer.is_valid(raise_exception=True)`.
-   For partial updates, pass `partial=True`.
-   Use semantic HTTP status codes consistent with the API reference.
-   Enforce ownership and role permissions on the server. Hiding a
    frontend control is not authorization.

### Code style

-   Follow PEP 8.
-   Use 4-space indentation, `snake_case` for functions/variables,
    `PascalCase` for classes, and `UPPER_CASE` for constants.
-   Define explicit `on_delete` behavior for foreign keys.
-   Optional text fields should follow the project's existing null/blank
    conventions.
-   Handle third-party failures defensively and return safe, meaningful
    API errors. Never expose credentials, tokens, stack traces, or
    sensitive provider responses.

## 6. Domain rules --- do not violate

### Identity and roles

-   Email is the primary user identifier; the documented custom user
    model disables the traditional username field.
-   Roles are `CUSTOMER`, `SERVICE_PROVIDER`, and `ADMIN`.
-   Customer accounts are activated on registration.
-   Service Provider accounts begin with `is_approved=False` and
    `is_active=False`.
-   A Service Provider must not receive normal authenticated access
    until an Admin approves and activates the account.
-   Use the project's permission classes and verify role plus resource
    ownership.

### Geographic hierarchy

Use the hierarchy:

`Division → District → Upazila → Local Area`

Keep cascading location selections and service discovery consistent with
this relationship. Do not replace structured location relations with
arbitrary text fields unless the task and existing schema require it.

### Services and pricing

Pricing types are:

-   `fixed`: may be booked directly.
-   `hourly`: direct booking is rejected until duration/total price is
    established.
-   `quotation`: direct booking is rejected until a provider
    quotation/agreement exists.

Only active services should be eligible for booking. Provider service
ownership must be enforced.

### Booking lifecycle

The documented booking states are:

`pending → accepted / rejected / cancelled → in_progress → completed`

Use only valid transitions supported by the current implementation and
project rules. In particular:

-   Only a Customer can create a booking.
-   A booking requires an active service.
-   Direct booking is limited to `fixed` pricing.
-   Customers may update or cancel only while the booking is `pending`.
-   Once accepted, the public customer cancellation endpoint must not
    allow arbitrary cancellation.
-   Provider actions must be restricted to bookings associated with that
    provider's services.
-   Do not mark a booking complete before the provider's permitted
    completion transition.

### Payments

The documented payment policy is:

-   Advance: exactly 20% of the booking-time price.
-   Advance payment: online only, after provider acceptance, and only
    when no amount has already been paid.
-   Final settlement: after booking completion.
-   Final payment: remaining balance through SSLCommerz or cash
    confirmed by the Service Provider, according to the selected payment
    method.
-   Never trust a client-supplied amount; calculate and verify amounts
    on the server.
-   Use `Decimal`, never `float`, for money.
-   Quantize to two decimal places using the project's documented
    rounding convention (`ROUND_HALF_UP`).
-   Wrap payment state changes in `transaction.atomic` and lock the
    booking/payment rows with `select_for_update()` where supported.
-   Prevent duplicate or concurrent payment attempts and double
    settlement.
-   Verify SSLCommerz transaction status with the gateway validation
    flow. Validate IPN signatures before recording payment.
-   Treat gateway callbacks as untrusted input. Make callback handling
    idempotent.
-   Do not mark a payment successful based only on a browser redirect.

### Reviews

-   Reviews must be linked to a specific booking.
-   Only the owning Customer may review an eligible completed booking.
-   Enforce the 1--5 rating range.
-   Enforce at most one review per completed booking.
-   Do not allow unverified service-only reviews.

### Authentication, OTP, and secrets

-   Use the existing SimpleJWT implementation and token blacklist
    behavior.
-   Documented token lifetimes: access 60 minutes; refresh 60 days.
-   Password reset OTP validity: 5 minutes.
-   Never log passwords, OTPs, access/refresh tokens, payment secrets,
    or full sensitive payloads.
-   Keep secrets in environment configuration, never source control.

## 7. API contract rules

-   Base API path: `/api/v1/`.
-   Authenticated requests use `Authorization: Bearer <access_token>`,
    except explicitly public endpoints and gateway callbacks.
-   Use `multipart/form-data` for endpoints that accept uploaded files.
-   Follow the endpoint, method, role, payload, and response contracts
    in `06_api_documentation.md`, after checking the actual backend
    implementation.
-   Do not change response shapes casually; frontend consumers may
    depend on them.
-   If a contract change is necessary, update all consumers and tests in
    the same task where possible.
-   Swagger UI and ReDoc are documented at `/swagger/` and `/redoc/`.

## 8. Frontend integration guidance

The frontend documentation recommends:

-   Next.js App Router or React (Vite).
-   TanStack Query for server state, caching, and invalidation.
-   Axios with centralized request/response interceptors.
-   React Hook Form + Zod for forms and validation.
-   Tailwind CSS with Radix UI / shadcn/ui.
-   Lucide React icons.

Before choosing a stack-specific implementation, inspect the actual
frontend repository and follow its installed versions and existing
conventions.

Frontend rules:

-   Keep API access centralized; do not scatter raw Axios configuration
    across components.
-   Attach the access token consistently using the established auth
    strategy.
-   Handle 401 responses and token expiry without infinite refresh
    loops.
-   Keep authentication state, user identity, and role-aware navigation
    synchronized after sign-in/sign-out.
-   Protect customer, provider, and admin routes, but always rely on
    backend authorization as the security boundary.
-   Provider users who are not approved/active should see the
    pending-approval experience, not provider functionality.
-   Use the documented cascading location hierarchy.
-   Debounce service keyword search by approximately 350 ms as specified
    in the frontend guide.
-   Handle loading, empty, error, and success states.
-   Display field-level DRF validation errors in the relevant form.
-   For booking and payment screens, clearly show booking status,
    advance amount, paid amount, and remaining balance using values
    returned/verified by the API.
-   Redirect to the SSLCommerz `gateway_url` only when the backend
    successfully returns it.
-   Never treat returning from the gateway as proof of payment; retrieve
    verified payment/booking status from the backend.
-   Use accessible, responsive UI and preserve the existing design
    system.

## 9. External integrations

Use existing integration wrappers and settings where present:

-   **SSLCommerz:** hosted checkout, transaction validation,
    success/fail/cancel callbacks, and IPN.
-   **Cloudinary:** profile and service media.
-   **Gmail SMTP:** OTP and transactional notifications.

Do not hardcode credentials or assume integrations are available in
every environment. Provide safe failure handling and avoid making
non-critical email failures crash otherwise valid booking operations
where the documented behavior allows graceful handling.

## 10. Testing expectations

Add or update tests for the behavior being changed. Cover relevant cases
such as:

-   Authentication success/failure and role permissions.
-   Provider approval gating.
-   Resource ownership and unauthorized access.
-   Location filtering and active-service filtering.
-   Valid and invalid pricing types at booking time.
-   Booking state transitions and customer cancellation boundaries.
-   Exact 20% advance calculation and remaining-balance calculation.
-   Duplicate, concurrent, failed, and successful payment attempts.
-   SSLCommerz validation/IPN failure and idempotency.
-   Cash settlement authorization.
-   Review eligibility, ownership, rating bounds, and duplicate review
    prevention.
-   Frontend loading/error/empty states and auth-state updates when
    frontend code changes.

Use the test framework already configured in the repository. Do not add
a new test framework without a reason.

## 11. Important conflict to flag

The current references contain a few details that must be verified
against code before implementation. For example, the overview describes
the payment flow at a high level, while the context/features documents
define more detailed preconditions and lifecycle states. The feature
catalog also names a six-state booking lifecycle, while the broader
workflow includes `in_progress`. Do not silently normalize such
differences: inspect the model, serializers, views, and tests, then
report any unresolved conflict.

Likewise, the documentation includes both broad recommendations and
concrete endpoint examples. The actual repository implementation and
explicit task requirements must be checked before assuming every example
is current.

## 12. Agent response format

At the end of each coding task, report:

1.  **What changed** --- concise summary of implemented behavior.
2.  **Files changed** --- list the important files.
3.  **Validation** --- exact tests, lint, type checks, migrations, or
    builds run and their outcomes.
4.  **Known issues** --- anything not verified, blocked, or still
    requiring a decision.

Be direct and factual. Never claim code was tested, deployed, or fixed
unless the relevant action was actually completed.
