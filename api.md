# Aquazone API Documentation

## Authentication
All endpoints require Firebase authentication unless noted. Include the header:

    Authorization: Bearer <firebase_id_token>

Role requirements:
- Admin routes require role: `admin` or `superadmin`
- Some exports require role: `superadmin`

---

## Root
- **GET /** — API info
- **GET /health** — Liveness check

---

## User Routes (`/user`)
- **POST /user/validate** — Validate Firebase token and user existence
  - Body: `{ email: string }`
  - 200: `{ role, exists }`
- **GET /user/** — Get current user profile (from auth middleware)
- **POST /user/** — Create/register user
  - Body: `{ name: string, email?: string, role?: string, access?: any }`
  - Requires `superadmin` for creation
- **PUT /user/** — Update current user
  - Body: `{ name?, email?, role?, access? }` (role only if admin/superadmin)
- **DELETE /user/** — Delete current user

---

## Category Routes (`/category`)
- **GET /category/** — List all categories
- **POST /category/** — Create category
  - Body: `{ name: string, description: string, image: base64-data-url, subCategories?: Array<{name,description}> }`
- **PUT /category/:id** — Update category
- **DELETE /category/:id** — Delete category
- **GET /category/:id/subcategories** — List subcategories for a category
- **POST /category/:id/subcategories** — Create subcategory

---

## Product Routes (`/product`)
- **GET /product/** — List products with filters and pagination
  - Query: `page`, `limit`, `search`, `category` (id or name), `brand`, `minPrice`, `maxPrice`, `minStock`, `maxStock`, `minWholesalePrice`, `maxWholesalePrice`, `minRetailPrice`, `maxRetailPrice`, `sortBy`, `sortOrder`
- **GET /product/:id** — Get product by id
- **POST /product/** — Create product
  - Body: `{ name, description, image: base64-data-url, category: ObjectId, subCategory?, brand, stock?, price?, wholesalePrice?, retailPrice?, remarks? }`
- **PUT /product/:id** — Update product
- **DELETE /product/:id** — Delete product
- **PUT /product/:id/stock** — Update stock
  - Body: `{ stock: number, operation: 'set' | 'add' | 'subtract' }`

---

## Customer Routes (`/customer`)
- **GET /customer/** — Fetch a customer by one of: id | email | phone
  - Query: `id?` | `email?` | `phone?`
- **GET /customer/search** — Search customers
  - Query: `q?`, `name?`, `email?`, `phone?`, `city?`, `state?`, `page?`, `limit?`
- **GET /customer/:id/invoices** — List invoices for a customer
  - Query: `page?`, `limit?`, `type?` (estimate|bill)
- **POST /customer/** — Create customer
  - Body: `{ name, phone, email?, address: { text, city, state, zip } }`
- **PUT /customer/:id** — Update customer
  - Body: `{ name?, phone?, email?, address? }`
- **GET /customer/export** — Export all customers (role: superadmin)

---

## Invoice Routes (`/invoice`)
- **GET /invoice/** — List invoices with filters and pagination
  - Query: `customer?`, `salesman?`, `type?` (estimate|bill), `page?`, `limit?`
- **GET /invoice/:id** — Get invoice by id
- **POST /invoice/** — Create invoice
  - Body: `{ amount: { subTotal, tax, total }, address: { billing, shipping }, items: [{ _id: ProductId, name, price, quantity }], discounts?: [{ name, amount, code }], customer: ObjectId, salesman: ObjectId, type?: 'estimate'|'bill' }`
- **PUT /invoice/:id** — Update invoice (partial fields)
- **DELETE /invoice/:id** — Delete invoice
- **GET /invoice/:id/download** — Download invoice PDF

---

## Transaction Routes (`/transaction`)
- **GET /transaction/** — List transactions
- **GET /transaction/:id** — Get transaction by id
- **POST /transaction/** — Create transaction
- **PUT /transaction/:id** — Update transaction
- **DELETE /transaction/:id** — Delete transaction

---

## Admin Routes (`/admin`)
All admin endpoints require role `admin` or `superadmin` unless noted.

**User management:**
- **GET /admin/users** — List users
- **POST /admin/user/add** — Add user
  - Body: `{ email, name, role }`
  - Only superadmin can assign admin
- **POST /admin/user/update** — Update user
  - Body: `{ userId, email, name, role }`
  - Only superadmin can assign admin/superadmin
- **POST /admin/user/delete** — Delete user
  - Body: `{ userId }`
  - Only superadmin

**Settings (`/admin/settings`):**
- **GET /admin/settings/** — List settings (optional `?key=key`)
- **GET /admin/settings/:key** — Get single setting
- **POST /admin/settings/** — Upsert setting
  - Body: `{ key: string, value: string, name?: string }`

**Analytics (`/admin/analytics`):**
- **GET /admin/analytics/** — Dashboard data (KPIs, trends, distributions)
- **GET /admin/analytics/kpis** — KPIs only
- **GET /admin/analytics/categories** — Category distribution/details
- **GET /admin/analytics/stock** — Stock distributions, low stock, alerts
- **GET /admin/analytics/products/performance** — Top products
  - Query: `limit?`, `sortBy?`
- **GET /admin/analytics/historical** — Historical data
  - Query: `timeRange?` ('7d'|'30d'|'3m'|'12m'), `metric?` ('all' or a key)
- **GET /admin/analytics/health** — Health score + recommendations
- **POST /admin/analytics/refresh** — Refresh analytics (simulate)
- **POST /admin/analytics/export** — Export analytics report
  - Body: `{ format?: 'json'|'csv', timeRange?: string }`

---

## Response Format
All endpoints return JSON. Typical response:

    {
      "success": true,
      "data": ...,
      "message": "..."
    }

On error:

    {
      "success": false,
      "error": "...",
      "details": "..."
    }

---

## Status Codes
- 200: Success
- 201: Created
- 400: Bad request
- 401: Unauthorized
- 403: Forbidden
- 404: Not found
- 500: Server error

---

## Notes
- All endpoints require authentication unless otherwise specified.
- Some endpoints require specific roles (see above).
- For more details, see inline comments in route files and tests.
