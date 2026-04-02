# Accessomart Production Launch Guide

This document contains everything you need to connect your local development code to the live **Accessomart.com** domain. Follow these steps in order.

---

## 1. Database Setup (Supabase)

Prepare your data storage before deploying the app.

1. **Sign Up**: Create an account at [supabase.com](https://supabase.com).
2. **Create Project**: Name it `accessomart-production`.
3. **Find your URL**:
    - Settings -> Database -> **Connection String**.
    - Choose **URI** and **Transaction Mode**.
    - It will look like: `postgresql://postgres.[USER]:[PASS]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`.
4. **Sync Tables**: In your computer terminal (in the `accessomart-api` folder):
    - Run: `npx prisma migrate deploy` to create the tables on Supabase.

---

## 2. Backend API Setup (Railway)

This is the machine that runs the business logic.

1. **Connect Repo**: Go to [railway.app](https://railway.app) and connect your `accessomart-api` GitHub repository.
2. **Add Variables**: Go to the **Variables** tab and copy these exact names and your values:
    - `DATABASE_URL`: Your Supabase connection string.
    - `NODE_ENV`: `production`.
    - `FRONTEND_URL`: `https://accessomart.com`.
    - `JWT_ACCESS_SECRET`: Use a random 64-character tool like `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
    - `STRIPE_SECRET_KEY`: From Stripe Dashboard (Live).
    - `STRIPE_WEBHOOK_SECRET`: From Stripe Dashboard (Webhooks).
    - `CLOUDINARY_*`: From your Cloudinary Dashboard.
3. **Subdomain**: In **Settings** -> **Domains**, add `api.accessomart.com`. Railway will give you a "Target" name like `project.up.railway.app`.

---

## 3. Frontend Storefront (Vercel)

This is what your customers see.

1. **Import**: Go to [vercel.com](https://vercel.com) and import `accessomart-web`.
2. **Add Variables**:
    - `NEXT_PUBLIC_API_URL`: `https://api.accessomart.com/api/v1`.
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: From Stripe (Live).
    - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`: From PayPal (Live).
3. **Domain**: In **Settings** -> **Domains**, add `accessomart.com`.

---

## 4. GoDaddy DNS Setup

Find the DNS Management area for your domain and add these 3 records:

| Type | Name | Value | Note |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `76.76.21.21` | Points to Vercel (Main Site) |
| **CNAME** | `www` | `cname.vercel-dns.com` | Standard WWW redirect |
| **CNAME** | `api` | `[Provided-By-Railway]` | Points to your Railway API |

---

## 5. Final Checklist

- [ ] Visit `https://accessomart.com`.
- [ ] Visit `https://api.accessomart.com/health` (should say "online").
- [ ] Upload one test product in the Admin panel.
- [ ] Buy a test item using the Stripe "Test Card" while in test mode to verify webhook success.

**Support Contact**: If you encounter issues with database timeouts, ensure you are using the "Transaction Mode" port (6543) in your Supabase connection string.
