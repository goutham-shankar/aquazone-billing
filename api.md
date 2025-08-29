# Aquazone API Documentation

## Authentication
All endpoints require Firebase authentication unless noted. Include the header:

    Authorization: Bearer <firebase_id_token>

Role requirements:
- Admin routes require role: `admin` or `superadmin`
- Some exports require role: `superadmin`

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": "...",
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Optional error details"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "total": 100,
    "limit": 10
  }
}
```

---

## Root

### GET /
**Description:** API info  
**Authentication:** Not required

**Response (200):**
```json
{
  "message": "Hello World! (◔◡◔) - Aquazone API Server",
  "v": "v1.0.0",
  "status": 200
}
```

### GET /health
**Description:** Liveness check  
**Authentication:** Not required

**Response (200):**
```json
{
  "message": "I'm alive!",
  "status": 200
}
```

---

## User Routes (`/user`)

### POST /user/validate
**Description:** Validate Firebase token and user existence

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "role": "admin",
  "exists": true
}
```

**Response (403):**
```json
{
  "success": false,
  "error": "User does not exist"
}
```

### GET /user/
**Description:** Get current user profile (from auth middleware)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "loginHistory": [...]
  },
  "message": "User profile retrieved successfully"
}
```

### POST /user/
**Description:** Create/register user (superadmin only)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "manager"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "manager",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### PUT /user/
**Description:** Update current user (role change only if admin/superadmin)

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "role": "admin"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "admin"
  }
}
```

### DELETE /user/
**Description:** Delete current user

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Category Routes (`/category`)

### GET /category/
**Description:** List all categories

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "Electronics",
      "description": "Electronic items",
      "image": "data:image/jpeg;base64,...",
      "subCategories": ["Smartphones", "Laptops"],
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "message": "Categories retrieved successfully"
}
```

### POST /category/
**Description:** Create category

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic items and gadgets",
  "image": "data:image/jpeg;base64,...",
  "subCategories": [
    {
      "name": "Smartphones",
      "description": "Mobile phones"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Electronics",
    "description": "Electronic items and gadgets",
    "image": "https://storage.googleapis.com/...",
    "subCategories": ["Smartphones"],
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### PUT /category/:id
**Description:** Update category

**Request Body:**
```json
{
  "name": "Updated Electronics",
  "description": "Updated description",
  "image": "data:image/jpeg;base64,...",
  "subCategories": ["Smartphones", "Tablets"]
}
```

### DELETE /category/:id
**Description:** Delete category

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Category deleted successfully"
}
```

---

## Product Routes (`/product`)

