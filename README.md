# 🎟️ GenSaas Event Management System

**GenSaas** is a high-fidelity, premium event management platform designed for seamless registrations, professional analytics, and real-time live sessions. 

---

## 🚀 Quick Setup Guide

Follow these steps to get the entire project running on your local machine.

### 1. Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (via XAMPP, WAMP, or standalone installation)
- **Web Browser** (Chrome/Edge/Firefox)

---

### 2. Database Configuration (MySQL)
1. Open **XAMPP Control Panel** and start **MySQL**.
2. Go to [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Create a new database named `gensaas_events`.
4. Select the `gensaas_events` database, go to the **Import** tab.
5. Choose the file: `server/database/schema.sql` and click **Import**.
6. (Optional) For demo data, import `server/database/dummy_data_v2.sql`.

> [!IMPORTANT]
> Update your database credentials in `server/.env`.
> Set `DB_PASS` to your MySQL password (leave blank if none).

---

### 3. Backend Setup (Node.js)
```bash
cd server
npm install
npm start
```
The backend API will be running at: `http://localhost:5000`

---

### 4. Frontend Setup (React)
Open a new terminal:
```bash
# From the root directory
npm install
npm run dev
```
The application will be accessible at: `http://localhost:5173`

---

## 💎 Key Features

### 📡 Real-time Live Sessions
Attendees can join live video sessions directly within the app. Features include:
- **Mock Video Stream**: High-fidelity presentation view.
- **Interactive Chat**: Real-time messaging with other attendees and hosts.
- **Participant List**: See who else is in the session.
- **Meeting Controls**: Mute, Camera toggle, and Recording simulation.

### 🎫 Interactive Ticketing
Revamped "My Tickets" section with a premium digital ticket design:
- **Dynamic QR Code**: Unique visual identification for each ticket.
- **Instant Join**: Direct "Join Live Session" button on the ticket.
- **Schedule Sync**: Shows event time and location clearly.

### 📊 Admin Control Center
- **Live Analytics**: Real-time registration monitoring with Recharts graphs.
- **Event Management**: Create, update, and manage speakers and events.
- **CMS Integration**: Customize website logo, name, and featured slides.

---

## 🔐 Admin Credentials
- **Admin ID:** `sundar`
- **Admin Password:** `sundar123`

---

## 🛠️ Troubleshooting
- **Database Connection Error**: Ensure MySQL is running on port 3306 and the credentials in `server/.env` are correct.
- **Port Conflict**: If port 5000 is used, change `PORT` in `server/.env`.
- **Mock Mode**: If the backend is offline, the app will automatically switch to Mock Mode using internal dummy data for demonstration purposes.

---

## 📂 Project Structure
- `/src`: Frontend React components and logic.
- `/server`: Express.js backend and API routes.
- `/server/database`: SQL schema and migration files.
- `/server/uploads`: Storage for event banners and speaker photos.
- `/public`: Static assets.

---
*Developed with ❤️ for Advanced Event Management.*
