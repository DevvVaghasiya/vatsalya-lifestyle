# Vatsalya Lifestyle — Textile Management System

Full-stack enterprise textile management portal for managing orders, inquiries, inventory, clients, and dispatch operations.

## Deployment (Docker)

The project is containerized using Docker. This is the recommended way to deploy the entire stack.

### Prerequisites
- Docker and Docker Compose installed.

### Run with Docker Compose
```bash
docker-compose up --build
```

This will start:
- **MySQL** on port `3307` (mapped from 3306)
- **Backend** on port `8080`
- **Frontend** on port `80`

Access the app at `http://localhost`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Backend | Spring Boot 3 (Java) |
| Database | MySQL |
| Styling | Custom CSS + Framer Motion |
| PDF Export | jsPDF |
| Charts | Recharts |

## Project Structure

```
textile/
├── backend/     → Spring Boot REST API (port 8080)
├── frontend/    → Vite React SPA (port 5173)
└── README.md
```

## Quick Start

### 1. Start Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Production Build
```bash
cd frontend
npm run build
# Output in frontend/dist/
```

## Environment Configuration

Copy `frontend/.env.example` to `frontend/.env` and set:
```
VITE_API_URL=http://localhost:8080
```

For production deployment, set this to your live backend URL.

## Features

- 📊 Real-time Dashboard with analytics
- 📋 Order Management (create, track, update status)
- 🔍 Inquiry Tracking with PDF export
- 📦 Inventory Management with QR codes
- 👥 Client Management
- 🔐 Authentication (Login/Signup)
- 📄 PDF Reports for all sections
- 👨‍💼 Admin Dashboard for user management