### GET /product/
**Description:** List products with filters and pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search in name/description
- `category` (string): Category ID or name
- `brand` (string): Filter by brand
- `minPrice`, `maxPrice` (number): Price range
- `minStock`, `maxStock` (number): Stock range
- `minWholesalePrice`, `maxWholesalePrice` (number): Wholesale price range
- `minRetailPrice`, `maxRetailPrice` (number): Retail price range
- `sortBy` (string): Field to sort by
- `sortOrder` (string): 'asc' or 'desc'

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "...",
        "name": "iPhone 15",
        "description": "Latest iPhone",
        "image": "https://storage.googleapis.com/...",
        "category": {
          "_id": "...",
          "name": "Electronics"
        },
        "subCategory": "Smartphones",
        "brand": "Apple",
        "stock": 50,
        "price": 999,
        "wholesalePrice": 850,
        "retailPrice": 999,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ]
  },
  "pagination": { ... },
  "statistics": {
    "totalProducts": 150,
    "totalValue": 75000,
    "lowStockCount": 5
  }
}
```

### GET /product/:id
**Description:** Get product by ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "iPhone 15",
    "description": "Latest iPhone with advanced features",
    "image": "https://storage.googleapis.com/...",
    "category": "...",
    "subCategory": "Smartphones",
    "brand": "Apple",
    "stock": 50,
    "price": 999,
    "wholesalePrice": 850,
    "retailPrice": 999,
    "remarks": "New arrival",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### POST /product/
**Description:** Create product

**Request Body:**
```json
{
  "name": "iPhone 15",
  "description": "Latest iPhone with advanced features",
  "image": "data:image/jpeg;base64,...",
  "category": "507f1f77bcf86cd799439011",
  "subCategory": "Smartphones",
  "brand": "Apple",
  "stock": 50,
  "price": 999,
  "wholesalePrice": 850,
  "retailPrice": 999,
  "remarks": "New arrival"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "iPhone 15",
    "description": "Latest iPhone with advanced features",
    "image": "https://storage.googleapis.com/...",
    "category": "507f1f77bcf86cd799439011",
    "subCategory": "Smartphones",
    "brand": "Apple",
    "stock": 50,
    "price": 999,
    "wholesalePrice": 850,
    "retailPrice": 999,
    "remarks": "New arrival",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### PUT /product/:id
**Description:** Update product

**Request Body:** (All fields optional)
```json
{
  "name": "iPhone 15 Pro",
  "description": "Updated description",
  "stock": 75,
  "price": 1099
}
```

### DELETE /product/:id
**Description:** Delete product

### PUT /product/:id/stock
**Description:** Update product stock

**Request Body:**
```json
{
  "stock": 25,
  "operation": "set"
}
```
Operations: `set`, `add`, `subtract`

---

## Customer Routes (`/customer`)

### GET /customer/
**Description:** Fetch customer by ID, email, or phone

**Query Parameters:** (One required)
- `id` (string): Customer ID
- `email` (string): Customer email
- `phone` (string): Customer phone

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "address": {
      "text": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "email": "john@example.com",
    "phone": "+1234567890",
    "gstNumber": "GST123456789",
    "lastPurchase": "2025-01-01T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### GET /customer/search
**Description:** Search customers

**Query Parameters:**
- `q` (string): General search query
- `name` (string): Search by name
- `email` (string): Search by email
- `phone` (string): Search by phone
- `city` (string): Search by city
- `state` (string): Search by state
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [...],
  "pagination": { ... }
}
```

### GET /customer/:id/invoices
**Description:** List customer invoices

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `type` (string): 'estimate' or 'bill'

### POST /customer/
**Description:** Create customer

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": {
    "text": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "gstNumber": "GST123456789"
}
```

### PUT /customer/:id
**Description:** Update customer

**Request Body:** (All fields optional)
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "email": "johnsmith@example.com",
  "address": {
    "text": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "zip": "02101"
  }
}
```

### GET /customer/export
**Description:** Export all customers (superadmin only)

---

## Invoice Routes (`/invoice`)

### GET /invoice/
**Description:** List invoices with filters and pagination

**Query Parameters:**
- `customer` (string): Customer ID
- `salesman` (string): Salesman ID
- `type` (string): 'estimate' or 'bill'
- `page` (number): Page number
- `limit` (number): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "invoiceId": 100001,
      "amount": {
        "subTotal": 1000,
        "tax": 100,
        "total": 1100
      },
      "address": {
        "billing": {
          "text": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001"
        },
        "shipping": {
          "text": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zip": "10001"
        }
      },
      "items": [
        {
          "_id": "...",
          "name": "iPhone 15",
          "price": 999,
          "quantity": 1
        }
      ],
      "discounts": [
        {
          "name": "Early bird",
          "amount": 50,
          "code": "EARLY50"
        }
      ],
      "customer": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "salesman": {
        "_id": "...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "type": "bill",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### GET /invoice/:id
**Description:** Get invoice by ID

### POST /invoice/
**Description:** Create invoice (with stock validation and reduction)

**Request Body:**
```json
{
  "amount": {
    "subTotal": 1000,
    "tax": 100,
    "total": 1100
  },
  "address": {
    "billing": {
      "text": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    },
    "shipping": {
      "text": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001"
    }
  },
  "items": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15",
      "price": 999,
      "quantity": 1
    }
  ],
  "discounts": [
    {
      "name": "Early bird discount",
      "amount": 50,
      "code": "EARLY50"
    }
  ],
  "customer": "507f1f77bcf86cd799439012",
  "salesman": "507f1f77bcf86cd799439013",
  "type": "bill"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "invoiceId": 100001,
    "amount": { ... },
    "address": { ... },
    "items": [ ... ],
    "discounts": [ ... ],
    "customer": "...",
    "salesman": "...",
    "type": "bill",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Response (400) - Insufficient Stock:**
```json
{
  "success": false,
  "error": "Insufficient stock for iPhone 15. Available: 5, Required: 10"
}
```

### PUT /invoice/:id
**Description:** Update invoice

### DELETE /invoice/:id
**Description:** Delete invoice

### GET /invoice/:id/download
**Description:** Download invoice PDF

---

## Transaction Routes (`/transaction`)

