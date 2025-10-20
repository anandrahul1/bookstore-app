# Online Bookstore Microservices Application

A complete microservices-based online bookstore application built with Node.js and designed for AWS EKS deployment.

## Architecture

This application consists of 7 microservices:

1. **UI Service** (Port 3000) - Frontend web interface
2. **Catalog Service** (Port 3001) - Book catalog management
3. **Cart Service** (Port 3002) - Shopping cart functionality
4. **Order Service** (Port 3003) - Order processing
5. **Payment Service** (Port 3004) - Payment processing
6. **User Service** (Port 3005) - User profile management
7. **Chatbot Service** (Port 3006) - AI-powered customer support

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- MySQL 8.0
- AWS Cognito (for authentication)

## Quick Start

1. **Clone and setup**:
   ```bash
   cd /home/ubuntu/aibookstore
   npm run install:all
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your AWS Cognito details
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - API Gateway: Configure ALB to route to services

## Service Details

### UI Service (3000)
- Serves static frontend
- Routes API calls to backend services
- Health check: `/health`

### Catalog Service (3001)
- `GET /api/books` - List all books
- `GET /api/books/:id` - Get book details
- `GET /api/books/search/:query` - Search books

### Cart Service (3002)
- `GET /api/cart` - Get user cart (auth required)
- `POST /api/cart` - Add item to cart (auth required)
- `PUT /api/cart/:bookId` - Update cart item (auth required)
- `DELETE /api/cart/:bookId` - Remove from cart (auth required)

### Order Service (3003)
- `POST /api/orders` - Create order (auth required)
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get order details (auth required)

### Payment Service (3004)
- `POST /api/payments` - Process payment (auth required)
- `GET /api/payments` - Payment history (auth required)

### User Service (3005)
- `GET /api/profile` - Get user profile (auth required)
- `PUT /api/profile` - Update profile (auth required)
- `POST /api/profile` - Create profile (auth required)

### Chatbot Service (3006)
- `POST /api/chat` - Chat with AI (auth required)
- `GET /api/chat/history` - Chat history (auth required)
- WebSocket support for real-time chat

## Database Schema

The application uses MySQL with the following tables:
- `users` - User profiles
- `categories` - Book categories
- `books` - Book catalog
- `cart_items` - Shopping cart items
- `orders` - Order records
- `order_items` - Order line items
- `payments` - Payment transactions
- `chat_logs` - Chat conversation logs

## Authentication

Uses AWS Cognito for authentication:
- JWT tokens for API access
- User management through Cognito
- Profile data stored in local database

## Deployment

For AWS EKS deployment:
1. Build Docker images for each service
2. Push to ECR
3. Apply Kubernetes manifests
4. Configure ALB Ingress Controller
5. Set up RDS MySQL database
6. Configure AWS Cognito

## Development

Each service can be run independently:
```bash
cd services/catalog-service
npm install
npm run dev
```

## Health Checks

All services expose `/health` endpoints for monitoring and load balancer health checks.

## Cost Estimation

Based on the Technical Architecture Document:
- DEV Environment: $219.38/month
- QA Environment: $219.38/month  
- PROD Environment: $406.92/month
- Total Annual Cost: $10,148.16

## Security Features

- AWS WAF protection
- VPC with private subnets
- JWT authentication
- Input validation
- HTTPS/TLS encryption
- Container security scanning
