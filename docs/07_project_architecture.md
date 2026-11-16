# 🏛️ System Architecture & Engineering Blueprint

> **Document ID:** `DOC-07-ARCHITECTURE`  
> **System Version:** 1.0.0  
> **Status:** Production Architecture Blueprint  
> **Target Audience:** Solution Architects, DevOps/SREs, Backend Engineers

---

## 1. High-Level System Architecture

The **Local Service Finder System** is built as a cloud-ready, API-first monolithic application with external micro-integrations for media management, transaction processing, and notification delivery:

```mermaid
flowchart TB
    subgraph Clients ["Client Layer"]
        Web["🌐 Web Client<br/>(Next.js / React)"]
        Mobile["📱 Mobile App<br/>(React Native / Flutter)"]
        AdminUI["💻 Admin Portal<br/>(Web Dashboard)"]
    end

    subgraph Gateway ["Edge & Security"]
        CDN["🛡️ Cloudflare / Reverse Proxy<br/>(SSL Termination & Static Assets)"]
    end

    subgraph BackendEngine ["Django Core Application (src/)"]
        Router["WSGI / ASGI Gateway<br/>src.urls (api/v1/)"]
        
        subgraph Subsystems ["Domain Modules"]
            AuthMod["accounts<br/>(CustomUser, RBAC, OTP)"]
            ProfileMod["profiles<br/>(Profile, Geo-coordinates)"]
            LocationMod["locations<br/>(Division, District, Upazila)"]
            CatalogMod["categories & service<br/>(Services, Search Engine)"]
            BookingMod["booking<br/>(State Machine Engine)"]
            PaymentMod["payments<br/>(SSLCommerz & Cash Engine)"]
            ReviewMod["reviews<br/>(1:1 Booking Reviews)"]
            DashMod["dashboard<br/>(Admin, Provider, Customer)"]
        end
    end

    subgraph Storage ["Persistence Layer"]
        DB[(🗄️ PostgreSQL / SQLite<br/>Relational Database)]
    end

    subgraph ExternalServices ["External Cloud Services"]
        SSL["💳 SSLCommerz Gateway<br/>(Hosted Checkout & IPN)"]
        CloudinaryCDN["☁️ Cloudinary<br/>(Image CDN & Transformations)"]
        SMTP["✉️ Gmail SMTP<br/>(Transactional Emails & OTP)"]
    end

    Web --> CDN
    Mobile --> CDN
    AdminUI --> CDN
    CDN --> Router
    
    Router --> AuthMod
    Router --> ProfileMod
    Router --> LocationMod
    Router --> CatalogMod
    Router --> BookingMod
    Router --> PaymentMod
    Router --> ReviewMod
    Router --> DashMod

    Subsystems --> DB
    CatalogMod --> CloudinaryCDN
    ProfileMod --> CloudinaryCDN
    PaymentMod <--> SSL
    AuthMod --> SMTP
    BookingMod --> SMTP
    DashMod --> SMTP
```

---

## 2. Database Entity-Relationship (ER) Blueprint

The diagram below details the entity schemas, key constraints, and relational cardinalities:

