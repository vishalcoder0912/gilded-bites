# Noir Sane Backend

Express + Prisma + PostgreSQL backend for the Noir Sane shopping website.

## Local Setup

```bash
cp .env.example .env
docker compose up -d postgres
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run backend:dev
```

Backend: `http://localhost:4000`  
Swagger: `http://localhost:4000/docs`

## Main Commands

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run backend:dev
npm run backend:test
```

## Seed Login

Admin:

```text
admin@noirsane.com
Admin@12345
```

Delivery partner:

```text
delivery@noirsane.com
Admin@12345
```

## Example Requests

Register:

```bash
curl -X POST http://localhost:4000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Aanya\",\"email\":\"aanya@example.com\",\"password\":\"Password123\"}"
```

Login:

```bash
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@noirsane.com\",\"password\":\"Admin@12345\"}"
```

Create product:

```bash
curl -X POST http://localhost:4000/api/admin/products -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Rose Bonbon\",\"description\":\"Raspberry rose bonbon\",\"price\":149000,\"categoryId\":\"CATEGORY_ID\",\"imageUrls\":[]}"
```

Add cart item:

```bash
curl -X POST http://localhost:4000/api/cart/items -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"productId\":\"PRODUCT_ID\",\"quantity\":2}"
```

Place order:

```bash
curl -X POST http://localhost:4000/api/orders -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"paymentMethod\":\"UPI\",\"address\":{\"fullName\":\"Aanya\",\"phone\":\"9999999999\",\"addressLine1\":\"Street 1\",\"city\":\"Mumbai\",\"state\":\"MH\",\"pincode\":\"400001\"}}"
```

Submit UPI payment:

```bash
curl -X POST http://localhost:4000/api/orders/ORDER_ID/payment-submit -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d "{\"paymentReferenceNumber\":\"412980134567\"}"
```

Track order:

```bash
curl http://localhost:4000/api/orders/ORDER_ID/tracking -H "Authorization: Bearer TOKEN"
```
