# Ravindrra Vastra Niketan - E-Commerce Platform

## Overview
A comprehensive e-commerce website for Ravindrra Vastra Niketan, a premium Indian clothing store. Built as a standalone solution with product catalog, shopping cart, checkout, order management, and admin dashboard.

## Recent Changes
- 2026-02-19: Email notifications via Resend: order confirmation, shipping updates, promotional email campaigns
- 2026-02-19: Admin Email Campaigns page (/admin/emails) with compose UI, customer targeting, templates, preview
- 2026-02-19: Role-based access control system with 4 roles (super_admin, manager, staff, customer) and 10 granular permissions
- 2026-02-19: Admin Roles management page (/admin/roles) with team member list, role assignment, permissions matrix, promote customer dialog
- 2026-02-19: Sidebar dynamically shows only pages the user's role has permission to access
- 2026-02-19: Admin customer detail page (/admin/customers/:id) with full order history, stats, edit customer info
- 2026-02-19: Admin orders table shows customer name (clickable link to customer detail page)
- 2026-02-19: Customers list page: clickable names + view button linking to detail page
- 2026-02-19: One-click reorder from past orders (adds items to cart, checks availability)
- 2026-02-19: Removed delete order from customer page; added admin delete with confirmation dialog
- 2026-02-19: Profile management page (/profile) with personal info editing, password change, recent orders, addresses summary
- 2026-02-19: Multi-address management system (add/edit/delete/set default), auto-save on checkout, addresses page
- 2026-02-19: Shipping: Rs. 80 flat below Rs. 1,500, free above; FREESHIP coupon for free shipping
- 2026-02-19: Comprehensive Delhivery integration: shipping cost calculator, cancel shipment, pickup requests, waybill generation, label download, warehouse registration
- 2026-02-19: Customer-facing pincode serviceability check on checkout with delivery availability indicator
- 2026-02-19: Admin order table: create shipment, cancel shipment, track, download label actions per order
- 2026-02-19: Delhivery courier integration - delivery settings admin page, shipment creation, tracking, free delivery by default
- 2026-02-18: Delete order feature, Buy Now button, saved shipping address, state dropdown
- 2026-02-18: Cashfree Payment Gateway integration (cashfree-pg SDK v5.1.0, PRODUCTION env)
- 2026-02-18: Initial MVP build with full e-commerce functionality
- Auth: Replit Auth (Google, GitHub, email/password login)
- Object Storage: Replit Object Storage for product image uploads
- Database: PostgreSQL with Drizzle ORM
- Payment: Cashfree PG (env vars: CASHFREE_APP_ID, CASHFREE_SECRET_KEY, CASHFREE_ENV)
- Delivery: Delhivery.com integration (API token stored in deliverySettings table, staging/production env)

## Features
- Delete orders from order history
- Buy Now button (skip cart, go directly to checkout with selected product)
- Save shipping address after first successful payment, auto-fill on future orders
- State dropdown with all 28 Indian states + 8 UTs
- Users table has `savedShippingAddress` JSONB column
- Delhivery delivery integration with shipment creation, pincode serviceability check, tracking
- Admin delivery settings page (charges, Delhivery credentials, warehouse config)
- Free delivery enabled by default, configurable via admin panel
- Order tracking with Delhivery waybill and tracking URL for customers

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + Wouter (routing) + TanStack Query
- **Backend**: Express.js + PostgreSQL + Drizzle ORM
- **Auth**: Replit Auth via OpenID Connect
- **Storage**: Replit Object Storage for product images

## Key Files
- `shared/schema.ts` - All data models (categories, products, cart, orders, deliverySettings)
- `shared/models/auth.ts` - Auth-related models (users, sessions)
- `server/routes.ts` - All API endpoints (including Delhivery integration routes)
- `server/storage.ts` - Database storage layer (DatabaseStorage)
- `server/seed.ts` - Seed data for products and categories
- `client/src/App.tsx` - Main app with routing
- `server/email.ts` - Email templates and Resend integration
- `client/src/pages/admin/delivery.tsx` - Admin delivery settings page
- `client/src/pages/admin/emails.tsx` - Admin email campaigns page

## Pages
- `/` - Landing page (logged out) / Home page (logged in)
- `/shop` - Product catalog with filters/search
- `/product/:slug` - Product detail page
- `/search` - Search page
- `/cart` - Shopping cart
- `/checkout` - Checkout with Cashfree payment
- `/payment/callback` - Payment verification after Cashfree redirect
- `/orders` - Customer order history (shows payment status)
- `/profile` - My Account (personal info, password, addresses management, recent orders)
- `/admin` - Admin dashboard (products + orders management)
- `/admin/delivery` - Delivery settings & Delhivery integration

## Design
- Inspired by Net-a-Porter and Zara
- Colors: Deep navy #2C3E50, Elegant gold #C9A961, White background
- Typography: Playfair Display (headings), Raleway (body)
- 12 product images generated for seed data

## User Preferences
- No Stripe connector; API keys approach if payment processing needed later
