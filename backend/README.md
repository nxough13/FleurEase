# FleurEase Backend - Where Every Bloom Meets Elegance 🌸

## Setup Complete! ✅

### Project Structure
```
backend/
├── config/
│   ├── .env ✅ (UPDATE WITH YOUR CREDENTIALS!)
│   └── database.js ✅
├── models/
│   ├── product.js ✅ (Flower categories)
│   ├── user.js ✅
│   └── order.js ✅
├── controllers/
│   ├── product.js ✅
│   ├── auth.js ✅
│   └── order.js ✅
├── routes/
│   ├── product.js ✅
│   ├── auth.js ✅
│   └── order.js ✅
├── middlewares/
│   └── auth.js ✅
├── utils/
│   ├── apiFeatures.js ✅
│   ├── multer.js ✅
│   └── sendEmail.js ✅
├── server.js ✅
├── app.js ✅
└── package.json ✅
```

## Installation

```bash
npm install
```

## Update .env File

Edit `config/.env` with your credentials:

```
DB_URI=mongodb+srv://neoughpch03_db_user:HWStSdqsqte7ywdf@cluster0.i0jqpqi.mongodb.net/FleurEase?retryWrites=true&w=majority&appName=Cluster0
```

## Run Server

```bash
npm start
```

Server runs on: http://localhost:4001

## API Endpoints

### Products
- GET `/api/v1/products` - Get all products
- GET `/api/v1/product/:id` - Get single product
- POST `/api/v1/admin/product/new` - Create product (Admin)
- PUT `/api/v1/admin/product/:id` - Update product (Admin)
- DELETE `/api/v1/admin/product/:id` - Delete product (Admin)

### Authentication
- POST `/api/v1/register` - Register user
- POST `/api/v1/login` - Login user
- GET `/api/v1/me` - Get user profile
- PUT `/api/v1/me/update` - Update profile
- PUT `/api/v1/password/update` - Update password

### Orders
- POST `/api/v1/order/new` - Create order
- GET `/api/v1/orders/me` - My orders
- GET `/api/v1/order/:id` - Get order details
- GET `/api/v1/admin/orders` - All orders (Admin)

### Reviews
- PUT `/api/v1/review` - Create/Update review
- GET `/api/v1/reviews` - Get product reviews
- DELETE `/api/v1/reviews` - Delete review (Admin)
