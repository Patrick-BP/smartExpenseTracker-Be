# Smart Expense Tracker API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Recurring Transactions

#### Create Recurring Transaction
```http
POST /recurring
```
**Request Body:**
```json
{
  "type": "expense",
  "amount": 100,
  "category": "Food",
  "description": "Weekly groceries",
  "paymentMethod": "Credit Card",
  "startDate": "2025-06-17T00:00:00.000Z",
  "endDate": null,
  "frequency": "weekly",
  "interval": 1
}
```
**Response:**
```json
{
  "_id": "...",
  "user": "...",
  "type": "expense",
  "amount": 100,
  "category": "Food",
  "description": "Weekly groceries",
  "paymentMethod": "Credit Card",
  "startDate": "2025-06-17T00:00:00.000Z",
  "endDate": null,
  "frequency": "weekly",
  "interval": 1,
  "nextOccurrence": "2025-06-17T00:00:00.000Z",
  "lastGenerated": null,
  "active": true,
  ...
}
```

#### Get All Recurring Transactions
```http
GET /recurring
```
**Response:**
```json
[
  { /* RecurringTransaction object */ },
  ...
]
```

#### Get Recurring Transaction by ID
```http
GET /recurring/:id
```
**Response:**
```json
{ /* RecurringTransaction object */ }
```

#### Update Recurring Transaction
```http
PUT /recurring/:id
```
**Request Body:**
```json
{
  "amount": 120,
  "endDate": "2025-12-31T00:00:00.000Z"
}
```
**Response:**
```json
{ /* Updated RecurringTransaction object */ }
```

#### Delete Recurring Transaction
```http
DELETE /recurring/:id
```
**Response:**
```json
{ "message": "Deleted" }
```

### User Management

#### Forgot Password
```http
POST /auth/forgot-password
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "message": "If an account with that email exists, a reset link has been sent."
}
```

#### Reset Password
```http
POST /auth/reset-password
```
**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "YourNewSecurePassword123"
}
```
**Response (success):**
```json
{
  "message": "Password has been reset."
}
```
**Response (error):**
```json
{
  "error": "Invalid or expired token"
}
```

**Security Notes:**
- The reset link is valid for 1 hour.
- The reset endpoint does not require authentication (token-based).
- Generic response is always returned for /forgot-password for privacy.

#### Register New User
```http
POST /users/register
```

**Request Body:**
```json
{
  "name": "patrick",
  "email": "test@gmail.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "string",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "monthlyBudget": "number",
    "categoryBudgets": [{
      "category": "string",
      "limit": "number"
    }]
  }
}
```

#### Login
```http
POST /users/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** Same as Register

#### Get User Profile
```http
GET /users/profile
```

**Response:**
```json
{
  "_id": "string",
  "name": "string",
  "email": "string",
  "monthlyBudget": "number",
  "categoryBudgets": [{
    "category": "string",
    "limit": "number"
  }]
}
```

#### Update Profile
```http
PATCH /users/profile
```

**Request Body:**
```json
{
  "name": "string",
  "monthlyBudget": "number",
  "categoryBudgets": [{
    "category": "string",
    "limit": "number"
  }]
}
```

**Response:** Updated user profile

#### Update Password
```http
PATCH /users/password
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "message": "Password updated successfully"
}
```

### Expense Management

#### Create Expense
```http
POST /expenses
```

**Request Body:**
```json
{
  "amount": "number",
  "category": "string",
  "description": "string",
  "date": "string (ISO date)",
  "paymentMethod": "string",
  "location": "string",
  "tags": ["string"],
  "isRecurring": "boolean",
  "recurringFrequency": "string"
}
```

**Response:** Created expense object

#### Get All Expenses
```http
GET /expenses
```

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `category`: string
- `startDate`: string (ISO date)
- `endDate`: string (ISO date)
- `sortBy`: string (field:order, e.g., "date:desc")

**Response:**
```json
{
  "expenses": [{
    "_id": "string",
    "amount": "number",
    "category": "string",
    "description": "string",
    "date": "string",
    "paymentMethod": "string",
    "location": "string",
    "tags": ["string"],
    "isRecurring": "boolean",
    "recurringFrequency": "string"
  }],
  "total": "number",
  "page": "number",
  "totalPages": "number"
}
```

#### Get Monthly Statistics
```http
GET /expenses/stats
```

**Query Parameters:**
- `month`: number (1-12)
- `year`: number

**Response:**
```json
{
  "month": 6,
  "year": 2025,
  "totalExpenses": 1200.50,
  "totalIncome": 2500.00,
  "expenseCategoryTotals": [
    { "_id": "food", "total": 400, "count": 10 },
    { "_id": "transport", "total": 200, "count": 4 }
  ],
  "incomeCategoryTotals": [
    { "_id": "salary", "total": 2000, "count": 1 }
  ],
  "netIncome": 1299.50
}
```

#### Get Weekly Statistics
```http
GET /expenses/stats/week
```

**Query Parameters:**
- `weekStart`: string (ISO date, required)
- `weekEnd`: string (ISO date, required)

**Response:**
```json
{
  "weekStart": "2025-06-09T00:00:00.000Z",
  "weekEnd": "2025-06-15T23:59:59.999Z",
  "totalExpenses": [
    { "_id": "food", "total": 120, "count": 3 },
    { "_id": "transport", "total": 60, "count": 1 }
  ],
  "totalIncome": [
    { "_id": "salary", "total": 500, "count": 1 }
  ]
}
```

#### Get Yearly Statistics
```http
GET /expenses/stats/year
```

**Query Parameters:**
- `year`: number (required)

**Response:**
```json
{
  "year": 2025,
  "totalExpenses": [
    { "_id": "food", "total": 2400, "count": 30 },
    { "_id": "transport", "total": 900, "count": 12 }
  ],
  "totalIncome": [
    { "_id": "salary", "total": 24000, "count": 12 }
  ]
}
```

#### Get Timeline Statistics
```http
GET /expenses/stats/timeline
```

**Query Parameters:**
- `period`: string (`week`, `month`, or `year`, required)
- `year`: number (required)
- `month`: number (1-12, required for `month` period)
- `type`: string (`expense` or `income`, required)

**Response:**
```json
{
  "timeline": [
    { "_id": { "day": 1 }, "total": 50 },
    { "_id": { "day": 2 }, "total": 30 }
  ]
}
```

#### Get Specific Expense
```http
GET /expenses/:id
```

**Response:** Single expense object

#### Update Expense
```http
PATCH /expenses/:id
```

**Request Body:** Same as Create Expense (all fields optional)

**Response:** Updated expense object

#### Delete Expense
```http
DELETE /expenses/:id
```

**Response:**
```json
{
  "message": "Expense deleted successfully"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "string",
  "message": "string"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting
- Window: 15 minutes
- Max Requests: 100 per IP

## Security
- All endpoints use HTTPS
- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt
- CORS is enabled for specified origins only