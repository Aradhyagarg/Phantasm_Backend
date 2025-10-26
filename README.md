# Phantasm E-Commerce API

A comprehensive RESTful API for a multi-store e-commerce platform with location-based store selection, cart management, and integrated payment processing.

**Live URL:** `https://phantasm-backend.onrender.com`

---

## Features

- **Admin Management**: User authentication and store/product administration
- **Customer Management**: Customer registration, login, and profile management
- **Multi-Store Support**: Location-based store discovery with geospatial queries
- **Product Management**: Products with multiple images, brands, categories, and store associations
- **Shopping Cart**: Complete cart functionality with store-specific items
- **Order Processing**: Order creation with tax calculation
- **Payment Integration**: Razorpay payment gateway integration
- **Image Upload**: Cloudinary integration for product images

---

## Tech Stack

- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Image Storage**: Cloudinary
- **Payment Gateway**: Razorpay
- **Validation**: express-validator

---

## API Endpoints

### Base URL
```
https://phantasm-backend.onrender.com
```

---

## 1. Authentication (Admin)

### Register Admin
```http
POST /api/auth/register
```

**Body:**
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered",
  "user": {
    "_id": "...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Login Admin
```http
POST /api/auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Admin Name",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Get All Users (Admin Only)
```http
GET /api/auth/users
Authorization: Bearer <admin_token>
```

---

## 2. Customer Management

### Register Customer
```http
POST /api/customers/register
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210"
}
```

### Login Customer
```http
POST /api/customers/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "address": "New Delhi, India",
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

### Get Customer Profile
```http
GET /api/customers/profile
Authorization: Bearer <customer_token>
```

### Update Customer Address
```http
PUT /api/customers/profile/address
Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "address": "123 Main Street, Mumbai",
  "latitude": 19.0760,
  "longitude": 72.8777
}
```

---

## 3. Store Management

### Create Store (Admin Only)
```http
POST /api/stores
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "name": "Store Downtown",
  "code": "STORE001",
  "contact": "9876543210",
  "address": "123 Main Street",
  "latitude": 28.6139,
  "longitude": 77.2090
}
```

### Get All Stores
```http
GET /api/stores
```

**Optional Query Parameters:**
- `account`: Filter by admin account ID

### Get Store by ID
```http
GET /api/stores/:id
```

### Get Nearby Stores
```http
GET /api/stores/nearby?lat=28.6139&lng=77.2090&radius=5000
```

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in meters (default: 5000)

**Response:**
```json
{
  "count": 2,
  "stores": [
    {
      "_id": "...",
      "name": "Store Downtown",
      "code": "STORE001",
      "distance_km": 1.5,
      "location": {
        "type": "Point",
        "coordinates": [77.2090, 28.6139]
      }
    }
  ]
}
```

---

## 4. Brand Management

### Create Brand (Admin Only)
```http
POST /api/brands
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "name": "Nike"
}
```

### Get All Brands
```http
GET /api/brands
```

### Get Brand by ID
```http
GET /api/brands/:id
```

---

## 5. Category Management

### Create Category (Admin Only)
```http
POST /api/categories
Authorization: Bearer <admin_token>
```

**Body:**
```json
{
  "name": "Electronics",
  "stores": ["store_id_1", "store_id_2"]
}
```

### Get All Categories
```http
GET /api/categories
```

**Optional Query Parameters:**
- `store_id`: Filter categories by store

### Get Category by ID
```http
GET /api/categories/:id
```

---

## 6. Product Management

### Create Product (Admin Only)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `name`: Product name (required)
- `sku`: Stock Keeping Unit (required)
- `description`: Product description
- `price`: Product price (required, numeric)
- `status`: "active" or "inactive" (default: "active")
- `brand`: Brand ID (required)
- `categories`: Array of category IDs (required, min 1)
- `stores`: Array of store IDs
- `images`: Multiple image files (max 5)

**Example using curl:**
```bash
curl -X POST https://phantasm-backend.onrender.com/api/products \
  -H "Authorization: Bearer <admin_token>" \
  -F "name=iPhone 14" \
  -F "sku=IPH14-001" \
  -F "description=Latest iPhone model" \
  -F "price=79999" \
  -F "brand=brand_id" \
  -F "categories[]=category_id" \
  -F "stores[]=store_id" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Get All Products
```http
GET /api/products
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search by product name
- `store_id`: Filter by store
- `brand_id`: Filter by brand
- `category_id`: Filter by category

