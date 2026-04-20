# 🍽️ The Culinary Architect — Restaurant Management System

A full-stack MERN application for restaurant management with role-based access control.

---

## 🗂️ Project Structure

```
restaurant-management/
├── backend/          # Node.js + Express + MongoDB API
└── frontend/         # React.js UI
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

## 🚀 Quick Start

### 1. Clone / Extract the Project

### 2. Setup Backend

```bash
cd backend
npm install
```

Edit `.env` and set your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/culinary_architect
JWT_SECRET=your_secret_key_here
PORT=5000
```

Seed the database with demo data:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev     # development (with nodemon)
npm start       # production
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm start
```

The app opens at **http://localhost:3000**

---

## 🔐 Demo Login Credentials

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@culina.com         | admin123     |
| Staff    | julian@culina.com        | staff123     |
| Customer | julian.c@email.com       | customer123  |

---

## 📋 Features by Role

### 👑 Admin
- Dashboard with revenue charts & analytics
- Menu management (add, edit, delete, toggle availability)
- Order management (Kanban board + status updates)
- Table reservations system
- Billing & payment processing
- Staff management (CRUD)
- Customer CRM (loyalty tiers, order history)

### 👨‍🍳 Staff
- Dashboard overview
- Order management & status updates
- Reservations management
- Billing & payment processing
- Customer lookup

### 🙋 Customer
- Browse menu by category
- Add items to cart & place orders
- View order history with live status

---

## 🔌 API Endpoints

### Auth
| Method | Route                | Access  |
|--------|----------------------|---------|
| POST   | /api/auth/register   | Public  |
| POST   | /api/auth/login      | Public  |
| GET    | /api/auth/me         | Private |
| PUT    | /api/auth/profile    | Private |

### Menu
| Method | Route            | Access       |
|--------|------------------|--------------|
| GET    | /api/menu        | Public       |
| GET    | /api/menu/stats  | Admin/Staff  |
| POST   | /api/menu        | Admin        |
| PUT    | /api/menu/:id    | Admin        |
| DELETE | /api/menu/:id    | Admin        |

### Orders
| Method | Route                    | Access      |
|--------|--------------------------|-------------|
| GET    | /api/orders              | All roles   |
| POST   | /api/orders              | All roles   |
| PUT    | /api/orders/:id/status   | Admin/Staff |
| DELETE | /api/orders/:id          | Admin       |

### Reservations
| Method | Route                   | Access      |
|--------|-------------------------|-------------|
| GET    | /api/reservations       | All roles   |
| POST   | /api/reservations       | All roles   |
| PUT    | /api/reservations/:id   | Admin/Staff |
| DELETE | /api/reservations/:id   | Admin/Staff |

### Staff, Customers, Billing, Dashboard, Tables
- See individual route files in `/backend/routes/`

---

## 🛠️ Tech Stack

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs  
**Frontend:** React.js, React Router v6, Axios, Recharts  
**Fonts:** Cormorant Garamond + DM Sans  
**Design:** Custom CSS matching The Culinary Architect brand

---

## 🌐 Environment Variables

### Backend `.env`
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/culinary_architect
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
NODE_ENV=development
```

### Frontend
The frontend proxies API requests to `http://localhost:5000` via the `proxy` field in `package.json`. For production, set `REACT_APP_API_URL` and update `src/utils/api.js`.

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build

# Then serve the build/ folder with your preferred static server
# or configure Express to serve it
```
