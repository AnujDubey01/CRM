# ERP CRM Backend

Backend API for an ERP + CRM system built with Node.js, Express, MySQL, `mysql2/promise`, JWT authentication, and role-based authorization.

## Tech Stack

- Node.js
- Express.js
- MySQL
- mysql2/promise
- JWT
- bcrypt
- dotenv
- cors

## Project Structure

```text
config/
controllers/
middlewares/
models/
routes/
utils/
server.js
```

The application keeps the existing flow:

```text
Route -> Middleware -> Controller -> Model -> MySQL
```

## Environment Variables

Create a `.env` file in `Backend/` using `.env.example`.

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=erp_crm
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
```

`JWT_SECRET` is the currently used variable. `ACCESS_TOKEN_SECRET` is also supported as a fallback.

## Run Locally

```bash
npm install
npm run dev
```

Smoke test:

```bash
npm run test:smoke
```

Optional overrides for the smoke test:

```env
BASE_URL=http://127.0.0.1:5000
SMOKE_PASSWORD=StrongPass123!
```

## Authentication

Public endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

Protected endpoints require:

```http
Authorization: Bearer <token>
```

JWT payload is attached to `req.user`.

## Roles

- `admin`: full backend access
- `sales`: customers, follow-ups, product viewing, challans, dashboard
- `warehouse`: product viewing, inventory, stock movement history, dashboard
- `accounts`: currently defined in the database enum, but no dedicated business routes were added in this pass

## API Endpoints

| Method | Endpoint | Auth | Role | Purpose |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Public | Register user |
| POST | `/api/auth/login` | No | Public | Login user |
| GET | `/api/auth/me` | Yes | Any authenticated | Get current user |
| POST | `/api/customers` | Yes | `sales`, `admin` | Create customer |
| GET | `/api/customers` | Yes | `sales`, `admin` | List/search customers |
| GET | `/api/customers/:id` | Yes | `sales`, `admin` | Get customer detail |
| PUT | `/api/customers/:id` | Yes | `sales`, `admin` | Update customer |
| DELETE | `/api/customers/:id` | Yes | `sales`, `admin` | Delete customer |
| POST | `/api/customers/:id/followups` | Yes | `sales`, `admin` | Create follow-up |
| GET | `/api/customers/:id/followups` | Yes | `sales`, `admin` | List follow-ups |
| POST | `/api/products` | Yes | `admin` | Create product |
| GET | `/api/products` | Yes | `sales`, `warehouse`, `admin` | List/search products |
| GET | `/api/products/low-stock` | Yes | `sales`, `warehouse`, `admin` | Get low-stock products |
| GET | `/api/products/:id` | Yes | `sales`, `warehouse`, `admin` | Get product detail |
| PUT | `/api/products/:id` | Yes | `admin` | Update product |
| DELETE | `/api/products/:id` | Yes | `admin` | Delete product |
| POST | `/api/products/:id/stock/in` | Yes | `warehouse`, `admin` | Add stock with movement log |
| POST | `/api/products/:id/stock/out` | Yes | `warehouse`, `admin` | Remove stock with movement log |
| GET | `/api/products/:id/movements` | Yes | `warehouse`, `admin` | Get stock movement history |
| POST | `/api/challans` | Yes | `sales`, `admin` | Create draft challan |
| GET | `/api/challans` | Yes | `sales`, `admin` | List/search/filter challans |
| GET | `/api/challans/:id` | Yes | `sales`, `admin` | Get challan detail |
| POST | `/api/challans/:id/confirm` | Yes | `sales`, `admin` | Confirm draft challan and reduce stock |
| POST | `/api/challans/:id/cancel` | Yes | `sales`, `admin` | Cancel draft challan |
| GET | `/api/dashboard` | Yes | `sales`, `warehouse`, `admin` | Dashboard counts |
| GET | `/api/dashboard/low-stock` | Yes | `sales`, `warehouse`, `admin` | Dashboard low-stock list |

## Example Requests

Create customer:

```http
POST /api/customers
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "name": "Acme Traders",
  "mobile": "9876543210",
  "customer_type": "wholesale",
  "business_name": "Acme Traders Pvt Ltd"
}
```

Create draft challan:

```http
POST /api/challans
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 1,
      "quantity": 5
    },
    {
      "product_id": 2,
      "quantity": 3
    }
  ]
}
```

Success response:

```json
{
  "success": true,
  "message": "Challan confirmed successfully",
  "data": {
    "challan": {
      "id": 1,
      "challan_number": "CH-000001",
      "status": "confirmed"
    }
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Insufficient stock for product Cement"
}
```

## Database Notes

This implementation matches the current live schema:

- challan header table: `sales_challans`
- challan item table: `challan_items`
- challan statuses: `draft`, `confirmed`, `cancelled`
- product location column: `warehouse`
- user roles enum includes `admin`, `sales`, `warehouse`, `accounts`

## Transaction Behavior

- Stock in/out uses a single transaction and one MySQL connection.
- Challan confirmation locks the challan and product rows before reducing stock.
- Challan confirmation writes `stock_movements` in the same transaction as stock deduction and status update.
- If any item fails stock validation, the entire confirmation is rolled back.

## Known Constraint

Confirmed challans are not auto-cancellable in this schema because there is no approved reversal workflow or dedicated reversal status/history table. The API returns a conflict instead of silently mutating stock.