**Example:**
```http
GET /api/products?page=1&limit=20&search=phone&brand_id=123
```

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### Get Product by ID
```http
GET /api/products/:id
```

### Get Products by Category
```http
GET /api/products/category/:categoryId
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page

---

## 7. Cart Management

### Get Customer Cart
```http
GET /api/cart
Authorization: Bearer <customer_token>
```

### Add or Update Cart Item
```http
POST /api/cart/items
Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "product": "product_id",
  "store": "store_id",
  "quantity": 2
}
```

### Update Item Quantity
```http
PUT /api/cart/items/:itemId
Authorization: Bearer <customer_token>
```

**Body:**
```json
{
  "quantity": 3
}
```

### Remove Item from Cart
```http
DELETE /api/cart/items/:itemId
Authorization: Bearer <customer_token>
```

### Clear Cart
```http
DELETE /api/cart
Authorization: Bearer <customer_token>
```

---

## 8. Order Management

### Create Order from Cart
```http
POST /api/orders/create
Authorization: Bearer <customer_token>
```

**Response:**
```json
{
  "message": "Order created",
  "order": {
    "_id": "order_id",
    "customer": "customer_id",
    "items": [...],
    "subtotal": 79999,
    "tax": 14399.82,
    "total": 94398.82,
    "status": "PAYMENT_PENDING"
  }
}
```

**Note:** Tax percentage is configured via `TAX_PERCENT` environment variable. Cart is automatically cleared after order creation.

### Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <customer_token>
```

---

## 9. Payment Management

### Create Razorpay Order
```http
POST /api/payments/create/:orderId
Authorization: Bearer <customer_token>
```

**Response:**
```json
{
  "orderId": "order_id",
  "razorpayOrderId": "order_MNbcdefghijk",
  "amount": 9439882,
  "currency": "INR"
}
```

**Note:** Amount is in paisa (multiply by 100). Use the `razorpayOrderId` to initiate payment on the frontend using Razorpay SDK.

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. There are two types of tokens:

### Admin Token
- Used for administrative operations (creating products, stores, brands, categories)
- Obtained from `/api/auth/login`
- Include in requests: `Authorization: Bearer <admin_token>`

### Customer Token
- Used for customer operations (cart, orders, profile)
- Obtained from `/api/customers/login`
- Include in requests: `Authorization: Bearer <customer_token>`

---

## Error Handling

The API returns appropriate HTTP status codes and error messages:

### Common Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `500` - Internal server error

### Error Response Format
```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Valid email required"
    }
  ]
}
```

---

## Data Models

### Order Status Flow
1. `CREATED` - Order initialized
2. `PAYMENT_PENDING` - Awaiting payment
3. `PAID` - Payment successful
4. `FAILED` - Payment failed
5. `CANCELLED` - Order cancelled

### Product Status
- `active` - Product is available
- `inactive` - Product is hidden

---

## Environment Variables Required

For deployment, the following environment variables are needed:

```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
TAX_PERCENT=18
```

---

## Testing the API

### Using Postman/Insomnia
1. Import the endpoints into your API client
2. Register an admin user
3. Login to get the JWT token
4. Use the token in the Authorization header for protected routes

### Using curl
```bash
# Register admin
curl -X POST https://phantasm-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"test123"}'

# Login
curl -X POST https://phantasm-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# Create store (use token from login)
curl -X POST https://phantasm-backend.onrender.com/api/stores \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Main Store","code":"MS001","latitude":28.6139,"longitude":77.2090}'
```

---

## Key Features Explained

### Multi-Store Architecture
- Products can be associated with multiple stores
- Customers can only add products to cart from stores where they're available
- Location-based store discovery using MongoDB geospatial queries

### Cart Validation
- Validates product availability in selected store before adding to cart
- Stores price snapshot to handle price changes
- Automatic cart clearing after order creation

### Order Processing
- Creates order from cart with current product prices
- Calculates tax based on configured percentage
- Integrates with Razorpay for payment processing

### Image Upload
- Supports multiple product images (up to 5)
- Uploads to Cloudinary for CDN delivery
- Returns secure URLs in product data

---

## Notes

- Default customer location: New Delhi, India (28.6139, 77.2090)
- Maximum products per page: 100
- Default page size: 10 items
- Payment amounts in Razorpay are in paisa (₹1 = 100 paisa)
- All timestamps are in UTC
- MongoDB uses 2dsphere index for geospatial queries

---

## Support

For issues or questions, please refer to the API response messages or check the server logs for detailed error information.

---

## License

This API is part of the Phantasm E-Commerce platform.
