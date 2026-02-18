# Ravindrra Vastra Niketan - E-Commerce Platform

## Overview
A comprehensive e-commerce website for Ravindrra Vastra Niketan, a premium Indian clothing store. Built as a standalone solution with product catalog, shopping cart, checkout, order management, and admin dashboard.

## Recent Changes
- 2026-02-18: Initial MVP build with full e-commerce functionality
- Auth: Replit Auth (Google, GitHub, email/password login)
- Object Storage: Replit Object Storage for product image uploads
- Database: PostgreSQL with Drizzle ORM

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + Wouter (routing) + TanStack Query
- **Backend**: Express.js + PostgreSQL + Drizzle ORM
- **Auth**: Replit Auth via OpenID Connect
- **Storage**: Replit Object Storage for product images

## Key Files
- `shared/schema.ts` - All data models (categories, products, cart, orders)
- `shared/models/auth.ts` - Auth-related models (users, sessions)
- `server/routes.ts` - All API endpoints
- `server/storage.ts` - Database storage layer (DatabaseStorage)
- `server/seed.ts` - Seed data for products and categories
- `client/src/App.tsx` - Main app with routing

## Pages
- `/` - Landing page (logged out) / Home page (logged in)
- `/shop` - Product catalog with filters/search
- `/product/:slug` - Product detail page
- `/search` - Search page
- `/cart` - Shopping cart
- `/checkout` - Checkout with shipping form
- `/orders` - Customer order history
- `/admin` - Admin dashboard (products + orders management)

## Design
- Inspired by Net-a-Porter and Zara
- Colors: Deep navy #2C3E50, Elegant gold #C9A961, White background
- Typography: Playfair Display (headings), Raleway (body)
- 12 product images generated for seed data

## User Preferences
- No Stripe connector; API keys approach if payment processing needed later
