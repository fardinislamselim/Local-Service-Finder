---
name: service-marketplace-ui
description: Design principles, color system, and UI components for the Local Service Finder marketplace inspired by Thumbtack, TaskRabbit, and Airbnb Experiences.
---

# Service Marketplace UI Design System ("Tactile Local Craft & Trust")

## 1. Visual Philosophy
Move completely away from generic SaaS blue/indigo templates. The aesthetic is authentic, warm, tactile, and high-trust, tailored for local services, home repairs, and skilled artisans in Bangladesh.

### Color Palette
- **Primary Brand (Deep Emerald Teal):** `#115E59` / `teal-800` (or `#0F5132`). Symbolizes trust, craftsmanship, hygiene, and local dependability.
- **Action / Conversion CTA (Warm Terracotta / Burnt Orange):** `#EA580C` / `orange-600` (hover: `#C2410C` / `orange-700`). High-contrast, warm, tactile conversion buttons ("Book Now", "Find Pros", "Post Request").
- **Canvas & Layered Surfaces:**
  - Base Background: Warm Sand/Stone canvas (`#FAF9F6` / `stone-50`).
  - Elevated Cards: Pure white (`#FFFFFF`) with crisp `1px solid #E7E5E4` (`stone-200`) borders.
  - Multi-layer elevation: `shadow-[0_4px_20px_-4px_rgba(28,25,23,0.06)]`.
- **Semantic Accents:**
  - Emerald (`#10B981` / `emerald-600`): Completed, Verified Pro, Advance Paid.
  - Amber / Honey (`#F59E0B` / `amber-500`): Star ratings, Pending requests.
  - Sky Blue (`#0EA5E9` / `sky-500`): Accepted bookings.
  - Rose / Crimson (`#F43F5E` / `rose-500`): Cancelled, Rejected, Failed.

## 2. Typography
- **Headings:** **Plus Jakarta Sans** or **Outfit** with tight letter-spacing (`-0.02em`), confident font weights (`font-bold`, `font-extrabold`).
- **Body & Captions:** **Inter** for legibility.
- **Figures:** `tabular-nums` for all pricing (`৳`), durations, review counters, and booking timestamps.

## 3. Component & Layout Standards
- **Bento & Asymmetrical Grids:** Clean category grids with visual badges and micro-interactions.
- **Cards & Micro-interactions:** Tactile service cards with floating price badges, verified pro checkmarks, and subtle Framer Motion hover lifts (`whileHover={{ y: -3 }}`).
- **Forms:** Always use `@tanstack/react-form` + Shadcn UI components with clear inline validation.
- **Async Views:** Tailored skeletons matching card layouts during loading states.

## 4. API Contract Rules
- **Multipart Form-Data:** Services, Bookings, and Profile endpoints require `FormData` (`multipart/form-data`) because the backend uses Django `MultiPartParser`.
- **401 Session Expiry:** Backend lacks a token refresh endpoint. Clear Zustand auth store and redirect to `/login`.
- **403 Forbidden:** Display an error toast without terminating user session.
