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