```mermaid
erDiagram
    Division ||--o{ District : "has"
    District ||--o{ Upazila : "has"
    
    Division ||--o{ CustomUser : "resides in"
    District ||--o{ CustomUser : "resides in"
    Upazila ||--o{ CustomUser : "resides in"

    CustomUser ||--|| Profile : "owns (1:1)"
    CustomUser ||--o{ OTP : "requests"
    CustomUser ||--o{ Category : "creates"
    CustomUser ||--o{ Service : "provides"
    CustomUser ||--o{ Booking : "books (as customer)"
    CustomUser ||--o{ Booking : "cancels (cancelled_by)"
    CustomUser ||--o{ ReviewAndRating : "authors"

    Category ||--o{ Service : "categorizes"
    Service ||--o{ Booking : "reserved in"
    Service ||--o{ ReviewAndRating : "reviewed for"

    Booking ||--o{ Payment : "settled via"
    Booking ||--|| ReviewAndRating : "evaluated via (1:1)"

    CustomUser {
        int id PK
        string email UK "Primary Identifier"
        string password "PBKDF2 Hashed"
        string first_name
        string last_name
        string name "Auto-concatenated"
        string role "CUSTOMER, SERVICE_PROVIDER, ADMIN"
        int division_id FK
        int district_id FK
        int upazila_id FK
        string area
        boolean is_approved "Gated for Providers"
        boolean is_active
        datetime create_at
    }

    Profile {
        int id PK
        int user_id FK,UK "OneToOne"
        string image "CloudinaryField"
        string gender "MALE, FEMALE, OTHER"
        string city
        string area
        string phone
        text bio
        int experience
        boolean is_verified
        boolean is_available
        float latitude
        float longitude
    }

    OTP {
        int id PK
        int user_id FK
        string otp "4-digit code"
        datetime create_at "5-minute decay"
    }

    Division {
        int id PK
        string name UK
        datetime create_at
        datetime update_at
    }

    District {
        int id PK
        string name UK
        int division_id FK
        datetime create_at
        datetime update_at
    }

    Upazila {
        int id PK
        string name UK
        int district_id FK
        datetime create_at
        datetime update_at
    }

    Category {
        int id PK
        int user_id FK
        string name UK
        datetime create_at
    }

    Service {
        int id PK
        int provider_id FK
        string name "Indexed"
        string image "CloudinaryField"
        text description
        int category_id FK
        string pricing_type "fixed, hourly, quotation"
        decimal hour_base_price
        decimal base_price
        boolean is_active
        datetime create_at
        datetime update_at
    }

    Booking {
        int id PK
        int user_id FK "Customer"
        int service_id FK
        text note
        decimal price_at_booking
        string status "pending, accepted, rejected, completed, cancelled"
        string payment_status "unpaid, partially_paid, paid"
        string final_payment_method "cash, online"
        decimal advance_amount "20% calculation"
        decimal paid_amount
        date booking_date
        time booking_time
        datetime completed_time
        text cancellation_reason
        int cancelled_by_id FK
        datetime cancelled_at
        boolean is_paid
        datetime created_at
        datetime updated_at
    }

    Payment {
        int id PK
        int booking_id FK
        string transaction_id UK "UUIDv4"
        string purpose "advance, final"
        decimal amount
        string status "pending, success, failed, refunded"
        string sslcommerz_val_id
        datetime created_at
        datetime updated_at
    }

    ReviewAndRating {
        int id PK
        int booking_id FK,UK "OneToOne"
        int service_id FK
        int user_id FK
        int rating "1 to 5"
        text review
        datetime created_at
        datetime updated_at
    }
```

---

## 3. Core Operational Data Flows

### 3.1 Two-Stage Payment Lifecycle Flow
The payment pipeline handles advance and final settlements with built-in concurrency locks and double-spend safeguards:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    actor Provider
    participant API as Payments Subsystem
    participant DB as Relational DB
    participant Gateway as SSLCommerz

    Note over Customer,Gateway: Stage 1: Advance Escrow Payment (20%)
    Customer->>API: POST /payments/advance/initiate/ {booking_id}
    API->>DB: select_for_update() on Booking & check status == ACCEPTED
    API->>DB: INSERT INTO Payment (purpose: ADVANCE, status: PENDING, amount: 20%)
    API->>Gateway: createSession(amount, tran_id, success_url, ipn_url)
    Gateway-->>API: { GatewayPageURL }
    API-->>Customer: { gateway_url }
    Customer->>Gateway: Enters credentials & pays
    Gateway->>API: POST /payments/success/ (tran_id, val_id)
    API->>Gateway: validationTransactionOrder(val_id)
    Gateway-->>API: { status: "VALID", amount, currency: "BDT" }
    API->>DB: Atomic Update (paid_amount += amount, payment_status: PARTIALLY_PAID)
    API-->>Gateway: HTTP 200 OK

    Note over Provider,Customer: Stage 2: Service Delivery & Final Settlement
    Provider->>API: POST /dashboard/service_provider/complete_booking/{id}/
    API->>DB: Update Booking (status: COMPLETED)
    alt Online Final Payment
        Customer->>API: POST /payments/final/initiate/ {booking_id}
        API->>Gateway: createSession(remaining_amount)
        Customer->>Gateway: Pays 80% balance
        Gateway->>API: POST /payments/success/
        API->>DB: Atomic Update (paid_amount = total, payment_status: PAID, is_paid: True)
    else Cash on Delivery
        Customer->>Provider: Hands physical cash
        Provider->>API: POST /payments/cash/{booking_id}/
        API->>DB: select_for_update() on Booking (paid_amount = total, is_paid: True)
        API-->>Provider: Cash Settlement Confirmed
    end
