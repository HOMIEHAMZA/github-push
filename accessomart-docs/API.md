# Accessomart — REST API Reference

**Base URL**: `http://localhost:4000/api/v1`  
**Auth**: Bearer JWT in `Authorization` header

---

## Authentication (`/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user |
| POST | `/auth/login` | — | Login → access + refresh tokens |
| POST | `/auth/refresh` | — | Rotate refresh token |
| POST | `/auth/logout` | — | Invalidate refresh token |
| GET | `/auth/me` | ✓ | Get current user profile |

---

## Products (`/products`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | — | List products with filters |
| GET | `/products/:slug` | — | Product detail (full) |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Archive product |

**Query params for GET `/products`:**
```
?category=keyboards
?brand=vanguard
?search=mechanical
?sort=price_asc|price_desc|newest|popular
?minPrice=50&maxPrice=500
?featured=true
?page=1&limit=20
```

---

## Categories (`/categories`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | — | All active categories (nested) |

---

## Cart (`/cart`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | ✓ | Get cart with items + total |
| POST | `/cart/items` | ✓ | Add item (with stock check) |
| PATCH | `/cart/items/:id` | ✓ | Update quantity |
| DELETE | `/cart/items/:id` | ✓ | Remove item |
| DELETE | `/cart` | ✓ | Clear entire cart |

---

## Orders (`/orders`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/orders` | ✓ | List user's orders |
| GET | `/orders/:id` | ✓ | Order detail |
| POST | `/orders` | ✓ | Checkout (create order from cart) |
| PATCH | `/orders/:id/status` | Admin | Update order status |

**Checkout body:**
```json
{
  "addressId": "addr_xxx",
  "paymentProvider": "STRIPE",
  "couponCode": "SAVE10",
  "notes": "Leave at door"
}
```

---

## Reviews (`/reviews`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reviews/product/:productId` | — | List approved reviews |
| POST | `/reviews` | ✓ | Submit review |

---

## Wishlist (`/wishlist`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/wishlist` | ✓ | Get wishlist items |
| POST | `/wishlist` | ✓ | Add product to wishlist |
| DELETE | `/wishlist/:productId` | ✓ | Remove from wishlist |

---

## PC Builder (`/builder`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/builder/components` | — | Products grouped by builder category |
| GET | `/builder/my-builds` | ✓ | User's saved builds |
| POST | `/builder/save` | ✓ | Save a build |
| DELETE | `/builder/:id` | ✓ | Delete a build |

---

## Users (`/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✓ | Profile + addresses |
| POST | `/users/addresses` | ✓ | Add address |
| PATCH | `/users/addresses/:id` | ✓ | Update address |
| DELETE | `/users/addresses/:id` | ✓ | Delete address |

---

## Admin (`/admin`) — All require Admin role

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Stats, recent orders, low stock |
| GET | `/admin/orders` | All orders with pagination |
| GET | `/admin/customers` | All customers with search |
| GET | `/admin/homepage` | Homepage sections with config |
| PATCH | `/admin/homepage/:id` | Update section (toggle, reorder, config) |
| GET | `/admin/settings` | All settings as key-value map |
| PUT | `/admin/settings/:key` | Upsert a setting |

**Admin settings keys:**
```
pc_builder_enabled       → boolean
pc_builder_show_in_nav   → boolean  
site_maintenance_mode    → boolean
flash_deal_timer         → { hours: number, minutes: number }
```

---

## Standard Response Shapes

**Success:**
```json
{ "user": {...} }
{ "products": [...], "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }
```

**Error:**
```json
{ "error": "Product not found." }
{ "error": "Validation failed.", "details": [{ "field": "email", "message": "Invalid email" }] }
```
