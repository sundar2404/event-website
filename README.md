# GenSaas Event Registration App

## Admin Panel Credentials

- **Admin ID:** `sundar`
- **Admin Password:** `sundar123`

## Application Access

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:500
## 🚀 EventCheckInApp: Generation Saas (GenSaas)

**The ultimate high-fidelity event management system designed for seamless registrations, professional analytics, and biometric-grade pass generation.**

---

## 💎 Premium Features

### 📊 Advanced Analytics & Platform Insights
*   **Real-time Flow Monitoring**: Beautifully visualized registration trends over 30 days using Recharts.
*   **Mission Performance**: Instant success rate metrics and event popularity distribution.
*   **Telemetry Log**: Live registration feed tracking attendee entry in real-time.

### 🌓 Professional UX & UI
*   **Glassmorphic Design**: Modern, premium aesthetics with fluid animations powered by Framer Motion.
*   **Adaptive Roles**: Separate, secure portals for **Missions (Attendees)** and **Control (Admins)**.
*   **Post-Registration Telemetry**: Auto-generating professional event passes with custom templates.

### 🔌 Intelligent Standalone Mode
*   **Database-Independent Demo**: The app automatically detects if the backend in unreachable and switches to **Mock Mode**, providing a full, rich dataset for presentations without any database setup required.

---

## 🏗️ Technical Architecture

### Frontend (React + Vite)
*   **Recharts**: High-end data visualization components.
*   **Framer Motion**: State-of-the-art micro-interactions.
*   **Lucide React**: Curated, unified iconography.
*   **Axios Interceptors**: Intelligent failover logic for offline demonstrations.

### Backend (Node.js + Express)
*   **JWT Security**: Robust authentication for administrators.
*   **MySQL (XAMPP)**: Professional-grade data persistence.
*   **Gemini AI Integration**: Prepared for AI-driven insights and features.

---

## 🚀 Strategic Setup

### 1. Database Configuration (Optional for Demo)
If you wish to use the real database, ensure **XAMPP/MySQL** is running and execute:
```bash
cd server
node scripts/load_dummy_v2.js
```

### 2. Backend Initialization
```bash
cd server
npm install
npm start
```

### 3. Frontend Launcher
```bash
cd ..
npm install
npm run dev
```

---

## 🏁 Mission Credentials (Admin)
*   **User ID**: `sundar`
*   **Password**: `sundar123`

---

## 🛡️ Git Protocol
The project is configured with a robust `.gitignore` to protect sensitive environment variables (`.env`) and ensure clean repository management.
`baseURL` in `src/utils/api.js` to your production domain.
3. Build the frontend using `npm run build` and serve the `dist` folder.
4. Host the `server` directory using PM2 or similar Node.js process managers.
5.
