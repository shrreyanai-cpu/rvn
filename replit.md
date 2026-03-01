# Ravindrra Vastra Niketan - E-Commerce Platform

## Overview
A comprehensive e-commerce website for Ravindrra Vastra Niketan, a premium Indian clothing store. Built as a standalone solution with product catalog, shopping cart, checkout, order management, and admin dashboard.

## Recent Changes
- 2026-03-01: Google OAuth login: passport-google-oauth20, state-based CSRF protection, manual session assignment matching existing auth pattern
- 2026-03-01: Migrated to Neon PostgreSQL database (NEON_DATABASE_URL env var), Drizzle ORM, connect-pg-simple sessions
- 2026-03-01: Previously migrated to local JSON file storage (now reverted back to PostgreSQL)
- 2026-03-01: Wishlist system: heart icon in header, wishlist toggle on all product cards (home/shop), /wishlist page, backend CRUD API
- 2026-03-01: Seasonal sale banners: active banners displayed on homepage below hero, admin CRUD at /admin/banners
- 2026-03-01: Recently viewed products: localStorage tracking, component displayed on homepage before CTA
- 2026-03-01: FAQ page (/faq) with search + accordion UI
- 2026-03-01: SEO structured data (JSON-LD) on home/shop/product/faq/contact pages
- 2026-03-01: Enhanced admin dashboard: 8 stat cards with revenue comparison, low stock alerts
- 2026-03-01: Abandoned cart email reminders: automatic detection + admin trigger, 24h dedup window
- 2026-03-01: Schema tables added: wishlists, seasonalBanners, abandonedCartEmails
- 2026-02-22: Admin notifications: bell icon in admin header shows real-time notifications when new orders are placed, with unread count badge, mark read/all read, auto-polls every 15s
- 2026-02-22: Package customization: admin can edit package dimensions (length, width, height in cm) and weight (grams) per order from the order detail dialog
- 2026-02-20: Advanced product filtering: price range slider, size toggles, color swatches, brand checkboxes, material filter, in-stock toggle, active filter badges, enhanced sorting (rating, popularity, discount)
- 2026-02-20: Brand field added to products schema and admin product form
- 2026-02-20: Sales Analytics dashboard (/admin/analytics) with Recharts: revenue trends, top products, category breakdown, order status distribution
- 2026-02-20: Flash Sale system: flashSalePrice/Start/End fields on products, countdown timers, /flash-sale page
- 2026-02-20: Instagram Feed section on homepage with admin management of posts (image URL, post URL, caption)
- 2026-02-20: Newsletter signup popup (5s delay, 7-day dismiss, localStorage), subscriber management, admin view
- 2026-02-20: Order tracking page (/track-order) with visual timeline, Delhivery integration, scan history
- 2026-02-20: New schema tables: newsletterSubscribers, instagramPosts, contactMessages
- 2026-02-20: Footer updated with Quick Links (Flash Sale, Track Order, Contact Us)
- 2026-02-20: Admin sidebar: Analytics link added
- 2026-02-20: Contact page (/contact) with store info, contact form, and Google Maps embed
- 2026-02-19: Product weight field (grams) on products schema, admin form, saved in order items, total weight calculated for Delhivery shipments
- 2026-02-19: Admin orders table: expandable rows showing items list with product images, qty, size, color, weight per item, and total order weight
- 2026-02-19: Product review and rating system: reviews table, star ratings, customer feedback on product detail page, average ratings on product cards
- 2026-02-19: Checkout terms & conditions: mandatory acceptance before payment, covers unboxing video requirement, no colour/size exchange, damage-only returns
- 2026-02-19: Return system uses VIDEO proof (not photo): unboxing video mandatory, uploaded via object storage, admin reviews video before approval
- 2026-02-19: Return/refund system: damage-only, 2-day window, unboxing video required, no colour/size exchange, admin approve/reject with email notifications
- 2026-02-19: Return policy page (/return-policy) with comprehensive terms: video proof, no colour change, no change-of-mind, non-returnable categories
- 2026-02-19: Admin Returns management page (/admin/returns) with pending/resolved sections, approve/reject with notes, video playback
- 2026-02-19: returnRequests table with damageVideoUrl field, storage methods, API routes with validation
- 2026-02-19: Email verification (OTP) for new account registration with 6-digit code, max 5 attempts, cooldown
- 2026-02-19: Email senders: auth@ravindrra.com (verification), care.customer@ravindrra.com (orders/shipping), no-reply@ravindrra.com (campaigns), reply-to: support@ravindrra.com
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
- **Backend**: Express.js + Neon PostgreSQL + Drizzle ORM
- **Auth**: Custom email/password auth with OTP verification, connect-pg-simple sessions
- **Storage**: Replit Object Storage for product images
- **Database**: Neon PostgreSQL (NEON_DATABASE_URL env var)

## Key Files
- `server/db.ts` - Neon PostgreSQL connection (Drizzle ORM)
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
- `/contact` - Contact page with store info, contact form, and Google Maps
- `/return-policy` - Return & refund policy documentation
- `/terms-conditions` - Terms & conditions
- `/privacy-policy` - Privacy policy
- `/shipping-delivery` - Shipping & delivery information
- `/track-order` - Order tracking page
- `/flash-sale` - Flash sale products with countdown timers
- `/admin` - Admin dashboard (products + orders management)
- `/admin/delivery` - Delivery settings & Delhivery integration
- `/admin/analytics` - Sales analytics dashboard with charts

## Design
- Inspired by Net-a-Porter and Zara
- Colors: Deep navy #2C3E50, Elegant gold #C9A961, White background
- Typography: Playfair Display (headings), Raleway (body)
- 12 product images generated for seed data

## User Preferences
- No Stripe connector; API keys approach if payment processing needed later
