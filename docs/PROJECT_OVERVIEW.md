# Project Overview — Hotel Booking Platform

## Stack

- Frontend: Next.js + TypeScript
- Backend: Next.js API Routes / Services
- Database: PostgreSQL (Prisma recommended)

## Goal

Multi-role hotel booking platform supporting Customers, Hotel Owners, and Admins with room booking, payments, inventory management, approvals, analytics, and revenue tracking.

## Business Modules

### Customer

- Search Hotels
- View Rooms
- Book Room
- Pay Advance
- Cancel Booking
- Booking History

### Hotel Owner

- Login
- Add / Edit Rooms
- Upload Room Images
- Set Pricing
- Manage Bookings
- Block Dates

### Admin

- Manage Hotels
- Approve Listings
- Manage Users
- Reports
- Revenue Tracking

## UI Modules

### Customer

- Home
- Search
- Hotel Listing
- Hotel Detail
- Booking
- Payment
- Profile

### Owner Dashboard

- Dashboard
- Room Management
- Booking Management
- Pricing
- Calendar

### Admin Panel

- Analytics
- Hotels
- Users
- Bookings
- Payments

## Core Entities (high-level)

- `User` (roles: CUSTOMER, OWNER, ADMIN)
- `Hotel`
- `Room`
- `RoomImage`
- `Booking`
- `Payment`
- `BlockedDate`

## Recommended Database Schema (short)

- Use Prisma with a `User`, `Hotel`, `Room`, `RoomImage`, `Booking`, `Payment`, `BlockedDate` models and enums for `Role`, `BookingStatus`, `PaymentStatus`.

## Project Structure (current workspace)

- `app/` — Next.js app routes and pages
- `components/` — UI components (search-bar, hotel-card, availability-calendar, etc.)
- `lib/` — client-side helpers and data (e.g. `hotels.ts`, `search-context.tsx`)
- `public/images/` — static images
- config & tooling: `package.json`, `pnpm-lock.yaml`, `tsconfig.json`, `next.config.mjs`

## Next Actions / Recommendations

1. Add Prisma (`prisma/schema.prisma`) and `.env.example` with `DATABASE_URL`.
2. Implement auth + RBAC (JWT or NextAuth) and protect owner/admin APIs.
3. Scaffold API routes for `hotels`, `rooms`, `bookings`, `payments`.
4. Integrate Stripe for payments; implement webhook handlers for payment confirmation and refunds.
5. Add seed data and migrations, then implement owner/admin dashboards.

---

File created for quick reference. Update this file as requirements evolve.
