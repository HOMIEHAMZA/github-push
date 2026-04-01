# Accessomart — Database Schema Reference

## Overview
- **Database**: PostgreSQL
- **ORM**: Prisma 5.x
- **Schema file**: `accessomart-api/prisma/schema.prisma`

---

## Entity Relationship Summary

```
User ──────────┬── Address (1:many)
               ├── Cart (1:1)
               ├── Order (1:many)
               ├── Review (1:many)
               ├── WishlistItem (1:many)
               ├── PCBuild (1:many)
               └── Seller (1:1, optional)

Product ───────┬── Brand (many:1)
               ├── Category (many:1)
               ├── ProductImage (1:many)
               ├── ProductVariant (1:many) ── Inventory (1:1)
               ├── ProductSpec (1:many)
               ├── Review (1:many)
               ├── WishlistItem (1:many)
               └── PCBuildItem (1:many)

Cart ──────────── CartItem (1:many) ── ProductVariant
Order ─────────── OrderItem (1:many) ── ProductVariant
               └── Payment (1:1)
               └── Address (many:1)

PCBuild ───────── PCBuildItem (1:many) ── ProductVariant + Product
HomepageSection ── Banner (1:many)
```

---

## Tables: 20 Total

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | CUID | PK |
| email | String | UNIQUE |
| password_hash | String | bcrypt |
| first_name | String | |
| last_name | String | |
| phone | String? | |
| avatar_url | String? | |
| role | Enum | CUSTOMER/ADMIN/SELLER |
| is_active | Boolean | default true |
| email_verified | Boolean | default false |
| created_at | DateTime | |

### `refresh_tokens`
Stores JWT refresh tokens linked to users. Rotated on every refresh call.

### `addresses`
| Column | Notes |
|--------|-------|
| label | "Home", "Office" etc. |
| is_default | One default per user |
| country | Default "US" |

### `categories`
Self-referential via `parent_id`. Supports unlimited depth subcategory trees.

### `brands`
Standalone table linked to products via `brand_id`.

### `products`
| Column | Notes |
|--------|-------|
| slug | UNIQUE, URL-safe identifier |
| base_price | Lowest variant price (denormalized for sorting) |
| compare_price | Struck-through "original" price |
| cost_price | For margin calculations (admin only) |
| status | ACTIVE/DRAFT/ARCHIVED |
| is_featured | Homepage featured section flag |
| tags | String array for flexible filtering |

### `product_variants`
Each product has ≥1 variants. Variant defines the actual purchasable SKU.
`attributes` is JSON: `{"color":"Black","layout":"TKL","connectivity":"USB-C"}`

### `inventory`
1:1 with `product_variants`. Tracks:
- `quantity` — physical stock
- `reserved_qty` — held in active carts/unfulfilled orders
- Available = quantity - reserved_qty

### `reviews`
Unique constraint: one review per (user, product). `is_verified` = verified purchase.

### `wishlist_items`
Simple join table. Unique per (user, product).

### `carts`
Either `user_id` (logged in) or `session_id` (guest). One cart per user.

### `cart_items`
Optional `build_id` link for PC Builder bundles in cart.

### `orders`
`order_number` is human-readable: `ORD-2024-00001`.
Price snapshots stored on order items (not live product price).
Status timestamps: `shipped_at`, `delivered_at`, `cancelled_at`.

### `order_items`
Product name + variant name snapshotted at order time for data integrity.

### `payments`
Stores provider reference ID (Stripe PaymentIntent / PayPal Order ID).
`metadata` JSON holds full provider response for webhooks/audit.

### `homepage_sections`
`config` JSON field is flexible:
```json
{
  "productIds": ["p1","p2"],
  "limit": 8,
  "style": "grid"
}
```

### `banners`
Supports scheduling via `starts_at` / `ends_at`. Position: HERO/SIDEBAR/INLINE/POPUP.

### `admin_settings`
Global key-value store. Used for PC Builder toggles, maintenance mode, etc.
```
pc_builder_enabled      → true
pc_builder_show_in_nav  → true
site_maintenance_mode   → false
flash_deal_timer        → { "hours": 14, "minutes": 22 }
```

### `pc_builds`
`compatibility_warnings` is a JSON array of strings (e.g., `"CPU socket AM4 incompatible with B650 (LGA1700)"`).

### `pc_build_items`
Links a build to specific variants. `category` field stores "CPU", "GPU", etc.

### `sellers` + `seller_products`
Marketplace expansion tables. Currently stubbed. `stripe_account_id` for Stripe Connect.

---

## Quick Start Commands

```bash
cd accessomart-api
cp .env.example .env
# Fill in DATABASE_URL with your PostgreSQL connection string

npm install
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema to database (development)
# or:
npx prisma migrate dev     # Create migration files (production track)
npx prisma studio          # Open visual DB browser at localhost:5555
npm run dev                # Start API server at localhost:4000
```
