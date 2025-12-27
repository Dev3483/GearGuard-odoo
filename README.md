# GearGuard - Intelligent Maintenance Tracker

GearGuard is a production-grade maintenance management system designed to streamline equipment tracking and maintenance request lifecycles. It features a robust role-based access control (RBAC) system for Requesters, Technicians, Managers, and Admins.

## 🚀 Project Overview

The system allows organizations to:
-   **Track Equipment**: Manage lifecycles of assets (Active, Scrapped, Archived).
-   **Manage Teams**: Organize technicians into specialized maintenance teams.
-   **Maintenance Requests**: Automate request creation, assignment, and stage tracking.
-   **Role-Based Dashboards**: Tailored experiences for different user responsibilities.

---

## 🛠️ Technology Stack

### **Frontend**
-   **Framework**: Next.js 14+ (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS / Vanilla CSS
-   **Icons**: Lucide React
-   **Animations**: Framer Motion
-   **State/Data**: Axios with standardized interceptors

### **Backend**
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB Atlas (Cloud)
-   **ORM**: Mongoose
-   **Real-time**: Socket.io
-   **Security**: JWT, BcryptJS, Helmet, Morgan, Express Rate Limit
-   **Validation**: Express Validator
-   **Documentation**: Swagger / OpenAPI 3.0

---

## 📁 Project Structure

```text
GearGuard-odoo/
├── gearguard-backend/      # Node.js API
│   ├── src/
│   │   ├── controllers/    # Business Logic
│   │   ├── models/         # Mongoose Schemas
│   │   ├── routes/         # API Endpoints
│   │   ├── middleware/     # Auth & RBAC
│   │   ├── seed.js         # Cloud Seeding Script
│   │   └── server.js       # Entry Point
│   └── .env                # Backend Configuration
├── gearguard-frontend/     # Next.js Application
│   ├── app/                # Pages & Layouts
│   ├── components/         # UI Elements
│   ├── context/            # Auth State
│   └── lib/                # Axios & Utils
└── README.md               # You are here
```

---

## ⚙️ Setup & Installation

### **1. Prerequisites**
-   Node.js (v18+)
-   NPM or Yarn
-   MongoDB Atlas account (URI ready)

### **2. Backend Setup**
1. Navigate to the backend directory:
   ```bash
   cd gearguard-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in `gearguard-backend/` with the following:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_secret
   NODE_ENV=development
   ```
4. **Seed the Database**:
   Populate the cloud database with demo users and equipment:
   ```bash
   node src/seed.js
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

### **3. Frontend Setup**
1. Navigate to the frontend directory:
   ```bash
   cd gearguard-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in `gearguard-frontend/` to point to the backend:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5001
   ```
4. Start the application:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

| Role       | Email                   | Password    |
|------------|-------------------------|-------------|
| Admin      | `admin@gearguard.com`   | `password123` |
| Manager    | `manager@gearguard.com` | `password123` |
| Technician | `tech@gearguard.com`    | `password123` |
| Requester  | `requester@gearguard.com`| `password123` |

---

## 📖 API Documentation
Once the backend is running, you can access the interactive Swagger documentation at:
**[http://localhost:5001/docs](http://localhost:5001/docs)**

---

## ✨ Key Implementation Details

-   **Standardized Responses**: All API responses follow the `{ success, message, data }` pattern.
-   **RBAC Middleware**: Precise endpoint protection (e.g., only managers can scrap equipment).
-   **Smart Request Actions**: Changing a request to "Scrapped" status automatically marks the associated equipment as "Scrapped" in the database.
-   **Virtual Fields**: The `isOverdue` property is computed on-the-fly based on the `scheduledDate`.
-   **Robust Auth**: Token-based authentication with auto-refresh and defensive `localStorage` handling.
-   **Real-Time Chat**: Context-aware WebSocket messaging system (Socket.io) allowing instantaneous communication between Requesters, Technicians, and Managers within specific Request contexts.