```

### 3.2 Asynchronous IPN (Instant Payment Notification) Handling
To protect against drop-offs where the user's browser closes before the success URL callback fires, SSLCommerz dispatches server-to-server IPN requests:

```mermaid
flowchart TD
    IPN["Gateway dispatches POST /api/v1/payments/ipn/"] --> SignCheck{"Verify MD5 Signature<br/>(store_passwd + signed fields)"}
    SignCheck -->|Invalid| Reject["400 Bad Request (Invalid Signature)"]
    SignCheck -->|Valid| CheckStatus{"Gateway Status"}
    
    CheckStatus -->|VALID / VALIDATED| QueryGW["Query SSLCommerz Order Validation API"]
    QueryGW --> AtomicSave["@transaction.atomic<br/>Lock Payment & Booking Rows<br/>Update Balance & Mark Status"]
    AtomicSave --> SuccessResponse["200 OK"]
    
    CheckStatus -->|FAILED / CANCELLED| MarkFail["Mark Payment Attempt FAILED<br/>(If pending and amount matches)"]
    MarkFail --> SuccessResponse
    
    CheckStatus -->|Other| NoOp["200 OK (No state change)"]
```

---

## 4. Scalability, Concurrency & Security Engineering

### 4.1 Database Optimization Strategies
1. **Targeted B-Tree Indexing:**
   - Field `name` on `Service` is configured with `db_index=True` for high-throughput substring lookups.
   - Field `transaction_id` on `Payment` is marked `unique=True`, auto-generating a unique B-Tree index for instantaneous verification queries.
2. **Selective Eager Loading (`select_related`):**
   - Critical read paths utilize Django's `select_related()` to avoid $N+1$ query overhead (e.g., `Payment.objects.select_related("booking")`).
3. **Pessimistic Concurrency Locking:**
   - Financial mutations execute within `@transaction.atomic` blocks utilizing `select_for_update()`. This locks the row against simultaneous callbacks, preventing race conditions or double-crediting balances.

### 4.2 Security Architecture
- **Stateless Authorization:** JWT Bearer tokens isolate authentication from database session tables, enabling horizontal backend scaling.
- **Defense in Depth on Webhooks:** IPN payloads are verified through a combination of HMAC-MD5 cryptographic signature checks, currency verification (`BDT`), and order validation lookups directly back to the gateway.
- **Sensitive Data Isolation:** Database URLs, JWT secrets, SMTP passwords, and payment gateway keys are decoupled from codebase source control via `python-decouple`.

---

## 5. Deployment Topology & Infrastructure Layout

```mermaid
flowchart LR
    subgraph Internet ["Public Network"]
        Users["End Users & Technicians"]
    end

    subgraph CDN_Tier ["Cloud Edge / CDN"]
        WAF["Cloudflare Edge / WAF<br/>(DDoS Protection, SSL, DNS)"]
    end

    subgraph Compute_Tier ["Application Cluster (e.g., Render / AWS ECS)"]
        Gunicorn["Gunicorn WSGI Workers<br/>(Django 6.0 Engine)"]
    end

    subgraph Data_Tier ["Persistence & External Services"]
        PG[(PostgreSQL Managed DB)]
        Cloudinary["Cloudinary CDN<br/>(Asset Storage)"]
        SSLCommerz["SSLCommerz Engine"]
        SMTPHost["Gmail SMTP Relay"]
    end

    Users --> WAF
    WAF --> Gunicorn
    Gunicorn --> PG
    Gunicorn --> Cloudinary
    Gunicorn <--> SSLCommerz
    Gunicorn --> SMTPHost
```

- **Runtime Process:** Python application managed by Gunicorn (`gunicorn src.wsgi:application`) with autoscale worker threads.
- **Database Backend:** Managed PostgreSQL provisioned via `DATABASE_URL` (configured via `dj_database_url.parse()`).
- **Static & Media File Assets:**
  - Static CSS/JS served directly via Whitenoise or Reverse Proxy.
  - User and service image uploads streamed directly to Cloudinary CDN via the `cloudinary` SDK.