### GET /transaction/
**Description:** List transactions with filters and pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): 'pending', 'completed', 'failed', 'cancelled'
- `invoiceId` (string): Filter by invoice ID
- `customerId` (string): Filter by customer ID
- `salesman` (string): Filter by salesman ID
- `paymentMethod` (string): 'card', 'upi', 'cash'
- `dateFrom` (string): ISO date string
- `dateTo` (string): ISO date string

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "transactionId": 10000001,
      "customerId": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "invoiceId": {
        "_id": "...",
        "invoiceId": 100001
      },
      "paymentMethod": "card",
      "amount": 1100,
      "status": "completed",
      "reference": "TXN123456",
      "salesman": {
        "_id": "...",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": { ... }
}
```

### POST /transaction/
**Description:** Create transactions (multiple payments for one invoice)

**Request Body:**
```json
{
  "invoiceId": "507f1f77bcf86cd799439011",
  "payments": [
    {
      "paymentMethod": "card",
      "amount": 500,
      "reference": "TXN123456",
      "status": "completed"
    },
    {
      "paymentMethod": "cash",
      "amount": 600,
      "status": "pending"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "transactionId": 10000001,
      "customerId": "...",
      "invoiceId": "...",
      "paymentMethod": "card",
      "amount": 500,
      "reference": "TXN123456",
      "status": "completed",
      "salesman": "...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "_id": "...",
      "transactionId": 10000002,
      "customerId": "...",
      "invoiceId": "...",
      "paymentMethod": "cash",
      "amount": 600,
      "status": "pending",
      "salesman": "...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /transaction/
**Description:** Bulk update transactions (same invoice only)

**Request Body:**
```json
{
  "transactionIds": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
  "status": "completed",
  "amount": 550
}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "transactionId": 10000001,
      "status": "completed",
      "amount": 550,
      "updatedAt": "2025-01-01T12:00:00.000Z"
    }
  ]
}
```

---

## Admin Routes (`/admin`)
All admin endpoints require role `admin` or `superadmin` unless noted.

### User Management

#### GET /admin/users
**Description:** List all users

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "manager",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "loginHistory": [...]
    }
  ]
}
```

#### POST /admin/user/add
**Description:** Add user (superadmin can assign admin role)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "salesman"
}
```

#### POST /admin/user/update
**Description:** Update user (superadmin can assign admin/superadmin)

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "updated@example.com",
  "name": "Updated Name",
  "role": "manager"
}
```

#### POST /admin/user/delete
**Description:** Delete user (superadmin only)

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011"
}
```

### Settings (`/admin/settings`)

#### GET /admin/settings/
**Description:** List settings

**Query Parameters:**
- `key` (string): Filter by specific key

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "key": "site.name",
      "value": "Aquazone Store",
      "name": "Site Name",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /admin/settings/:key
**Description:** Get single setting by key

#### POST /admin/settings/
**Description:** Create or update setting

**Request Body:**
```json
{
  "key": "site.name",
  "value": "Aquazone Store",
  "name": "Site Name"
}
```

### Analytics (`/admin/analytics`)

#### GET /admin/analytics/
**Description:** Dashboard analytics data

**Query Parameters:**
- `timeRange` (string): '7d', '30d', '3m', '12m' (default: '30d')

**Response (200):**
```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalProducts": 150,
      "totalValue": 75000,
      "lowStockCount": 5,
      "averagePrice": 500
    },
    "historical": {
      "labels": ["Jan", "Feb", "Mar"],
      "data": [100, 150, 200]
    },
    "trends": {
      "products": "+15%",
      "value": "+25%",
      "stock": "-5%"
    },
    "categoryDistribution": [
      { "name": "Electronics", "value": 60, "count": 30 },
      { "name": "Clothing", "value": 40, "count": 20 }
    ],
    "stockLevels": {
      "healthy": 120,
      "low": 25,
      "outOfStock": 5
    }
  }
}
```

#### GET /admin/analytics/kpis
**Description:** KPIs only

#### GET /admin/analytics/categories
**Description:** Category distribution and details

#### GET /admin/analytics/stock
**Description:** Stock distributions and alerts

#### GET /admin/analytics/products/performance
**Description:** Top performing products

**Query Parameters:**
- `limit` (number): Number of top products
- `sortBy` (string): Sort criteria ('value', 'quantity')

#### GET /admin/analytics/historical
**Description:** Historical data and trends

**Query Parameters:**
- `timeRange` (string): Time period
- `metric` (string): Specific metric or 'all'

#### GET /admin/analytics/health
**Description:** System health score and recommendations

#### POST /admin/analytics/refresh
**Description:** Refresh analytics data

#### POST /admin/analytics/export
**Description:** Export analytics report

**Request Body:**
```json
{
  "format": "json",
  "timeRange": "30d"
}
```

---

## Status Codes
- **200:** Success
- **201:** Created
- **400:** Bad request (validation error)
- **401:** Unauthorized (authentication required)
- **403:** Forbidden (insufficient permissions)
- **404:** Not found
- **500:** Internal server error
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
