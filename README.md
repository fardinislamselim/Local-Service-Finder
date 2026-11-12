# Local Service Finder – Modern Next.js 16 Frontend Application

A production-ready frontend for the **Local Service Finder System** built on **Next.js 16 (App Router)**, **TypeScript**, **TanStack Query**, **ofetch**, **shadcn/ui**, **Tailwind CSS**, and **TanStack Form** with **Zod** validation.

The application connects directly to the Django REST Framework backend as specified in `Local_Service_Finder_API.postman_collection.json`.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server & Client Components)
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict type safety
- **Server State & Caching**: [TanStack Query v5](https://tanstack.com/query) (`@tanstack/react-query`)
- **HTTP Client**: [ofetch](https://github.com/unjs/ofetch) with interceptors and centralized error handling
- **Form Management & Validation**: [TanStack Form v1](https://tanstack.com/form) + [Zod](https://zod.dev/)
- **UI Components & Primitives**: [shadcn/ui](https://ui.shadcn.com/) + Radix UI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with dark mode support
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) toast system

---

## 🚀 Key Features

### 1. Complete Authentication System
- **Sign In (`/login`)**: JWT access & refresh token storage in secure cookies + localStorage.
- **Sign Up (`/register`)**: Register as `CUSTOMER`, `SERVICE_PROVIDER`, or `ADMIN`. Service provider accounts are registered with pending status awaiting admin activation.
- **Forgot Password (`/forgot-password`)**: Triggers a 6-digit OTP to the registered email address.
- **Reset Password (`/reset-password`)**: Verifies 6-digit OTP and updates password.
- **Change Password**: In-app modal for authenticated users to update their credentials.
- **Sign Out**: Blacklists refresh token at `/accounts/signout/` and clears all session state.
- **Route Protection**: Edge middleware and client-side `AuthGuard` with role-based authorization.

### 2. Multi-Role Dashboard Architecture
- **Customer Workspace (`/dashboard/customer`)**:
  - Overview of total orders, pending requests, and completed services.
  - Appointment rescheduling and cancellation with reason logging.
  - One-click 20% advance payment initiation via SSLCommerz.
  - Final settlement online payment initiation.
  - Completed service reviews & 5-star ratings.
- **Service Provider Workspace (`/dashboard/provider`)**:
  - Accept or reject incoming booking requests.
  - Manage active jobs and mark services as completed upon execution.
  - Confirm cash-on-delivery payments received from clients.
  - Full service catalog management (create, update, delete services with pricing structures).
- **Administrator Console (`/dashboard/admin`)**:
  - Provider account approval queue (`/dashboard/admin/pending-providers`) with one-click activation.
  - Category manager (`/dashboard/admin/categories`) with full CRUD operations.
  - Geographic territory manager (`/dashboard/admin/locations`) for divisions, districts, and upazilas.

### 3. Public Marketplace
- **Landing Page (`/`)**: Hero search with keyword & location suggestions, category cards, popular services, and workflow walkthrough.
- **Browse Services (`/services`)**: Filterable service marketplace with keyword search, location filtering (upazila/area), category selection, and fixed vs. hourly pricing.
- **Service Booking (`/services/[id]`)**: Full service details, verified reviews, rating breakdown, and appointment booking form with instant 20% advance calculation.
- **SSLCommerz Callbacks (`/payments/*`)**: Handlers for payment success, failure, and cancellation.

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

---

## 💻 Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Type Checking & Production Build
```bash
# Run TypeScript type check
pnpm typecheck

# Build for production
pnpm build

# Start production server
pnpm start
```

---

## 📁 Project Structure

```text
src/
├── app/
│   ├── (auth)/                  # Guest routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   ├── (dashboard)/             # Protected role-based workspaces
│   │   ├── layout.tsx
│   │   ├── dashboard/           # Dynamic role routing
│   │   │   ├── customer/
│   │   │   ├── provider/
│   │   │   └── admin/
│   │   └── profile/
│   ├── services/                # Public marketplace & booking
│   ├── categories/              # Categories directory
│   ├── locations/               # Covered territories
│   ├── payments/                # SSLCommerz callback routes
│   ├── layout.tsx
│   ├── globals.css
│   └── providers.tsx
├── components/
│   ├── ui/                      # shadcn/ui accessible primitives
│   ├── layout/                  # Navigation header, dashboard sidebar
│   └── shared/                  # FormField, AuthGuard, ThemeToggle
├── features/                    # Feature modules (services, schemas, hooks)
│   ├── auth/
│   ├── categories/
│   ├── services/
│   ├── bookings/
│   ├── reviews/
│   ├── profiles/
│   ├── dashboard/
│   ├── locations/
│   └── payments/
├── lib/
│   ├── api/                     # Centralized ofetch client & token management
│   ├── query/                   # TanStack Query client & cache settings
│   └── utils/                   # Formatting helpers & cn utility
└── types/                       # Strict TypeScript interfaces matching Postman API
```

